<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PilotOrderController;
use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PilotController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AddressController;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::get('track/{tracking_code}', [TrackingController::class, 'track']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::put('auth/me', [AuthController::class, 'updateProfile']);
        Route::put('auth/password', [AuthController::class, 'changePassword']);
        
        Route::apiResource('addresses', AddressController::class);
        Route::apiResource('customer/orders', CustomerOrderController::class)->only(['index', 'store']);
        
        Route::middleware('role:admin,manager')->group(function () {
            Route::apiResource('orders', OrderController::class);
            Route::post('orders/{id}/assign', [OrderController::class, 'assign']);
            Route::get('pilots/locations', [LocationController::class, 'allLocations']);
            Route::get('stream/locations', [LocationController::class, 'stream']);
            Route::get('pilots', [PilotController::class, 'index']);
            Route::get('dashboard/stats', [DashboardController::class, 'stats']);
            Route::get('dashboard/recent-deliveries', [DashboardController::class, 'recentDeliveries']);
        });
        
        Route::middleware('role:admin')->group(function () {
            Route::apiResource('users', UserController::class);
        });
        
        Route::middleware('role:pilot')->group(function () {
            Route::get('pilot/orders', [PilotOrderController::class, 'index']);
            Route::get('pilot/history', [PilotOrderController::class, 'history']);
            Route::put('pilot/orders/{id}/status', [PilotOrderController::class, 'updateStatus']);
            Route::post('pilot/orders/{id}/pod', [PilotOrderController::class, 'pod']);
            Route::post('pilot/location', [LocationController::class, 'store']);
            Route::put('pilot/toggle-online', [LocationController::class, 'toggleOnline']);
        });
    });
});
