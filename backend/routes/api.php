<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\DriverLocationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

// ── Public 
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Authenticated (Sanctum bearer token) 
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Users
    Route::get('/users',        [UserController::class, 'index']);   // ?role=driver
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::patch('/users/{user}', [UserController::class, 'update']);
    Route::post('/users', [UserController::class, 'store'])->middleware('role:admin');       // Add Driver / Add Employee
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('role:admin');

    // Orders
    Route::get('/orders',             [OrderController::class, 'index']);
    Route::get('/orders/{orderId}',   [OrderController::class, 'show']);
    Route::post('/orders',            [OrderController::class, 'store']);
    Route::patch('/orders/{orderId}', [OrderController::class, 'update']);
    Route::post('/orders/{orderId}/status', [OrderController::class, 'updateStatus']);
    Route::delete('/orders/{orderId}', [OrderController::class, 'destroy'])->middleware('role:admin');

    // Branches
    Route::get('/branches', [BranchController::class, 'index']);
    Route::post('/branches', [BranchController::class, 'store'])->middleware('role:admin');
    Route::patch('/branches/{branch}', [BranchController::class, 'update'])->middleware('role:admin');
    Route::delete('/branches/{branch}', [BranchController::class, 'destroy'])->middleware('role:admin');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications', [NotificationController::class, 'store']);
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);

    // Live tracking
    Route::post('/driver/location', [DriverLocationController::class, 'store'])->middleware('role:driver');
    Route::get('/orders/{orderId}/location', [DriverLocationController::class, 'show']);

    // Reverb/Echo private-channel authorization — Bearer-token based since we
    // don't use Sanctum's cookie/SPA mode (see AuthContext.tsx on the frontend).
    Route::post('/broadcasting/auth', fn (Request $request) => Broadcast::auth($request));
});

// Required for Broadcast::channel() registrations in routes/channels.php to
// take effect — Laravel's minimal skeleton doesn't auto-load this file the
// way older versions' BroadcastServiceProvider used to.
require __DIR__.'/channels.php';
