<?php
namespace App\Http\Controllers;
use App\Models\Order;
class DashboardController extends Controller {
    public function stats() {
        $today = now()->startOfDay();
        return response()->json(['success'=>true, 'data'=>[
            'total_orders' => Order::where('created_at', '>=', $today)->count(),
            'pending' => Order::where('status', 'pending')->where('created_at', '>=', $today)->count(),
            'active' => Order::whereIn('status', ['assigned', 'picked_up', 'on_the_way'])->count(),
            'delivered' => Order::where('status', 'delivered')->where('created_at', '>=', $today)->count(),
            'failed' => Order::where('status', 'failed')->where('created_at', '>=', $today)->count(),
            'total_revenue' => Order::where('status', 'delivered')->where('created_at', '>=', $today)->sum('delivery_fee'),
            'total_cod' => Order::where('status', 'delivered')->where('created_at', '>=', $today)->sum('cod_amount')
        ], 'message'=>'Stats']);
    }
    public function recentDeliveries() {
        return response()->json(['success'=>true, 'data'=>Order::with('proof', 'pilot')->where('status', 'delivered')->orderBy('delivered_at', 'desc')->take(10)->get(), 'message'=>'Ok']);
    }
}
