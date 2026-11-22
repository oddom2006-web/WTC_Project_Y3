<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Comma-separated list in .env, e.g.:
    // FRONTEND_URL=http://localhost:3000,https://domexpress.vercel.app
    'allowed_origins' => array_filter(array_map(
        'trim',
        explode(',', env('FRONTEND_URL', 'http://localhost:3000'))
    )),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // We use Bearer tokens, not cookies, for cross-origin auth — no credentials needed.
    'supports_credentials' => false,

];
