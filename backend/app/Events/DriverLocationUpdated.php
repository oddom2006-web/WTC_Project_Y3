<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class DriverLocationUpdated implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $orderId,
        public float $lat,
        public float $lng,
        public ?float $heading,
        public string $updatedAt,
    ) {}

    /** One private channel per order — only that order's customer/driver/staff can join it. */
    public function broadcastOn(): array
    {
        return [new PrivateChannel("order.{$this->orderId}")];
    }

    public function broadcastAs(): string
    {
        return 'location.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'lat'       => $this->lat,
            'lng'       => $this->lng,
            'heading'   => $this->heading,
            'updatedAt' => $this->updatedAt,
        ];
    }
}
