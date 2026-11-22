<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;

/**
 * Mirrors firestore.rules match /notifications/{notifId}:
 *   allow read:   if isLoggedIn() && resource.data.uid == request.auth.uid;
 *   allow create: if isLoggedIn();                                    (any user, so it can notify others)
 *   allow update: if isLoggedIn() && resource.data.uid == request.auth.uid;
 *   allow delete: if isLoggedIn() && resource.data.uid == request.auth.uid;
 */
class NotificationPolicy
{
    public function view(User $actor, Notification $notification): bool
    {
        return $actor->id === $notification->uid;
    }

    public function create(User $actor): bool
    {
        return true;
    }

    public function update(User $actor, Notification $notification): bool
    {
        return $actor->id === $notification->uid;
    }

    public function delete(User $actor, Notification $notification): bool
    {
        return $actor->id === $notification->uid;
    }
}
