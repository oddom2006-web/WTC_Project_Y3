<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // POST /api/register  — always creates a 'customer' account (same as old register())
    public function register(Request $request)
    {
        $data = Validator::make($request->all(), [
            'username' => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'phone'    => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:6'],
        ])->validate();

        $user = User::create([
            'username' => $data['username'],
            'email'    => $data['email'],
            'phone'    => $data['phone'] ?? null,
            'address'  => '',
            'password' => Hash::make($data['password']),
            'role'     => 'customer',
        ]);

        $token = $user->createToken('domexpress')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->userPayload($user),
        ], 201);
    }

    // POST /api/login
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 422);
        }

        $token = $user->createToken('domexpress')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $this->userPayload($user),
        ]);
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    // GET /api/me — used on app load instead of Firebase's onAuthStateChanged
    public function me(Request $request)
    {
        return response()->json(['user' => $this->userPayload($request->user())]);
    }

    private function userPayload(User $user): array
    {
        return [
            'uid'       => (string) $user->id,
            'username'  => $user->username,
            'email'     => $user->email,
            'phone'     => $user->phone,
            'address'   => $user->address,
            'role'      => $user->role,
            'vehicle'   => $user->vehicle,
            'branch'    => $user->branch,
            'status'    => $user->status,
            'createdAt' => $user->created_at?->toISOString(),
        ];
    }
}
