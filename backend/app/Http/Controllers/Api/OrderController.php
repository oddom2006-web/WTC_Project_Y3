<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    // GET /api/orders?assignedDriver=&customerId=&status=
    // The original app fetched ALL orders and filtered client-side with a JS
    // predicate; we keep that working (frontend can still filter locally) but
    // also accept these query params so drivers/customers don't have to pull
    // every row in the table.
    public function index(Request $request)
    {
        $this->authorize('viewAny', Order::class);

        $query = Order::query()->latest('created_at');

        if ($request->filled('assignedDriver')) {
            $query->where('assigned_driver', $request->string('assignedDriver'));
        }
        if ($request->filled('customerId')) {
            $query->where('customer_id', $request->string('customerId'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json([
            'orders' => $query->get()->map(fn (Order $o) => $o->toApiArray()),
        ]);
    }

    // GET /api/orders/{order_id}  — accepts either the public order_id ("DOM-...")
    // or the tracking_id ("TRK-...") — the customer-facing track box searches by either.
    public function show(string $orderId)
    {
        $order = Order::where('order_id', $orderId)
            ->orWhere('tracking_id', $orderId)
            ->firstOrFail();
        $this->authorize('view', $order);

        return response()->json(['order' => $order->toApiArray()]);
    }

    // POST /api/orders  — replaces createOrder() + genOrderId()
    // Order/tracking ids are generated server-side to avoid client-side collisions.
    public function store(Request $request)
    {
        $this->authorize('create', Order::class);

        $data = $request->validate([
            'customerId'     => ['nullable', 'exists:users,id'],
            'customerName'   => ['required', 'string', 'max:255'],
            'customerPhone'  => ['nullable', 'string', 'max:50'],
            'senderName'     => ['required', 'string', 'max:255'],
            'receiverName'   => ['required', 'string', 'max:255'],
            'phone'          => ['required', 'string', 'max:50'],
            'address'        => ['required', 'string', 'max:255'],
            'packageType'    => ['required', 'string', 'max:255'],
            'weight'         => ['required', 'numeric'],
            'branch'         => ['nullable', 'string', 'max:255'],
            'receiverBranch' => ['nullable', 'string', 'max:255'],
            'paymentMethod'  => ['nullable', 'in:cod,qr,card'],
            'paymentStatus'  => ['nullable', 'in:unpaid,paid'],
            'serviceType'    => ['nullable', 'in:direct,consolidated'],
            'distanceKm'     => ['nullable', 'numeric'],
            'price'          => ['nullable', 'numeric'],
            'createdByRole'  => ['nullable', 'in:customer,employee'],
        ]);

        [$publicId, $trackingId] = $this->genOrderId();

        $order = Order::create([
            'order_id'        => $publicId,
            'tracking_id'     => $trackingId,
            'customer_id'     => $data['customerId'] ?? null,
            'customer_name'   => $data['customerName'],
            'customer_phone'  => $data['customerPhone'] ?? null,
            'sender_name'     => $data['senderName'],
            'receiver_name'   => $data['receiverName'],
            'phone'           => $data['phone'],
            'address'         => $data['address'],
            'package_type'    => $data['packageType'],
            'weight'          => $data['weight'],
            'branch'          => $data['branch'] ?? null,
            'receiver_branch' => $data['receiverBranch'] ?? null,
            'payment_method'  => $data['paymentMethod'] ?? null,
            'payment_status'  => $data['paymentStatus'] ?? 'unpaid',
            'service_type'    => $data['serviceType'] ?? null,
            'distance_km'     => $data['distanceKm'] ?? null,
            'price'           => $data['price'] ?? null,
            'status'          => 'pending',
            'created_by_role' => $data['createdByRole'] ?? 'customer',
            'created_by_uid'  => $request->user()->id,
        ]);

        $order->history()->create([
            'status' => 'pending',
            'note'   => 'Order created.',
            'time'   => now(),
        ]);

        return response()->json(['order' => $order->fresh()->toApiArray()], 201);
    }

    // PATCH /api/orders/{order_id}  — replaces the generic updateOrder()
    public function update(Request $request, string $orderId)
    {
        $order = Order::where('order_id', $orderId)->firstOrFail();
        $this->authorize('update', $order);

        $data = $request->validate([
            'branch'         => ['sometimes', 'nullable', 'string', 'max:255'],
            'receiverBranch' => ['sometimes', 'nullable', 'string', 'max:255'],
            'assignedDriver' => ['sometimes', 'nullable', 'exists:users,id'],
            'driverUid'      => ['sometimes', 'nullable', 'exists:users,id'],
            'driverName'     => ['sometimes', 'nullable', 'string', 'max:255'],
            'paymentStatus'  => ['sometimes', 'nullable', 'in:unpaid,paid'],
            'price'          => ['sometimes', 'nullable', 'numeric'],
            'distanceKm'     => ['sometimes', 'nullable', 'numeric'],
            'locationTag'    => ['sometimes', 'nullable', 'string', 'max:255'],
            'status'         => ['sometimes', 'in:pending,approved,assigned,pickedup,transit,arrived,outfordelivery,delivered,failed,rejected'],
        ]);

        $map = [
            'branch' => 'branch', 'receiverBranch' => 'receiver_branch',
            'assignedDriver' => 'assigned_driver', 'driverUid' => 'driver_uid',
            'driverName' => 'driver_name', 'paymentStatus' => 'payment_status',
            'price' => 'price', 'distanceKm' => 'distance_km',
            'locationTag' => 'location_tag', 'status' => 'status',
        ];

        $columns = [];
        foreach ($map as $apiKey => $column) {
            if (array_key_exists($apiKey, $data)) {
                $columns[$column] = $data[$apiKey];
            }
        }

        // If assigning a driver moved the order into "assigned", log it in history
        // too (mirrors admin/page.tsx: updateOrder({assignedDriver, driverName, driverUid}))
        if (isset($columns['assigned_driver']) && $order->assigned_driver !== $columns['assigned_driver']) {
            $order->history()->create([
                'status' => $columns['status'] ?? $order->status,
                'note'   => 'Driver assigned: '.($columns['driver_name'] ?? ''),
                'time'   => now(),
            ]);
        }

        $order->update($columns);

        return response()->json(['order' => $order->fresh()->toApiArray()]);
    }

    // POST /api/orders/{order_id}/status  — replaces updateOrderStatus()
    public function updateStatus(Request $request, string $orderId)
    {
        $order = Order::where('order_id', $orderId)->firstOrFail();
        $this->authorize('update', $order);

        $data = $request->validate([
            'status' => ['required', 'in:pending,approved,assigned,pickedup,transit,arrived,outfordelivery,delivered,failed,rejected'],
            'note'   => ['nullable', 'string', 'max:500'],
        ]);

        $order->update(['status' => $data['status']]);

        $order->history()->create([
            'status' => $data['status'],
            'note'   => $data['note'] ?? '',
            'time'   => now(),
        ]);

        return response()->json(['order' => $order->fresh()->toApiArray()]);
    }

    // DELETE /api/orders/{order_id}  — admin-only
    public function destroy(string $orderId)
    {
        $order = Order::where('order_id', $orderId)->firstOrFail();
        $this->authorize('delete', $order);
        $order->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    private function genOrderId(): array
    {
        // Millisecond timestamp in base36, uppercased — mirrors the original
        // client-side genOrderId(), just computed server-side to avoid collisions.
        $ms  = (int) round(microtime(true) * 1000);
        $ts  = strtoupper($this->toBase36($ms));
        $rnd = strtoupper(Str::random(3));

        return ["DOM-{$ts}{$rnd}", "TRK-{$ts}{$rnd}-".now()->year];
    }

    private function toBase36(int $number): string
    {
        $digits = '0123456789abcdefghijklmnopqrstuvwxyz';
        $result = '';
        while ($number > 0) {
            $result = $digits[$number % 36].$result;
            $number = intdiv($number, 36);
        }

        return $result ?: '0';
    }
}
