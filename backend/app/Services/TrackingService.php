<?php
namespace App\Services;
use App\Models\{PilotLocation, User};
use Illuminate\Support\Collection;

class TrackingService {
    public function storeLocation(User $pilot, float $lat, float $lng): PilotLocation {
        return PilotLocation::create(['pilot_id' => $pilot->id, 'lat' => $lat, 'lng' => $lng, 'created_at' => now()]);
    }
    public function getLatestLocations(): Collection {
        $onlinePilots = User::where('role', 'pilot')->where('is_online', true)->pluck('id');
        $latestIds = PilotLocation::selectRaw('MAX(id) as id')->whereIn('pilot_id', $onlinePilots)->groupBy('pilot_id')->pluck('id');
        return PilotLocation::with('pilot:id,name,phone,vehicle_type')->whereIn('id', $latestIds)->get();
    }
    public function getLatestLocationForPilot(User $pilot): ?PilotLocation {
        return PilotLocation::where('pilot_id', $pilot->id)->orderBy('created_at', 'desc')->first();
    }
}
