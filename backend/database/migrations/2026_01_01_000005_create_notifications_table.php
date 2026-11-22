<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('uid')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('body');
            $table->enum('type', ['success', 'info', 'pending', 'warning'])->default('info');
            $table->boolean('read')->default(false);
            $table->timestamp('time')->useCurrent();

            $table->index(['uid', 'time']);
            $table->index(['uid', 'read']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
