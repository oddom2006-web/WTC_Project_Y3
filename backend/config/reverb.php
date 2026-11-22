<?php

return [

    'default' => env('REVERB_SERVER', 'reverb'),

    'servers' => [

        'reverb' => [
            'host' => env('REVERB_SERVER_HOST', '0.0.0.0'),
            'port' => env('REVERB_SERVER_PORT', 8080),
            'hostname' => env('REVERB_HOST'),
            'options' => [
                'tls' => [],
            ],
            'max_request_size' => 10_000,
            'scaling' => [
                'enabled' => false,
            ],
        ],

    ],

    'apps' => [

        'apps' => [
            [
                'app_id'                    => env('REVERB_APP_ID'),
                'app_key'                   => env('REVERB_APP_KEY'),
                'app_secret'                => env('REVERB_APP_SECRET'),
                'options'                   => [
                    'host'   => env('REVERB_HOST'),
                    'port'   => env('REVERB_PORT', 443),
                    'scheme' => env('REVERB_SCHEME', 'https'),
                    'useTLS' => env('REVERB_SCHEME', 'https') === 'https',
                ],
                'allowed_origins'           => ['*'],
                'ping_interval'             => 60,
                'activity_timeout'          => 30,
            ],
        ],

    ],

];
