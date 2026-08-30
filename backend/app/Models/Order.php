<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Order extends Model {
    protected $fillable = ['tracking_code', 'customer_id', 'pilot_id', 'assigned_by', 'type', 'description', 'pickup_name', 'pickup_phone', 'pickup_address', 'pickup_lat', 'pickup_lng', 'dropoff_name', 'dropoff_phone', 'dropoff_address', 'dropoff_lat', 'dropoff_lng', 'delivery_fee', 'cod_amount', 'payment_method', 'status', 'failure_reason', 'assigned_at', 'picked_up_at', 'delivered_at', 'notes'];
    protected $casts = ['assigned_at' => 'datetime', 'picked_up_at' => 'datetime', 'delivered_at' => 'datetime', 'delivery_fee' => 'decimal:2', 'cod_amount' => 'decimal:2', 'pickup_lat' => 'decimal:7', 'pickup_lng' => 'decimal:7', 'dropoff_lat' => 'decimal:7', 'dropoff_lng' => 'decimal:7'];
    public function customer() { return $this->belongsTo(User::class, 'customer_id'); }
    public function pilot() { return $this->belongsTo(User::class, 'pilot_id'); }
    public function assignedBy() { return $this->belongsTo(User::class, 'assigned_by'); }
    public function proof() { return $this->hasOne(DeliveryProof::class); }
    public function statusLogs() { return $this->hasMany(OrderStatusLog::class); }
}
