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
 *
 * NOTE: the original rules let *any* logged-in user update *any* order — that's
 * intentionally loose (customers, drivers and admins all call updateOrder()/
 * updateOrderStatus() from different screens). Kept identical here on purpose;
 * tighten later (e.g. restrict drivers to their own assigned orders) if you want
 * stricter behavior than the original app had.
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
