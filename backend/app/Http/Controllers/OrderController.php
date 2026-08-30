<?php
namespace App\Http\Controllers;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller {
    public function index(Request $request) {
        $query = Order::with('customer', 'pilot');

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('tracking_code', 'like', "%{$search}%")
                  ->orWhere('pickup_name', 'like', "%{$search}%")
                  ->orWhere('dropoff_name', 'like', "%{$search}%")
                  ->orWhere('pickup_phone', 'like', "%{$search}%")
                  ->orWhere('dropoff_phone', 'like', "%{$search}%");
            });
        }
        if ($request->pilot_id) {
            $query->where('pilot_id', $request->pilot_id);
        }
        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ]
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
            'delivery_fee' => 'nullable|numeric',
            'cod_amount' => 'nullable|numeric',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
            'payment_method' => 'nullable|string',
        ]);
        $order = $service->create($data, $request->user());
        return response()->json(['success' => true, 'data' => $order, 'message' => 'Order created'], 201);
    }

    public function show($id) {
        $order = Order::with('customer', 'pilot', 'proof', 'statusLogs')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function update(Request $request, $id, OrderService $service) {
        $order = Order::findOrFail($id);
        $data = $request->validate([
            'delivery_fee' => 'nullable|numeric',
            'cod_amount' => 'nullable|numeric',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
            'payment_method' => 'nullable|string',
        ]);
        $order = $service->update($order, $data);
        return response()->json(['success' => true, 'data' => $order, 'message' => 'Updated']);
    }

    public function destroy(Request $request, $id, OrderService $service) {
        $order = Order::findOrFail($id);
        if ($order->status === 'delivered') {
            return response()->json(['success' => false, 'message' => 'Cannot cancel delivered order'], 422);
        }
        $service->updateStatus($order, 'cancelled', $request->user());
        return response()->json(['success' => true, 'data' => null, 'message' => 'Cancelled']);
    }

    public function assign(Request $request, $id, OrderService $service) {
        $request->validate(['pilot_id' => 'required|exists:users,id']);
        $order = Order::findOrFail($id);
        
        if ($order->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Only pending orders can be assigned'], 422);
        }
        
        $pilot = User::findOrFail($request->pilot_id);
        if ($pilot->role !== 'pilot') {
            return response()->json(['success' => false, 'message' => 'User is not a pilot'], 422);
        }
        $order = $service->assignPilot($order, $pilot, $request->user());
        return response()->json(['success' => true, 'data' => $order->load('pilot'), 'message' => 'Assigned']);
    }
}
