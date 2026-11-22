// src/lib/echo.ts
// Laravel Echo, wired to Reverb (self-hosted WebSocket server, Pusher-protocol
// compatible). Private channels are authorized via our own /api/broadcasting/auth
// route, with the Sanctum Bearer token attached manually — we don't use
// Sanctum's cookie/SPA mode (see AuthContext.tsx), so Echo's default
// cookie-based authorizer wouldn't carry our auth.
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from './api';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

let echo: Echo<'reverb'> | null = null;

export function getEcho(): Echo<'reverb'> | null {
  if (typeof window === 'undefined') return null; // never on the server
  if (echo) return echo;

  window.Pusher = Pusher;

  echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel: { name: string }) => ({
      authorize(socketId: string, callback: (err: boolean, data?: unknown) => void) {
        fetch(`${API_BASE}/broadcasting/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${getToken() ?? ''}`,
          },
          body: JSON.stringify({ socket_id: socketId, channel_name: channel.name }),
        })
          .then(res => (res.ok ? res.json() : Promise.reject(res)))
          .then(data => callback(false, data))
          .catch(() => callback(true));
      },
    }),
  });

  return echo;
}

export function disconnectEcho() {
  echo?.disconnect();
  echo = null;
}
