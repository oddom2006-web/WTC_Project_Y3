# DOM EXPRESS — Frontend migration off Firebase (parts b + c)

This completes the swap from Firebase to the Laravel API (part a). No page,
component, hook, or CSS module needed to change — the migration is contained
entirely to the files below, because `lib/firestore.ts` kept the exact same
exported function names/signatures.

## Files to replace / add in domexpress-next/

| File | Action |
|---|---|
| `src/lib/api.ts` | **New.** Thin `fetch()` wrapper — replaces the Firebase SDK. |
| `src/lib/firestore.ts` | **Replace.** Same function names as before, now call the API. |
| `src/lib/firebase.ts` | **Delete.** Nothing imports it anymore. |
| `src/context/AuthContext.tsx` | **Replace.** Sanctum token auth instead of Firebase Auth. |
| `src/app/admin/page.tsx` | **Replace.** Removed the "secondary Firebase app" driver/employee-creation hack — now a single `fs.createStaffAccount()` call. |
| `src/app/driver/page.tsx` | **Replace.** Removed direct `firebase/firestore` query calls — now uses `fs.getOrdersByDriver()`. |
| `src/app/auth/page.tsx` | **Replace.** Cosmetic only — dropped dead Firebase-specific error-code checks that never matched. |
| `src/app/customer/page.tsx` | **Replace.** Removed a leftover direct-Firestore fallback query in the track box (the API now matches by either `orderId` or `trackingId`); added the live tracking map. |
| `src/lib/echo.ts` | **New.** Laravel Echo client wired to Reverb, with Bearer-token channel auth. |
| `src/components/LiveTrackMap.tsx` | **New.** Leaflet + OpenStreetMap live tracking map (no API key needed). |
| `package.json` | **Replace.** Dropped `firebase`; added `leaflet`, `laravel-echo`, `pusher-js`. |
| `.env.local` | **Add** `NEXT_PUBLIC_API_URL` + the four `NEXT_PUBLIC_REVERB_*` vars (see `.env.local.example`) — the Reverb ones must match the API's `.env` exactly. |
| `middleware.ts` | **Unchanged.** It only reads the `dom_role` cookie, which `AuthContext.tsx` still sets the same way. |
| every other file (pages, `hooks/index.ts`, components, CSS, locales) | **Unchanged.** |

## Apply it

The zip mirrors your project's folder structure, so it's a straight overlay:

```bash
# unzip this patch somewhere, then from inside domexpress-next/:
rm src/lib/firebase.ts
npm uninstall firebase

cp -r <patch>/src/.  ./src/          # overlays lib/api.ts, lib/firestore.ts,
                                     # context/AuthContext.tsx, app/admin/page.tsx,
                                     # app/driver/page.tsx, app/auth/page.tsx
cp <patch>/package.json ./package.json
cp <patch>/.env.local.example ./.env.local   # then edit if your API isn't on localhost:8000

npm install
npm run dev
```

## Why the design works this way

- **No realtime listeners existed** (`onSnapshot`) — every hook in
  `hooks/index.ts` already just did fetch-on-mount + manual `reload()`. That's
  exactly what a REST API gives you for free, so nothing about the data-flow
  pattern changed, only what's underneath it.
- **Same shapes in, same shapes out** — every model's `toApiArray()`/`payload()`
  method on the Laravel side (part a) returns camelCase JSON identical to your
  `Order`/`User`/`Branch`/`Notification` TypeScript interfaces, so the React
  side never needed to know the backend changed.
- **Auth session**: the Sanctum bearer token lives in `localStorage`
  (read/written only by `src/lib/api.ts`); the lightweight `dom_role` cookie
  `middleware.ts` already relied on is still set the same way it always was,
  just now sourced from the Laravel API's response instead of Firebase's
  `onAuthStateChanged`. On page load, `AuthContext` calls `GET /api/me` to
  restore the session (equivalent to Firebase's automatic session persistence).
- **Driver/employee creation got *simpler*** — the old code spun up a second,
  throwaway Firebase app instance just so creating a driver account wouldn't
  sign the admin out of their own session. That workaround only existed
  because Firebase Auth ties "creating a user" to "signing in as them" on the
  client. A normal backend doesn't have that problem — `POST /api/users` just
  creates a row — so that whole hack is gone.

## Known trade-off vs. the original

The original app fetched *all* orders and filtered client-side with a JS
predicate (`getOrders(filter)`); that still works today (`fs.getOrders()`
returns everything, `filter` runs client-side as before). I added
`getOrdersByDriver()` on top of that, and `OrderController::index` accepts
`?assignedDriver=`, `?customerId=`, `?status=` query params, purely so pages
that only need "my orders" don't have to pull the whole table over the wire.
Nothing forces you to use the narrower calls — swap them back to
`fs.getOrders(filter)` anywhere you'd rather keep the original all-then-filter
behavior.

## Live tracking (part c)

- `src/app/driver/page.tsx` now calls `navigator.geolocation.watchPosition`
  the whole time the driver dashboard is open, throttled to ~1 ping/5s, and
  posts each to `fs.updateDriverLocation()`.
- `src/components/LiveTrackMap.tsx` (used in the customer's track box) joins
  a private Echo/Reverb channel for that order and moves a Leaflet marker on
  every push — no polling, no page refresh.
- Needs the matching Laravel backend pieces (Reverb + the two new endpoints)
  from the updated backend zip — see its `SETUP.md`'s "Live tracking" section.
- The four `NEXT_PUBLIC_REVERB_*` values in `.env.local` **must match** the
  API's `REVERB_APP_KEY`/`REVERB_HOST`/`REVERB_PORT`/`REVERB_SCHEME` exactly,
  or the browser's WebSocket handshake will fail silently (check the browser
  console for a Reverb/Pusher connection error if the map never goes "live").
