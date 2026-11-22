# DOM EXPRESS — Laravel API backend (replaces Firebase)

This is a **scaffold**, not a runnable app by itself — composer/vendor can't be
generated here, so drop these files into a fresh Laravel install.

## 1. Create the base app

```bash
composer create-project laravel/laravel domexpress-api
cd domexpress-api
composer require laravel/sanctum laravel/reverb
```

## 2. Copy in this scaffold

Copy these folders/files from this zip **into** the new `domexpress-api/`,
overwriting where they already exist:

```
app/Models/*.php            → app/Models/
app/Http/Controllers/Api/*  → app/Http/Controllers/Api/
app/Http/Controllers/Controller.php → app/Http/Controllers/Controller.php (overwrite)
app/Http/Middleware/*.php   → app/Http/Middleware/
app/Policies/*.php          → app/Policies/
app/Events/*.php            → app/Events/
database/migrations/*.php   → database/migrations/
database/seeders/DemoSeeder.php → database/seeders/
routes/api.php               → routes/ (overwrite)
routes/channels.php          → routes/
config/broadcasting.php      → config/ (overwrite)
config/reverb.php            → config/ (overwrite)
config/cors.php               → config/ (overwrite)
```

## 3. Register the role middleware

Laravel 11+ (no `Kernel.php`) — in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\EnsureRole::class,
    ]);
})
```

If you're on Laravel 10 instead, add the same alias to
`$routeMiddleware` in `app/Http/Kernel.php`.

Policies don't need manual registration — Laravel auto-discovers
`App\Policies\{Model}Policy` for `App\Models\{Model}` by naming convention.

## 4. Configure `.env`

```
DB_CONNECTION=mysql
DB_DATABASE=domexpress
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
FRONTEND_URL=http://localhost:3000

# Live tracking (Laravel Reverb — self-hosted WebSocket server)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=domexpress
REVERB_APP_KEY=domexpress-key
REVERB_APP_SECRET=change_me_reverb_secret
# What the BROWSER connects to (public-facing host/port):
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
# What the Reverb process itself binds to:
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080
```

Publish Sanctum's config if you haven't already:
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Since the Next.js frontend and this API are separate apps, routes use
**Bearer token** auth (`Authorization: Bearer <token>`), not Sanctum's
cookie/SPA mode — so CORS just needs `config/cors.php` to allow your
frontend origin, no `supports_credentials` cookie dance required.

## 5. Migrate + seed

```bash
php artisan migrate
php artisan db:seed --class=DemoSeeder
```

This recreates the same three demo accounts from the original README
(`admin@domexpress.com` / `admin123`, `driver@domexpress.com` / `driver123`,
`nii@gmail.com` / `cust123`) plus the five branches.

## 6. Run it

```bash
php artisan serve
# API at http://localhost:8000/api

# In a second terminal — the WebSocket server for live tracking:
php artisan reverb:start
# Reverb listening at ws://localhost:8080
```
(The Dockerized version from the tracking patch runs both automatically via supervisord — no second terminal needed there.)

## What's intentionally identical to firestore.rules

Every policy in `app/Policies/` has a comment pointing at the exact
`firestore.rules` block it replaces, including a rule that's loose on
purpose (any logged-in user can update any order — that's how the
original app worked across customer/admin/driver screens, not a bug).

## Live tracking (new)

`app/Events/DriverLocationUpdated.php` + `routes/channels.php` +
`POST /api/driver/location` + `GET /api/orders/{orderId}/location` together
implement real-time GPS tracking:

1. The driver's browser calls `POST /api/driver/location` every ~5s (via
   `navigator.geolocation.watchPosition` on the frontend).
2. `DriverLocationController::store` upserts a `driver_locations` row and
   broadcasts `DriverLocationUpdated` to a private channel
   (`order.{orderId}`) for every one of that driver's currently-active orders.
3. `routes/channels.php` authorizes who may join that channel — the same
   people who could already view the order per `OrderPolicy` (its customer,
   its driver, or staff).
4. The customer's tracking page joins that channel and moves a Leaflet
   marker on every push — see the frontend patch for `LiveTrackMap.tsx`.

Test it without a real phone: log in as the driver (Postman/curl, Bearer
token from `/api/login`) and POST to `/api/driver/location` manually:
```bash
curl -X POST http://localhost:8000/api/driver/location \
  -H "Authorization: Bearer <driver's token>" -H "Content-Type: application/json" \
  -d '{"lat": 13.3633, "lng": 103.8564}'
```

## What this scaffold doesn't include

This zip is the **API only**. The frontend wiring (rewritten `lib/firestore.ts`,
`AuthContext.tsx`, the live-tracking map, etc.) ships as a separate
Next.js patch zip, applied on top of the original project.
