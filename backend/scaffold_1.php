<?php
$baseDir = __DIR__;

// Helpers
function makeDir($path) {
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
    }
}

function writeFile($path, $content) {
    file_put_contents($path, trim($content) . "\n");
}

// 1. Configure .env
$envPath = $baseDir . '/.env';
$env = file_get_contents($envPath);
$env = preg_replace('/DB_CONNECTION=.*/', 'DB_CONNECTION=mysql', $env);
$env = preg_replace('/# DB_HOST=.*/', 'DB_HOST=127.0.0.1', $env);
$env = preg_replace('/# DB_PORT=.*/', 'DB_PORT=3306', $env);
$env = preg_replace('/# DB_DATABASE=.*/', 'DB_DATABASE=eltaisier', $env);
$env = preg_replace('/# DB_USERNAME=.*/', 'DB_USERNAME=root', $env);
$env = preg_replace('/# DB_PASSWORD=.*/', 'DB_PASSWORD=', $env);
file_put_contents($envPath, $env);

// We will let artisan install:api handle api.php and sanctum.

// But wait, the script will just generate all the files.
// Migrations
$migrationsDir = $baseDir . '/database/migrations';
$files = glob($migrationsDir . '/*');
foreach($files as $file){
    if(is_file($file))
        unlink($file); // clean old migrations
}

writeFile($migrationsDir . '/2024_01_01_000000_create_users_table.php', <<<EOT
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint \$table) {
            \$table->id();
            \$table->string('name', 100);
            \$table->string('phone', 20)->unique();
            \$table->string('email', 255)->unique()->nullable();
            \$table->string('password');
            \$table->enum('role', ['admin', 'manager', 'pilot', 'user'])->default('user');
            \$table->boolean('is_active')->default(true);
            \$table->string('avatar', 255)->nullable();
            \$table->string('vehicle_type', 50)->nullable();
            \$table->boolean('is_online')->default(false);
            \$table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('users'); }
};
EOT);

writeFile($migrationsDir . '/2024_01_01_000001_create_addresses_table.php', <<<EOT
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('addresses', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('user_id')->constrained()->cascadeOnDelete();
            \$table->string('label', 50)->nullable();
            \$table->string('name', 100);
            \$table->string('phone', 20);
            \$table->text('address');
            \$table->decimal('lat', 10, 7)->nullable();
            \$table->decimal('lng', 10, 7)->nullable();
            \$table->boolean('is_default')->default(false);
            \$table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('addresses'); }
};
EOT);

writeFile($migrationsDir . '/2024_01_01_000002_create_orders_table.php', <<<EOT
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('orders', function (Blueprint \$table) {
            \$table->id();
            \$table->string('tracking_code', 20)->unique();
            \$table->foreignId('customer_id')->nullable()->constrained('users');
            \$table->foreignId('pilot_id')->nullable()->constrained('users');
            \$table->foreignId('assigned_by')->nullable()->constrained('users');
            \$table->enum('type', ['delivery', 'cart_order'])->default('delivery');
            \$table->text('description')->nullable();
            \$table->string('pickup_name', 100);
            \$table->string('pickup_phone', 20);
            \$table->text('pickup_address');
            \$table->decimal('pickup_lat', 10, 7)->nullable();
            \$table->decimal('pickup_lng', 10, 7)->nullable();
            \$table->string('dropoff_name', 100);
            \$table->string('dropoff_phone', 20);
            \$table->text('dropoff_address');
            \$table->decimal('dropoff_lat', 10, 7)->nullable();
            \$table->decimal('dropoff_lng', 10, 7)->nullable();
            \$table->decimal('delivery_fee', 8, 2)->default(0);
            \$table->decimal('cod_amount', 8, 2)->default(0);
            \$table->enum('payment_method', ['cash', 'prepaid'])->default('cash');
            \$table->enum('status', ['pending', 'assigned', 'picked_up', 'on_the_way', 'delivered', 'failed', 'cancelled'])->default('pending');
            \$table->string('failure_reason', 255)->nullable();
            \$table->timestamp('assigned_at')->nullable();
            \$table->timestamp('picked_up_at')->nullable();
            \$table->timestamp('delivered_at')->nullable();
            \$table->text('notes')->nullable();
            \$table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('orders'); }
};
EOT);

writeFile($migrationsDir . '/2024_01_01_000003_create_delivery_proofs_table.php', <<<EOT
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('delivery_proofs', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            \$table->string('photo_path', 500);
            \$table->string('note', 500)->nullable();
            \$table->decimal('lat', 10, 7)->nullable();
            \$table->decimal('lng', 10, 7)->nullable();
            \$table->timestamp('created_at');
        });
    }
    public function down(): void { Schema::dropIfExists('delivery_proofs'); }
};
EOT);

writeFile($migrationsDir . '/2024_01_01_000004_create_order_status_logs_table.php', <<<EOT
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('order_status_logs', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('order_id')->constrained()->cascadeOnDelete();
            \$table->string('from_status', 20)->nullable();
            \$table->string('to_status', 20);
            \$table->foreignId('changed_by')->nullable()->constrained('users');
            \$table->string('note', 255)->nullable();
            \$table->timestamp('created_at');
        });
    }
    public function down(): void { Schema::dropIfExists('order_status_logs'); }
};
EOT);

writeFile($migrationsDir . '/2024_01_01_000005_create_pilot_locations_table.php', <<<EOT
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('pilot_locations', function (Blueprint \$table) {
            \$table->id();
            \$table->foreignId('pilot_id')->constrained('users')->cascadeOnDelete();
            \$table->decimal('lat', 10, 7);
            \$table->decimal('lng', 10, 7);
            \$table->timestamp('created_at');
            \$table->index(['pilot_id', 'created_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('pilot_locations'); }
};
EOT);

writeFile($migrationsDir . '/2024_01_01_000006_create_personal_access_tokens_table.php', <<<EOT
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('personal_access_tokens', function (Blueprint \$table) {
            \$table->id();
            \$table->morphs('tokenable');
            \$table->string('name');
            \$table->string('token', 64)->unique();
            \$table->text('abilities')->nullable();
            \$table->timestamp('last_used_at')->nullable();
            \$table->timestamp('expires_at')->nullable();
            \$table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('personal_access_tokens'); }
};
EOT);

// Make sure other cache and jobs tables exist if needed, we'll keep it as is, artisan install:api might add stuff.

// Wait, I need a database seeder!
// We'll generate it later in this script.
echo "Scaffold script completed migrations generation.\n";
