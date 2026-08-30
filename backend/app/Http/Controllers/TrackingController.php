<?php
namespace App\Http\Controllers;
use App\Services\OrderService;
class TrackingController extends Controller {
    public function track($code, OrderService $service) {
        return response()->json(['success'=>true, 'data'=>$service->getTrackingInfo($code), 'message'=>'Ok']);
    }
}
