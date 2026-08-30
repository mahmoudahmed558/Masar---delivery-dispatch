<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;
    protected $fillable = ['name', 'phone', 'email', 'password', 'role', 'is_active', 'avatar', 'vehicle_type', 'is_online'];
    protected $hidden = ['password', 'remember_token'];
    protected function casts(): array { return ['password' => 'hashed', 'is_active' => 'boolean', 'is_online' => 'boolean']; }
    public function addresses() { return $this->hasMany(Address::class); }
    public function pilotOrders() { return $this->hasMany(Order::class, 'pilot_id'); }
    public function customerOrders() { return $this->hasMany(Order::class, 'customer_id'); }
    public function locations() { return $this->hasMany(PilotLocation::class, 'pilot_id'); }
}
