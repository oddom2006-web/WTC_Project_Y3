<?php

namespace App\Http\Controllers\Api;

use App\Events\DriverLocationUpdated;
use App\Http\Controllers\Controller;
use App\Models\DriverLocation;
use App\Models\Order;
use Illuminate\Http\Request;

class DriverLocationController extends Controller
{
    // POST /api/driver/location — the driver's browser calls this every few
    // seconds (via navigator.geolocation.watchPosition) while a delivery is active.
    public function store(Request $request)
    {
        $data = $request->validate([
            'lat'     => ['required', 'numeric', 'between:-90,90'],
            'lng'     => ['required', 'numeric', 'between:-180,180'],
            'heading' => ['nullable', 'numeric'],
            'speed'   => ['nullable', 'numeric'],
        ]);

        $driverId = $request->user()->id;
        $location = DriverLocation::updateOrCreate(['driver_id' => $driverId], $data);

        // A driver can be mid-delivery on more than one order at once — push
        // to every one of their currently-active orders, not just the first.
        Order::where('driver_uid', $driverId)
            ->whereNotIn('status', ['pending', 'approved', 'delivered', 'failed', 'rejected'])
            ->get(['order_id'])
            ->each(fn (Order $order) => broadcast(new DriverLocationUpdated(
                $order->order_id,
                $location->lat,
                $location->lng,
                $location->heading,
                $location->updated_at->toISOString(),
            )));

        return response()->json(['message' => 'ok']);
    }

    // GET /api/orders/{orderId}/location initial marker position, so the
    // map has something to show before the first WebSocket push arrives.
    public function show(string $orderId)
    {
        $order = Order::where('order_id', $orderId)->firstOrFail();
        $this->authorize('view', $order);

        $location = $order->driver_uid
            ? DriverLocation::where('driver_id', $order->driver_uid)->first()
            : null;

        return response()->json([
            'location' => $location ? [
                'lat'       => $location->lat,
                'lng'       => $location->lng,
                'heading'   => $location->heading,
                'updatedAt' => $location->updated_at->toISOString(),
            ] : null,
        ]);
    }
}
