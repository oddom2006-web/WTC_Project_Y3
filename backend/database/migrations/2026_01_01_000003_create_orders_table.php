<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // public-facing identifiers (what the frontend calls orderId / trackingId)
            $table->string('order_id')->unique();
            $table->string('tracking_id')->unique();

            // customer info (nullable customer_id = guest / walk-in order)
            $table->foreignId('customer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();

            $table->string('sender_name');
            $table->string('receiver_name');
            $table->string('phone');
            $table->string('address');
            $table->string('package_type');
            $table->decimal('weight', 8, 2)->default(0);
            $table->string('branch')->nullable();
            $table->string('receiver_branch')->nullable();

            // driver assignment — assigned_driver and driver_uid mirror the same
            // value in the original app (both set to the driver's id at assign time)
            $table->foreignId('assigned_driver')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('driver_uid')->nullable()->constrained('users')->nullOnDelete();
            $table->string('driver_name')->nullable();

            $table->enum('status', [
                'pending', 'approved', 'assigned', 'pickedup', 'transit',
                'arrived', 'outfordelivery', 'delivered', 'failed', 'rejected',
            ])->default('pending');

            $table->enum('payment_method', ['cod', 'qr', 'card'])->nullable();
            $table->enum('payment_status', ['unpaid', 'paid'])->nullable();
            $table->enum('service_type', ['direct', 'consolidated'])->nullable();

            $table->decimal('distance_km', 8, 2)->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('location_tag')->nullable();

            $table->enum('created_by_role', ['customer', 'employee'])->nullable();
            $table->foreignId('created_by_uid')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['assigned_driver', 'updated_at']);
            $table->index(['assigned_driver', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
