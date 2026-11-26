<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

/**
 * Mirrors firestore.rules match /orders/{orderId}:
 *   allow read:   if isLoggedIn();
 *   allow create: if isLoggedIn();
 *   allow update: if isLoggedIn();
 *   allow delete: if isAdmin();
 */
class OrderPolicy
{
    public function viewAny(User $actor): bool
    {
        return true;
    }

    public function view(User $actor, Order $order): bool
    {
        return true;
    }

    public function create(User $actor): bool
    {
        return true;
    }

    public function update(User $actor, Order $order): bool
    {
        return true;
    }

    public function delete(User $actor, Order $order): bool
    {
        return $actor->isAdmin();
    }
}
