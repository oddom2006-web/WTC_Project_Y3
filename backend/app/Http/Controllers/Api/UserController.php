<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // GET /api/users?role=driver  — replaces getUsersByRole()
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        return response()->json([
            'users' => $query->get()->map(fn ($u) => $this->payload($u)),
        ]);
    }

    // GET /api/users/{user}  — replaces getUser()
    public function show(User $user)
    {
        $this->authorize('view', $user);

        return response()->json(['user' => $this->payload($user)]);
    }

    // PATCH /api/users/{user}  — replaces updateUser()
    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $data = $request->validate([
            'username' => ['sometimes', 'string', 'max:255'],
            'phone'    => ['sometimes', 'nullable', 'string', 'max:50'],
            'address'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'vehicle'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'branch'   => ['sometimes', 'nullable', 'string', 'max:255'],
            'status'   => ['sometimes', 'nullable', 'in:active,inactive'],
            // only an admin may change someone's role
            'role'     => ['sometimes', 'in:admin,driver,customer,employee'],
        ]);

        if (isset($data['role']) && ! $request->user()->isAdmin()) {
            unset($data['role']);
        }

        $user->update($data);

        return response()->json(['user' => $this->payload($user->fresh())]);
    }

    // POST /api/users  — admin-only: "Add Driver" / "Add Employee" (replaces the
    // Firebase-Admin-SDK style account creation the README describes)
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $data = $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone'    => ['nullable', 'string', 'max:50'],
            'role'     => ['required', 'in:admin,driver,customer,employee'],
            'vehicle'  => ['nullable', 'string', 'max:255'],
            'branch'   => ['nullable', 'string', 'max:255'],
            'status'   => ['nullable', 'in:active,inactive'],
        ]);

        $data['password'] = Hash::make($data['password']);
        $data['status']   = $data['status'] ?? ($data['role'] === 'driver' ? 'active' : null);

        $user = User::create($data);

        return response()->json(['user' => $this->payload($user)], 201);
    }

    // DELETE /api/users/{user}  — admin-only
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);
        $user->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    private function payload(User $u): array
    {
        return [
            'uid'       => (string) $u->id,
            'username'  => $u->username,
            'email'     => $u->email,
            'phone'     => $u->phone,
            'address'   => $u->address,
            'role'      => $u->role,
            'vehicle'   => $u->vehicle,
            'branch'    => $u->branch,
            'status'    => $u->status,
            'createdAt' => $u->created_at?->toISOString(),
        ];
    }
}
