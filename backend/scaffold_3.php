<?php
$baseDir = __DIR__;
function makeDir($path) { if (!is_dir($path)) mkdir($path, 0755, true); }
function writeFile($path, $content) { makeDir(dirname($path)); file_put_contents($path, trim($content) . "\n"); }

// Route
writeFile($baseDir . '/routes/api.php', <<<EOT
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PilotOrderController;
use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PilotController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AddressController;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::get('track/{tracking_code}', [TrackingController::class, 'track']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::put('auth/me', [AuthController::class, 'updateProfile']);
        
        Route::apiResource('addresses', AddressController::class);
        Route::apiResource('customer/orders', CustomerOrderController::class)->only(['index', 'store']);
        
        Route::middleware('role:admin,manager')->group(function () {
            Route::apiResource('orders', OrderController::class);
            Route::post('orders/{id}/assign', [OrderController::class, 'assign']);
            Route::get('pilots/locations', [LocationController::class, 'allLocations']);
            Route::get('stream/locations', [LocationController::class, 'stream']);
            Route::get('pilots', [PilotController::class, 'index']);
            Route::get('dashboard/stats', [DashboardController::class, 'stats']);
            Route::get('dashboard/recent-deliveries', [DashboardController::class, 'recentDeliveries']);
        });
        
        Route::middleware('role:admin')->group(function () {
            Route::apiResource('users', UserController::class);
        });
        
        Route::middleware('role:pilot')->group(function () {
            Route::get('pilot/orders', [PilotOrderController::class, 'index']);
            Route::put('pilot/orders/{id}/status', [PilotOrderController::class, 'updateStatus']);
            Route::post('pilot/orders/{id}/pod', [PilotOrderController::class, 'pod']);
            Route::post('pilot/location', [LocationController::class, 'store']);
            Route::put('pilot/toggle-online', [LocationController::class, 'toggleOnline']);
        });
    });
});
EOT);

// Middleware
writeFile($baseDir . '/app/Http/Middleware/CheckRole.php', <<<EOT
<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
class CheckRole {
    public function handle(Request \$request, Closure \$next, ...\$roles) {
        if (!\$request->user() || !in_array(\$request->user()->role, \$roles)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized access'], 403);
        }
        return \$next(\$request);
    }
}
EOT);

// Add middleware alias in bootstrap/app.php
$bootstrapApp = file_get_contents($baseDir . '/bootstrap/app.php');
$bootstrapApp = str_replace(
    '->withMiddleware(function (Middleware $middleware) {',
    "->withMiddleware(function (Middleware \$middleware) {\n        \$middleware->alias(['role' => \\App\\Http\\Middleware\\CheckRole::class]);",
    $bootstrapApp
);
file_put_contents($baseDir . '/bootstrap/app.php', $bootstrapApp);

// Simplified Controllers (just putting them in one big string block or mapping)
$controllers = [
    'AuthController' => <<<EOT
<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
class AuthController extends Controller {
    public function register(Request \$request) {
        \$data = \$request->validate(['name'=>'required|string', 'phone'=>'required|unique:users', 'password'=>'required|confirmed', 'email'=>'nullable|email|unique:users']);
        \$data['password'] = Hash::make(\$data['password']);
        \$user = User::create(\$data);
        return response()->json(['success'=>true, 'data'=>\$user, 'message'=>'Registered']);
    }
    public function login(Request \$request) {
        \$request->validate(['phone'=>'required', 'password'=>'required']);
        \$user = User::where('phone', \$request->phone)->first();
        if(!\$user || !Hash::check(\$request->password, \$user->password)) return response()->json(['success'=>false, 'message'=>'Invalid credentials'], 401);
        return response()->json(['success'=>true, 'data'=>['token'=>\$user->createToken('auth')->plainTextToken, 'user'=>\$user], 'message'=>'Logged in']);
    }
    public function logout(Request \$request) {
        \$request->user()->currentAccessToken()->delete();
        return response()->json(['success'=>true, 'data'=>[], 'message'=>'Logged out']);
    }
    public function me(Request \$request) {
        return response()->json(['success'=>true, 'data'=>\$request->user(), 'message'=>'Profile']);
    }
    public function updateProfile(Request \$request) {
        \$request->user()->update(\$request->all());
        return response()->json(['success'=>true, 'data'=>\$request->user(), 'message'=>'Updated']);
    }
}
EOT,
    'OrderController' => <<<EOT
<?php
namespace App\Http\Controllers;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Http\Request;
class OrderController extends Controller {
    public function index(Request \$request) {
        \$orders = Order::with('customer', 'pilot')->paginate();
        return response()->json(['success'=>true, 'data'=>\$orders->items(), 'meta'=>['current_page'=>\$orders->currentPage(), 'last_page'=>\$orders->lastPage(), 'total'=>\$orders->total()]]);
    }
    public function store(Request \$request, OrderService \$service) {
        \$order = \$service->create(\$request->all(), \$request->user());
        return response()->json(['success'=>true, 'data'=>\$order, 'message'=>'Created']);
    }
    public function show(\$id) {
        \$order = Order::with('customer', 'pilot', 'proof', 'statusLogs')->findOrFail(\$id);
        return response()->json(['success'=>true, 'data'=>\$order, 'message'=>'Ok']);
    }
    public function update(Request \$request, \$id, OrderService \$service) {
        \$order = Order::findOrFail(\$id);
        \$order = \$service->update(\$order, \$request->all());
        return response()->json(['success'=>true, 'data'=>\$order, 'message'=>'Updated']);
    }
    public function destroy(\$id, OrderService \$service) {
        \$order = Order::findOrFail(\$id);
        \$service->updateStatus(\$order, 'cancelled', request()->user());
        return response()->json(['success'=>true, 'data'=>[], 'message'=>'Cancelled']);
    }
    public function assign(Request \$request, \$id, OrderService \$service) {
        \$order = Order::findOrFail(\$id);
        \$pilot = User::findOrFail(\$request->pilot_id);
        \$order = \$service->assignPilot(\$order, \$pilot, \$request->user());
        return response()->json(['success'=>true, 'data'=>\$order, 'message'=>'Assigned']);
    }
}
EOT,
    'PilotOrderController' => <<<EOT
<?php
namespace App\Http\Controllers;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
class PilotOrderController extends Controller {
    public function index(Request \$request) {
        \$orders = Order::where('pilot_id', \$request->user()->id)->whereNotIn('status', ['delivered', 'cancelled'])->get();
        return response()->json(['success'=>true, 'data'=>\$orders, 'message'=>'Ok']);
    }
    public function updateStatus(Request \$request, \$id, OrderService \$service) {
        \$order = Order::where('pilot_id', \$request->user()->id)->findOrFail(\$id);
        \$order = \$service->updateStatus(\$order, \$request->status, \$request->user(), \$request->failure_reason);
        return response()->json(['success'=>true, 'data'=>\$order, 'message'=>'Status updated']);
    }
    public function pod(Request \$request, \$id) {
        \$order = Order::where('pilot_id', \$request->user()->id)->findOrFail(\$id);
        if (\$request->hasFile('photo')) {
            \$path = \$request->file('photo')->store('pods', 'public');
            \$order->proof()->create(['photo_path'=>\$path, 'note'=>\$request->note, 'lat'=>\$request->lat, 'lng'=>\$request->lng, 'created_at'=>now()]);
        }
        return response()->json(['success'=>true, 'data'=>\$order, 'message'=>'POD uploaded']);
    }
}
EOT,
    'CustomerOrderController' => <<<EOT
<?php
namespace App\Http\Controllers;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
class CustomerOrderController extends Controller {
    public function index(Request \$request) {
        \$orders = Order::where('customer_id', \$request->user()->id)->get();
        return response()->json(['success'=>true, 'data'=>\$orders, 'message'=>'Ok']);
    }
    public function store(Request \$request, OrderService \$service) {
        \$order = \$service->create(\$request->all(), \$request->user());
        return response()->json(['success'=>true, 'data'=>\$order, 'message'=>'Created']);
    }
}
EOT,
    'TrackingController' => <<<EOT
<?php
namespace App\Http\Controllers;
use App\Services\OrderService;
class TrackingController extends Controller {
    public function track(\$code, OrderService \$service) {
        return response()->json(['success'=>true, 'data'=>\$service->getTrackingInfo(\$code), 'message'=>'Ok']);
    }
}
EOT,
    'LocationController' => <<<EOT
<?php
namespace App\Http\Controllers;
use App\Services\TrackingService;
use Illuminate\Http\Request;
class LocationController extends Controller {
    public function store(Request \$request, TrackingService \$service) {
        \$loc = \$service->storeLocation(\$request->user(), \$request->lat, \$request->lng);
        return response()->json(['success'=>true, 'data'=>\$loc, 'message'=>'Location stored']);
    }
    public function toggleOnline(Request \$request) {
        \$user = \$request->user();
        \$user->update(['is_online' => !\$user->is_online]);
        return response()->json(['success'=>true, 'data'=>\$user, 'message'=>'Toggled']);
    }
    public function allLocations(TrackingService \$service) {
        return response()->json(['success'=>true, 'data'=>\$service->getLatestLocations(), 'message'=>'Ok']);
    }
    public function stream(TrackingService \$service) {
        return response()->stream(function () use (\$service) {
            while (true) {
                echo "data: " . json_encode(\$service->getLatestLocations()) . "\\n\\n";
                ob_flush(); flush(); sleep(5);
            }
        }, 200, ['Content-Type'=>'text/event-stream', 'Cache-Control'=>'no-cache', 'Connection'=>'keep-alive']);
    }
}
EOT,
    'UserController' => <<<EOT
<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
class UserController extends Controller {
    public function index() { return response()->json(['success'=>true, 'data'=>User::paginate()->items(), 'message'=>'Ok']); }
    public function store(Request \$request) {
        \$data = \$request->all(); \$data['password'] = Hash::make(\$data['password']);
        return response()->json(['success'=>true, 'data'=>User::create(\$data), 'message'=>'Created']);
    }
    public function show(\$id) { return response()->json(['success'=>true, 'data'=>User::findOrFail(\$id), 'message'=>'Ok']); }
    public function update(Request \$request, \$id) {
        \$user = User::findOrFail(\$id);
        \$data = \$request->all();
        if(isset(\$data['password'])) \$data['password'] = Hash::make(\$data['password']);
        \$user->update(\$data);
        return response()->json(['success'=>true, 'data'=>\$user, 'message'=>'Updated']);
    }
    public function destroy(\$id) {
        User::findOrFail(\$id)->update(['is_active'=>false]);
        return response()->json(['success'=>true, 'data'=>[], 'message'=>'Deactivated']);
    }
}
EOT,
    'PilotController' => <<<EOT
<?php
namespace App\Http\Controllers;
use App\Models\User;
class PilotController extends Controller {
    public function index() {
        \$pilots = User::where('role', 'pilot')->withCount(['pilotOrders as current_orders_count' => function(\$q){ \$q->whereNotIn('status', ['delivered', 'cancelled']); }])->get();
        return response()->json(['success'=>true, 'data'=>\$pilots, 'message'=>'Ok']);
    }
}
EOT,
    'DashboardController' => <<<EOT
<?php
namespace App\Http\Controllers;
use App\Models\Order;
class DashboardController extends Controller {
    public function stats() {
        \$today = now()->startOfDay();
        return response()->json(['success'=>true, 'data'=>[
            'total_orders' => Order::where('created_at', '>=', \$today)->count(),
            'pending' => Order::where('status', 'pending')->where('created_at', '>=', \$today)->count(),
            'active' => Order::whereIn('status', ['assigned', 'picked_up', 'on_the_way'])->count(),
            'delivered' => Order::where('status', 'delivered')->where('created_at', '>=', \$today)->count(),
            'failed' => Order::where('status', 'failed')->where('created_at', '>=', \$today)->count(),
            'total_revenue' => Order::where('status', 'delivered')->where('created_at', '>=', \$today)->sum('delivery_fee'),
            'total_cod' => Order::where('status', 'delivered')->where('created_at', '>=', \$today)->sum('cod_amount')
        ], 'message'=>'Stats']);
    }
    public function recentDeliveries() {
        return response()->json(['success'=>true, 'data'=>Order::with('proof')->where('status', 'delivered')->orderBy('delivered_at', 'desc')->take(10)->get(), 'message'=>'Ok']);
    }
}
EOT,
    'AddressController' => <<<EOT
<?php
namespace App\Http\Controllers;
use App\Models\Address;
use Illuminate\Http\Request;
class AddressController extends Controller {
    public function index(Request \$request) { return response()->json(['success'=>true, 'data'=>\$request->user()->addresses, 'message'=>'Ok']); }
    public function store(Request \$request) {
        \$data = \$request->all(); \$data['user_id'] = \$request->user()->id;
        return response()->json(['success'=>true, 'data'=>Address::create(\$data), 'message'=>'Created']);
    }
    public function update(Request \$request, \$id) {
        \$address = \$request->user()->addresses()->findOrFail(\$id);
        \$address->update(\$request->all());
        return response()->json(['success'=>true, 'data'=>\$address, 'message'=>'Updated']);
    }
    public function destroy(Request \$request, \$id) {
        \$request->user()->addresses()->findOrFail(\$id)->delete();
        return response()->json(['success'=>true, 'data'=>[], 'message'=>'Deleted']);
    }
}
EOT
];

foreach($controllers as $name => $content) {
    writeFile($baseDir . "/app/Http/Controllers/{$name}.php", $content);
}

// User Model fix for pilotOrders relation
$userModel = file_get_contents($baseDir . '/app/Models/User.php');
$userModel = str_replace(
    'public function addresses() { return $this->hasMany(Address::class); }',
    "public function addresses() { return \$this->hasMany(Address::class); }\n    public function pilotOrders() { return \$this->hasMany(Order::class, 'pilot_id'); }",
    $userModel
);
file_put_contents($baseDir . '/app/Models/User.php', $userModel);

// Seeder
writeFile($baseDir . '/database/seeders/DatabaseSeeder.php', <<<EOT
<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Support\Facades\Hash;
class DatabaseSeeder extends Seeder {
    public function run(): void {
        \$admin = User::create(['name'=>'Admin', 'phone'=>'01000000000', 'password'=>Hash::make('password'), 'role'=>'admin']);
        \$manager = User::create(['name'=>'Manager', 'phone'=>'01100000000', 'password'=>Hash::make('password'), 'role'=>'manager']);
        \$p1 = User::create(['name'=>'Ahmed', 'phone'=>'01200000001', 'password'=>Hash::make('password'), 'role'=>'pilot', 'vehicle_type'=>'motorcycle', 'is_online'=>true]);
        \$p2 = User::create(['name'=>'Mohamed', 'phone'=>'01200000002', 'password'=>Hash::make('password'), 'role'=>'pilot', 'vehicle_type'=>'motorcycle', 'is_online'=>true]);
        \$p3 = User::create(['name'=>'Hassan', 'phone'=>'01200000003', 'password'=>Hash::make('password'), 'role'=>'pilot', 'vehicle_type'=>'motorcycle', 'is_online'=>true]);
        \$c1 = User::create(['name'=>'Customer One', 'phone'=>'01500000001', 'password'=>Hash::make('password'), 'role'=>'user']);
        \$c2 = User::create(['name'=>'Customer Two', 'phone'=>'01500000002', 'password'=>Hash::make('password'), 'role'=>'user']);
        
        \$os = new OrderService();
        for(\$i=0; \$i<10; \$i++) {
            \$os->create([
                'pickup_name' => 'Pickup ' . \$i, 'pickup_phone' => '01011111111', 'pickup_address' => 'Addr ' . \$i,
                'dropoff_name' => 'Drop ' . \$i, 'dropoff_phone' => '01022222222', 'dropoff_address' => 'DAddr ' . \$i,
                'delivery_fee' => 50, 'cod_amount' => 100
            ], \$c1);
        }
    }
}
EOT);

echo "Scaffold script 3 completed.";
