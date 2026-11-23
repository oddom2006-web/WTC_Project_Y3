FROM php:8.3-fpm-alpine AS base

RUN apk add --no-cache \
        git curl unzip libpng-dev libzip-dev oniguruma-dev \
        nginx supervisor \
    && docker-php-ext-install pdo pdo_mysql mbstring bcmath zip gd

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN BROADCAST_CONNECTION=null composer dump-autoload --optimize \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# nginx serves public/ directly and proxies *.php to php-fpm on 127.0.0.1:9000 —
# both processes live in this same container, so no cross-container volume
# sharing is needed for nginx to see the app's public/ folder.
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/php/supervisord.conf /etc/supervisord.conf
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80 8080
ENTRYPOINT ["entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
