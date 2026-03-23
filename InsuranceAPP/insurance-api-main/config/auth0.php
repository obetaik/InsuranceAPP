<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Auth0 Domain
    |--------------------------------------------------------------------------
    |
    | Your Auth0 domain from your Auth0 dashboard
    |
    */
    'domain' => env('AUTH0_DOMAIN'),

    /*
    |--------------------------------------------------------------------------
    | Auth0 Client ID
    |--------------------------------------------------------------------------
    |
    | Your Auth0 client ID from your Auth0 dashboard
    |
    */
    'client_id' => env('AUTH0_CLIENT_ID'),

    /*
    |--------------------------------------------------------------------------
    | Auth0 Client Secret
    |--------------------------------------------------------------------------
    |
    | Your Auth0 client secret from your Auth0 dashboard
    |
    */
    'client_secret' => env('AUTH0_CLIENT_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Auth0 Audience
    |--------------------------------------------------------------------------
    |
    | Your Auth0 API audience (identifier)
    |
    */
    'audience' => env('AUTH0_AUDIENCE'),

    /*
    |--------------------------------------------------------------------------
    | Auth0 Cookie Secret
    |--------------------------------------------------------------------------
    |
    | Your Auth0 cookie secret (optional)
    |
    */
    'cookie_secret' => env('AUTH0_COOKIE_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Persistence Configuration
    |--------------------------------------------------------------------------
    |
    | Configure how the SDK stores its state.
    |
    */
    'persistence' => [
        'type' => env('AUTH0_PERSISTENCE', 'laravel'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Persistence Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the identifier used to uniquely identify a user.
    |
    */
    'user' => [
        'identifier' => env('AUTH0_USER_IDENTIFIER', 'sub'),
        'model' => App\Models\User::class,
        'connection' => null,
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the session settings if using the session persistence layer.
    |
    */
    'session' => [
        'key' => env('AUTH0_SESSION_KEY', 'auth0'),
        'expires_in' => env('AUTH0_SESSION_EXPIRES_IN', 86400),
    ],

    /*
    |--------------------------------------------------------------------------
    | Guard Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the guard that will be used for authentication.
    |
    */
    'guard' => env('AUTH0_GUARD', 'api'),
];