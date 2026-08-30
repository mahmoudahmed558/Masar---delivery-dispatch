<?php
$baseDir = __DIR__;

function makeDir($path) {
    if (!is_dir($path)) mkdir($path, 0755, true);
}
function writeFile($path, $content) {
    makeDir(dirname($path));
    file_put_contents($path, trim($content) . "\n");
}

// Models
writeFile($baseDir . '/app/Models/User.php', <<<EOT
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;
    protected \$fillable = ['name', 'phone', 'email', 'password', 'role', 'is_active', 'avatar', 'vehicle_type', 'is_online'];
    protected \$hidden = ['password', 'remember_token'];
    protected function casts(): array { return ['password' => 'hashed', 'is_active' => 'boolean', 'is_online' => 'boolean']; }
    public function addresses() { return \$this->hasMany(Address::class); }
}
EOT);

writeFile($baseDir . '/app/Models/Address.php', <<<EOT
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Address extends Model {
    protected \$fillable = ['user_id', 'label', 'name', 'phone', 'address', 'lat', 'lng', 'is_default'];
    protected \$casts = ['lat' => 'decimal:7', 'lng' => 'decimal:7', 'is_default' => 'boolean'];
    public function user() { return \$this->belongsTo(User::class); }
}
EOT);

writeFile($baseDir . '/app/Models/Order.php', <<<EOT
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Order extends Model {
    protected \$fillable = ['tracking_code', 'customer_id', 'pilot_id', 'assigned_by', 'type', 'description', 'pickup_name', 'pickup_phone', 'pickup_address', 'pickup_lat', 'pickup_lng', 'dropoff_name', 'dropoff_phone', 'dropoff_address', 'dropoff_lat', 'dropoff_lng', 'delivery_fee', 'cod_amount', 'payment_method', 'status', 'failure_reason', 'assigned_at', 'picked_up_at', 'delivered_at', 'notes'];
    protected \$casts = ['assigned_at' => 'datetime', 'picked_up_at' => 'datetime', 'delivered_at' => 'datetime', 'delivery_fee' => 'decimal:2', 'cod_amount' => 'decimal:2', 'pickup_lat' => 'decimal:7', 'pickup_lng' => 'decimal:7', 'dropoff_lat' => 'decimal:7', 'dropoff_lng' => 'decimal:7'];
    public function customer() { return \$this->belongsTo(User::class, 'customer_id'); }
    public function pilot() { return \$this->belongsTo(User::class, 'pilot_id'); }
    public function assignedBy() { return \$this->belongsTo(User::class, 'assigned_by'); }
    public function proof() { return \$this->hasOne(DeliveryProof::class); }
    public function statusLogs() { return \$this->hasMany(OrderStatusLog::class); }
}
EOT);

writeFile($baseDir . '/app/Models/DeliveryProof.php', <<<EOT
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class DeliveryProof extends Model {
    public \$timestamps = false;
    protected \$fillable = ['order_id', 'photo_path', 'note', 'lat', 'lng', 'created_at'];
    protected \$casts = ['lat' => 'decimal:7', 'lng' => 'decimal:7', 'created_at' => 'datetime'];
    public function order() { return \$this->belongsTo(Order::class); }
}
EOT);

writeFile($baseDir . '/app/Models/OrderStatusLog.php', <<<EOT
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OrderStatusLog extends Model {
    public \$timestamps = false;
    protected \$fillable = ['order_id', 'from_status', 'to_status', 'changed_by', 'note', 'created_at'];
    protected \$casts = ['created_at' => 'datetime'];
    public function order() { return \$this->belongsTo(Order::class); }
    public function changedBy() { return \$this->belongsTo(User::class, 'changed_by'); }
}
EOT);

writeFile($baseDir . '/app/Models/PilotLocation.php', <<<EOT
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PilotLocation extends Model {
    public \$timestamps = false;
    protected \$fillable = ['pilot_id', 'lat', 'lng', 'created_at'];
    protected \$casts = ['lat' => 'decimal:7', 'lng' => 'decimal:7', 'created_at' => 'datetime'];
    public function pilot() { return \$this->belongsTo(User::class, 'pilot_id'); }
}
EOT);

// Services
writeFile($baseDir . '/app/Services/OrderService.php', <<<EOT
<?php
namespace App\Services;
use App\Models\{Order, User, OrderStatusLog};
use Illuminate\Support\Str;

class OrderService {
    public function create(array \$data, ?User \$user = null): Order {
        \$data['tracking_code'] = \$this->generateTrackingCode();
        if(\$user) \$data['customer_id'] = \$user->id;
        \$order = Order::create(\$data);
        \$this->logStatus(\$order, null, 'pending', \$user);
        return \$order;
    }
    public function update(Order \$order, array \$data): Order {
        \$order->update(\$data);
        return \$order;
    }
    public function assignPilot(Order \$order, User \$pilot, User \$manager): Order {
        \$from = \$order->status;
        \$order->update(['pilot_id' => \$pilot->id, 'assigned_by' => \$manager->id, 'status' => 'assigned', 'assigned_at' => now()]);
        \$this->logStatus(\$order, \$from, 'assigned', \$manager);
        return \$order;
    }
    public function updateStatus(Order \$order, string \$status, ?User \$user, ?string \$failureReason = null): Order {
        \$from = \$order->status;
        \$data = ['status' => \$status];
        if(\$status === 'picked_up') \$data['picked_up_at'] = now();
        if(\$status === 'delivered') \$data['delivered_at'] = now();
        if(\$status === 'failed' && \$failureReason) \$data['failure_reason'] = \$failureReason;
        \$order->update(\$data);
        \$this->logStatus(\$order, \$from, \$status, \$user, \$failureReason);
        return \$order;
    }
    public function generateTrackingCode(): string {
        do { \$code = 'ELT-' . strtoupper(Str::random(4)); } while (Order::where('tracking_code', \$code)->exists());
        return \$code;
    }
    public function getTrackingInfo(string \$trackingCode): array {
        \$order = Order::with('statusLogs', 'pilot')->where('tracking_code', \$trackingCode)->firstOrFail();
        \$info = ['order' => \$order, 'pilot_location' => null];
        if(\$order->status === 'on_the_way' && \$order->pilot_id) {
            \$loc = app(TrackingService::class)->getLatestLocationForPilot(\$order->pilot);
            \$info['pilot_location'] = \$loc;
        }
        return \$info;
    }
    private function logStatus(Order \$order, ?string \$from, string \$to, ?User \$user, ?string \$note = null) {
        OrderStatusLog::create(['order_id' => \$order->id, 'from_status' => \$from, 'to_status' => \$to, 'changed_by' => \$user?->id, 'note' => \$note, 'created_at' => now()]);
    }
}
EOT);

writeFile($baseDir . '/app/Services/TrackingService.php', <<<EOT
<?php
namespace App\Services;
use App\Models\{PilotLocation, User};
use Illuminate\Support\Collection;

class TrackingService {
    public function storeLocation(User \$pilot, float \$lat, float \$lng): PilotLocation {
        return PilotLocation::create(['pilot_id' => \$pilot->id, 'lat' => \$lat, 'lng' => \$lng, 'created_at' => now()]);
    }
    public function getLatestLocations(): Collection {
        \$onlinePilots = User::where('role', 'pilot')->where('is_online', true)->pluck('id');
        return PilotLocation::whereIn('pilot_id', \$onlinePilots)->orderBy('created_at', 'desc')->get()->unique('pilot_id')->values();
    }
    public function getLatestLocationForPilot(User \$pilot): ?PilotLocation {
        return PilotLocation::where('pilot_id', \$pilot->id)->orderBy('created_at', 'desc')->first();
    }
}
EOT);
