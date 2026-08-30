<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('phone', 20)->unique();
            $table->string('email', 255)->unique()->nullable();
            $table->string('password');
            $table->enum('role', ['admin', 'manager', 'pilot', 'user'])->default('user');
            $table->boolean('is_active')->default(true);
            $table->string('avatar', 255)->nullable();
            $table->string('vehicle_type', 50)->nullable();
            $table->boolean('is_online')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('users'); }
};
