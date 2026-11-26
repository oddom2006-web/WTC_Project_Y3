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
        Schema::create('order_history', function (Blueprint $table) {
            $table->id();
            // cascadeOnDelete: deleting an order deletes its history too
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->enum('status', [
                'pending', 'approved', 'assigned', 'pickedup', 'transit',
                'arrived', 'outfordelivery', 'delivered', 'failed', 'rejected',
            ]);
            $table->string('note')->nullable();
            $table->timestamp('time')->useCurrent(); // ER uses "time", not created_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_history');
    }
};
