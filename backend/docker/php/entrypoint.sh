#!/bin/sh
set -e

# Wait for MySQL to accept connections (compose's healthcheck normally covers
# this via `depends_on: condition: service_healthy`, but this is a cheap
# extra safety net for slow-starting DBs).
until php -r "new PDO('mysql:host=$DB_HOST;port=${DB_PORT:-3306}', '$DB_USERNAME', '$DB_PASSWORD');" 2>/dev/null; do
  echo "Waiting for MySQL at $DB_HOST:${DB_PORT:-3306}..."
  sleep 2
done

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:GENERATE_ME" ]; then
  php artisan key:generate --force
fi

php artisan migrate --force

if [ "$RUN_SEEDER" = "true" ]; then
  php artisan db:seed --class=DemoSeeder --force
fi

php artisan config:cache
php artisan route:cache

exec "$@"
