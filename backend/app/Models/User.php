<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'username', 'email', 'password', 'phone', 'address',
        'role', 'vehicle', 'branch', 'status',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // Convenience helpers used throughout controllers/policies
    public function isAdmin(): bool    { return $this->role === 'admin'; }
    public function isDriver(): bool   { return $this->role === 'driver'; }
    public function isCustomer(): bool { return $this->role === 'customer'; }
    public function isEmployee(): bool { return $this->role === 'employee'; }

    public function ordersAsCustomer()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function ordersAsDriver()
    {
        return $this->hasMany(Order::class, 'assigned_driver');
    }

    public function notifications_()
    {
        return $this->hasMany(Notification::class, 'uid');
    }
}
