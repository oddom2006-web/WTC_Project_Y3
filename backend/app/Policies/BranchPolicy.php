<?php

namespace App\Policies;

use App\Models\Branch;
use App\Models\User;

/**
 * Mirrors firestore.rules match /branches/{branchId}:
 *   allow read:   if isLoggedIn();
 *   allow create/update/delete: if isAdmin();
 */
class BranchPolicy
{
    public function viewAny(User $actor): bool
    {
        return true;
    }

    public function view(User $actor, Branch $branch): bool
    {
        return true;
    }

    public function create(User $actor): bool
    {
        return $actor->isAdmin();
    }

    public function update(User $actor, Branch $branch): bool
    {
        return $actor->isAdmin();
    }

    public function delete(User $actor, Branch $branch): bool
    {
        return $actor->isAdmin();
    }
}
