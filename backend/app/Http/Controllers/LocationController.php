<?php
namespace App\Http\Controllers;
use App\Services\TrackingService;
use Illuminate\Http\Request;

class LocationController extends Controller {
    public function store(Request $request, TrackingService $service) {
        $request->validate(['lat' => 'required|numeric', 'lng' => 'required|numeric']);
        $loc = $service->storeLocation($request->user(), $request->lat, $request->lng);
        return response()->json(['success'=>true, 'data'=>$loc, 'message'=>'Location stored']);
    }
    
    public function toggleOnline(Request $request) {
        $user = $request->user();
        $user->update(['is_online' => !$user->is_online]);
        return response()->json(['success'=>true, 'data'=>$user, 'message'=>'Toggled']);
    }
    
    public function allLocations(TrackingService $service) {
        return response()->json(['success'=>true, 'data'=>$service->getLatestLocations(), 'message'=>'Ok']);
    }
    
    public function stream(TrackingService $service) {
        set_time_limit(0);
        return response()->stream(function () use ($service) {
            while (true) {
                if (connection_aborted()) break;
                echo "data: " . json_encode($service->getLatestLocations()) . "\n\n";
                ob_flush(); flush(); sleep(5);
            }
        }, 200, ['Content-Type'=>'text/event-stream', 'Cache-Control'=>'no-cache', 'Connection'=>'keep-alive', 'X-Accel-Buffering'=>'no']);
    }
}
