<?php

namespace App\Policies;

use App\Models\User;

/**
 * Mirrors firestore.rules match /users/{userId}:
 *   allow read:   if isLoggedIn();
 *   allow create: if isLoggedIn() && request.auth.uid == userId;   (handled in AuthController::register)
 *   allow update: if isLoggedIn() && (request.auth.uid == userId || isAdmin());
 *   allow delete: if isAdmin();
 */
class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return true; // any authenticated user (route already requires auth:sanctum)
    }

    public function view(User $actor, User $target): bool
    {
        return true;
    }

    public function update(User $actor, User $target): bool
    {
        return $actor->id === $target->id || $actor->isAdmin();
    }

    public function delete(User $actor, User $target): bool
    {
        return $actor->isAdmin();
    }

    // Only admins may create *other* accounts (e.g. drivers) via the admin panel.
    // Public self-registration is handled separately in AuthController::register.
    public function create(User $actor): bool
    {
        return $actor->isAdmin();
    }
}
