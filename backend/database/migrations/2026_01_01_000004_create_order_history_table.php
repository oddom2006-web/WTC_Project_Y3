<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Firestore stored `history` as an array field on the order document.
        // MySQL has no array column, so each history entry becomes its own row.
        Schema::create('order_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->enum('status', [
                'pending', 'approved', 'assigned', 'pickedup', 'transit',
                'arrived', 'outfordelivery', 'delivered', 'failed', 'rejected',
            ]);
            $table->string('note')->nullable();
            $table->timestamp('time')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_history');
    }
};
