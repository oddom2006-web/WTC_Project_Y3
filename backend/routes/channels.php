<?php

use App\Models\Order;
use Illuminate\Support\Facades\Broadcast;

// Mirrors OrderPolicy::view — same people who can see an order can watch its
// live location: the customer who placed it, the driver assigned to it, or staff.
Broadcast::channel('order.{orderId}', function ($user, string $orderId) {
    $order = Order::where('order_id', $orderId)->first();
    if (! $order) {
        return false;
    }

    return $order->customer_id === $user->id
        || $order->driver_uid === $user->id
        || $user->isAdmin()
        || $user->isEmployee();
});
