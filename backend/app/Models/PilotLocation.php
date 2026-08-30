<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PilotLocation extends Model {
    public $timestamps = false;
    protected $fillable = ['pilot_id', 'lat', 'lng', 'created_at'];
    protected $casts = ['lat' => 'decimal:7', 'lng' => 'decimal:7', 'created_at' => 'datetime'];
    public function pilot() { return $this->belongsTo(User::class, 'pilot_id'); }
}
