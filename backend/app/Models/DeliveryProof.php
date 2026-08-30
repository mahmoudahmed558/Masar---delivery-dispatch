<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class DeliveryProof extends Model {
    public $timestamps = false;
    protected $fillable = ['order_id', 'photo_path', 'note', 'lat', 'lng', 'created_at'];
    protected $casts = ['lat' => 'decimal:7', 'lng' => 'decimal:7', 'created_at' => 'datetime'];
    public function order() { return $this->belongsTo(Order::class); }
}
