<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Address extends Model {
    protected $fillable = ['user_id', 'label', 'name', 'phone', 'address', 'lat', 'lng', 'is_default'];
    protected $casts = ['lat' => 'decimal:7', 'lng' => 'decimal:7', 'is_default' => 'boolean'];
    public function user() { return $this->belongsTo(User::class); }
}
