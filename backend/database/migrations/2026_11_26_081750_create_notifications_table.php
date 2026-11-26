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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('uid')->constrained('users')->cascadeOnDelete();  // who receives it
            $table->string('title');
            $table->text('body');    // text: bodies can be long
            $table->enum('type', [
                'success', 'info', 'pending', 'warning'
            ])->default('info');
            $table->boolean('read')->default(false);
            $table->timestamp('time')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
