<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'tracking_id', 'customer_id', 'customer_name', 'customer_phone',
        'sender_name', 'receiver_name', 'phone', 'address', 'package_type', 'weight',
        'branch', 'receiver_branch', 'assigned_driver', 'driver_uid', 'driver_name',
        'status', 'payment_method', 'payment_status', 'service_type',
        'distance_km', 'price', 'location_tag', 'created_by_role', 'created_by_uid',
    ];

    protected function casts(): array
    {
        return [
            'weight'      => 'float',
            'distance_km' => 'float',
            'price'       => 'float',
        ];
    }

    // Always load history ordered oldest -> newest, matching the old Firestore array
    protected $with = ['history'];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_uid');
    }

    public function history()
    {
        return $this->hasMany(OrderHistory::class)->orderBy('time');
    }

    // Shapes the model exactly like the frontend's `Order` TypeScript interface
    public function toApiArray(): array
    {
        return [
            'orderId'       => $this->order_id,
            'trackingId'    => $this->tracking_id,
            'customerId'    => $this->customer_id !== null ? (string) $this->customer_id : null,
            'customerName'  => $this->customer_name,
            'customerPhone' => $this->customer_phone,
            'senderName'    => $this->sender_name,
            'receiverName'  => $this->receiver_name,
            'phone'         => $this->phone,
            'address'       => $this->address,
            'packageType'   => $this->package_type,
            'weight'        => $this->weight,
            'branch'        => $this->branch,
            'assignedDriver'=> $this->assigned_driver !== null ? (string) $this->assigned_driver : null,
            'driverName'    => $this->driver_name,
            'driverUid'     => $this->driver_uid !== null ? (string) $this->driver_uid : null,
            'status'        => $this->status,
            'paymentMethod' => $this->payment_method,
            'paymentStatus' => $this->payment_status,
            'serviceType'   => $this->service_type,
            'receiverBranch'=> $this->receiver_branch,
            'distanceKm'    => $this->distance_km,
            'price'         => $this->price,
            'locationTag'   => $this->location_tag,
            'createdByRole' => $this->created_by_role,
            'createdByUid'  => $this->created_by_uid !== null ? (string) $this->created_by_uid : null,
            'createdAt'     => $this->created_at?->toISOString(),
            'updatedAt'     => $this->updated_at?->toISOString(),
            'history'       => $this->history->map(fn ($h) => [
                'status' => $h->status,
                'time'   => $h->time?->toISOString(),
                'note'   => $h->note,
            ])->values(),
        ];
    }
}
