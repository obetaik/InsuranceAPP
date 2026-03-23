<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

   // 'allowed_origins' => ['*'], // For development (allow all)

    'allowed_origins' => [
        'http://localhost:5173',  // Vite default port
        'http://127.0.0.1:5173',
    ],


    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];