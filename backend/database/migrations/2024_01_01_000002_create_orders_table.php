<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_code', 20)->unique();
            $table->foreignId('customer_id')->nullable()->constrained('users');
            $table->foreignId('pilot_id')->nullable()->constrained('users');
            $table->foreignId('assigned_by')->nullable()->constrained('users');
            $table->enum('type', ['delivery', 'cart_order'])->default('delivery');
            $table->text('description')->nullable();
            $table->string('pickup_name', 100);
            $table->string('pickup_phone', 20);
            $table->text('pickup_address');
            $table->decimal('pickup_lat', 10, 7)->nullable();
            $table->decimal('pickup_lng', 10, 7)->nullable();
            $table->string('dropoff_name', 100);
            $table->string('dropoff_phone', 20);
            $table->text('dropoff_address');
            $table->decimal('dropoff_lat', 10, 7)->nullable();
            $table->decimal('dropoff_lng', 10, 7)->nullable();
            $table->decimal('delivery_fee', 8, 2)->default(0);
            $table->decimal('cod_amount', 8, 2)->default(0);
            $table->enum('payment_method', ['cash', 'prepaid'])->default('cash');
            $table->enum('status', ['pending', 'assigned', 'picked_up', 'on_the_way', 'delivered', 'failed', 'cancelled'])->default('pending');
            $table->string('failure_reason', 255)->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('orders'); }
};
