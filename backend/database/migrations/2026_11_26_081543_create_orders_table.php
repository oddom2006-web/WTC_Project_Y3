<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // Order identification
            $table->string('order_id')->unique();    // UK
            $table->string('tracking_id')->unique(); // UK

            // 4 foreign keys to users. nullable because guests / unassigned orders have not user yet.
            // nullOnDelete: if a user is deleted, the order stays and the column becomes NULL.
            // Customer relationship
            $table->foreignId('customer_id')->nullable()->constrained('users')->nullOnDelete();

            // Customer information
            $table->string('customer_name');
            $table->string('sender_name');
            $table->string('receiver_name');
            $table->string('phone');
            $table->string('address');
            $table->string('package_type');
            $table->decimal('weight', 8, 2)->default(0);

            // Driver relationships
            $table->foreignId('assigned_driver')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('driver_uid')->nullable()->constrained('users')->nullOnDelete();
            $table->string('driver_name')->nullable();

            // Order status
            $table->enum('status', [
                'pending', 'approved', 'assigned', 'pickedup', 'transit',
                'arrived', 'outfordelivery', 'delivered', 'failed', 'rejected',
            ])->default('pending');

            // Payment information
            $table->enum('payment_method', ['cod', 'qr', 'card'])->default('cod');
            $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid');

            // Delivery service
            $table->enum('service_type', ['direct', 'consolidated'])->default('direct');

            // Distance and price
            $table->decimal('distance_km', 8, 2)->nullable();
            $table->decimal('price', 10, 2);

            // User who created the order
            $table->foreignId('created_by_uid')->nullable()->constrained('users')->nullOnDelete();


            $table->timestamps();    // created_at / updated_at (frontend has createdAt/updatedAt)
            $table->index('status'); // dashboards filter by status a lot
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
