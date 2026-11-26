<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // GET /api/notifications  — always scoped to the caller (own notifications only)
    public function index(Request $request)
    {
        $notifs = Notification::where('uid', $request->user()->id)
            ->orderByDesc('time')
            ->limit(30)
            ->get();

        return response()->json([
            'notifications' => $notifs->map(fn (Notification $n) => $n->toApiArray()),
            'unread'        => $notifs->where('read', false)->count(),
        ]);
    }

    // GET /api/notifications/unread-count
    public function unreadCount(Request $request)
    {
        $count = Notification::where('uid', $request->user()->id)->where('read', false)->count();

        return response()->json(['unread' => $count]);
    }

    // POST /api/notifications any logged-in user may notify another user
    // (mirrors "allow create: if isLoggedIn();" used to cross-notify customer/driver)
    public function store(Request $request)
    {
        $this->authorize('create', Notification::class);

        $data = $request->validate([
            'uid'   => ['required', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'body'  => ['required', 'string', 'max:1000'],
            'type'  => ['nullable', 'in:success,info,pending,warning'],
        ]);

        $notif = Notification::create([
            'uid'   => $data['uid'],
            'title' => $data['title'],
            'body'  => $data['body'],
            'type'  => $data['type'] ?? 'info',
            'read'  => false,
            'time'  => now(),
        ]);

        return response()->json(['notification' => $notif->toApiArray()], 201);
    }

    // PATCH /api/notifications/mark-all-read
    public function markAllRead(Request $request)
    {
        Notification::where('uid', $request->user()->id)
            ->where('read', false)
            ->update(['read' => true]);

        return response()->json(['message' => 'All marked read.']);
    }
}
