<?php
namespace App\Http\Controllers;
use App\Models\User;

class PilotController extends Controller {
    public function index() {
        $pilots = User::where('role', 'pilot')
            ->where('is_active', true)
            ->withCount(['pilotOrders as current_orders_count' => function($q){ 
                $q->whereNotIn('status', ['delivered', 'cancelled']); 
            }])
            ->get();
            
        return response()->json(['success'=>true, 'data'=>$pilots, 'message'=>'Ok']);
    }
}
