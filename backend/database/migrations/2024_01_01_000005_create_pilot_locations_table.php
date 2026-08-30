<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('pilot_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pilot_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->timestamp('created_at');
            $table->index(['pilot_id', 'created_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('pilot_locations'); }
};
