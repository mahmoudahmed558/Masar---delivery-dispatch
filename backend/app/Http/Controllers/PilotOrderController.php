<?php
namespace App\Http\Controllers;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PilotOrderController extends Controller {
    public function index(Request $request) {
        $orders = Order::where('pilot_id', $request->user()->id)->whereNotIn('status', ['delivered', 'cancelled'])->get();
        return response()->json(['success'=>true, 'data'=>$orders, 'message'=>'Ok']);
    }
    
    public function history(Request $request) {
        $orders = Order::where('pilot_id', $request->user()->id)->whereIn('status', ['delivered', 'cancelled'])->orderBy('updated_at', 'desc')->paginate(20);
        return response()->json(['success'=>true, 'data'=>$orders->items(), 'message'=>'Ok']);
    }

    public function updateStatus(Request $request, $id, OrderService $service) {
        $request->validate([
            'status' => ['required', Rule::in(['picked_up', 'on_the_way', 'delivered', 'failed'])]
        ]);
        
        $order = Order::where('pilot_id', $request->user()->id)->findOrFail($id);
        
        $validTransitions = [
            'assigned' => ['picked_up', 'failed'],
            'picked_up' => ['on_the_way', 'failed'],
            'on_the_way' => ['delivered', 'failed'],
            'failed' => []
        ];
        
        if (!in_array($request->status, $validTransitions[$order->status] ?? [])) {
            return response()->json(['success' => false, 'message' => 'Invalid status transition'], 422);
        }
        
        $order = $service->updateStatus($order, $request->status, $request->user(), $request->failure_reason);
        return response()->json(['success'=>true, 'data'=>$order, 'message'=>'Status updated']);
    }

    public function pod(Request $request, $id) {
        $order = Order::where('pilot_id', $request->user()->id)->findOrFail($id);
        $request->validate([
            'photo' => 'required|image|max:5120'
        ]);
        
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pods', 'public');
            $order->proof()->updateOrCreate(
                ['order_id' => $order->id],
                ['photo_path'=>$path, 'note'=>$request->note, 'lat'=>$request->lat, 'lng'=>$request->lng, 'created_at'=>now()]
            );
        }
        return response()->json(['success'=>true, 'data'=>$order->load('proof'), 'message'=>'POD uploaded']);
    }
}
