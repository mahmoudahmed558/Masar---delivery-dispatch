<?php
namespace App\Services;
use App\Models\{Order, User, OrderStatusLog};
use Illuminate\Support\Str;

class OrderService {
    public function create(array $data, ?User $user = null): Order {
        $data['tracking_code'] = $this->generateTrackingCode();
        $data['customer_id'] = $data['customer_id'] ?? $user?->id;
        $data['status'] = $data['status'] ?? 'pending';
        $order = Order::create($data);
        $this->logStatus($order, null, 'pending', $user);
        return $order;
    }
    public function update(Order $order, array $data): Order {
        $order->update($data);
        return $order;
    }
    public function assignPilot(Order $order, User $pilot, User $manager): Order {
        $from = $order->status;
        $order->update(['pilot_id' => $pilot->id, 'assigned_by' => $manager->id, 'status' => 'assigned', 'assigned_at' => now()]);
        $this->logStatus($order, $from, 'assigned', $manager);
        return $order;
    }
    public function updateStatus(Order $order, string $status, ?User $user, ?string $failureReason = null): Order {
        $from = $order->status;
        $data = ['status' => $status];
        if($status === 'picked_up') $data['picked_up_at'] = now();
        if($status === 'delivered') $data['delivered_at'] = now();
        if($status === 'failed' && $failureReason) $data['failure_reason'] = $failureReason;
        $order->update($data);
        $this->logStatus($order, $from, $status, $user, $failureReason);
        return $order;
    }
    public function generateTrackingCode(): string {
        do { $code = 'ELT-' . strtoupper(Str::random(6)); } while (Order::where('tracking_code', $code)->exists());
        return $code;
    }
    public function getTrackingInfo(string $trackingCode): array {
        $order = Order::with('statusLogs', 'pilot')->where('tracking_code', $trackingCode)->firstOrFail();
        if ($order->status === 'delivered') {
            $order->load('proof');
        }
        $info = ['order' => $order, 'pilot_location' => null];
        if($order->status === 'on_the_way' && $order->pilot_id) {
            $loc = app(TrackingService::class)->getLatestLocationForPilot($order->pilot);
            $info['pilot_location'] = $loc;
        }
        return $info;
    }
    private function logStatus(Order $order, ?string $from, string $to, ?User $user, ?string $note = null) {
        OrderStatusLog::create(['order_id' => $order->id, 'from_status' => $from, 'to_status' => $to, 'changed_by' => $user?->id, 'note' => $note, 'created_at' => now()]);
    }
}
