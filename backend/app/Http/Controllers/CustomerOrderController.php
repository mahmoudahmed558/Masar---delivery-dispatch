<?php
namespace App\Http\Controllers;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;

class CustomerOrderController extends Controller {
    public function index(Request $request) {
        $orders = Order::where('customer_id', $request->user()->id)
            ->with('pilot:id,name,phone')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
            
        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
            'message' => 'Ok'
        ]);
    }
    
    public function store(Request $request, OrderService $service) {
        $data = $request->validate([
            'pickup_name' => 'required|string|max:100',
            'pickup_phone' => 'required|string|max:20',
            'pickup_address' => 'required|string',
            'dropoff_name' => 'required|string|max:100',
            'dropoff_phone' => 'required|string|max:20',
            'dropoff_address' => 'required|string',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $order = $service->create($data, $request->user());
        return response()->json(['success'=>true, 'data'=>$order, 'message'=>'Created'], 201);
    }
}
