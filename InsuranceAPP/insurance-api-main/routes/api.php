<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\PolicyController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ClaimController; // ADD THIS IMPORT
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Using Simple Auth Middleware)
|--------------------------------------------------------------------------
*/

Route::middleware('simple.auth')->group(function () {
    // Dashboard route
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    // Quote routes
    Route::get('/quotes', [QuoteController::class, 'index']);
    Route::post('/quotes', [QuoteController::class, 'store']);
    Route::get('/quotes/{id}', [QuoteController::class, 'show']);
    
    // Policy routes
    Route::get('/policies', [PolicyController::class, 'index']);
    Route::post('/policies', [PolicyController::class, 'store']);
    Route::get('/policies/{id}', [PolicyController::class, 'show']);

    // Claim routes - ADD THESE
    Route::get('/claims', [ClaimController::class, 'index']);
    Route::post('/claims', [ClaimController::class, 'store']);
    Route::get('/claims/{id}', [ClaimController::class, 'show']);

});

/*
|--------------------------------------------------------------------------
| Debug Routes
|--------------------------------------------------------------------------
*/

Route::get('/debug/me', function (Request $request) {
    $user = $request->user();
    $token = $request->bearerToken();
    
    return response()->json([
        'authenticated' => !is_null($user),
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email
        ] : null,
        'token_preview' => $token ? substr($token, 0, 50) . '...' : null,
    ]);
})->middleware('simple.auth');

Route::get('/debug/auth-config', function () {
    return response()->json([
        'middleware' => 'simple.auth',
        'has_middleware' => true,
        'routes' => [
            '/api/dashboard',
            '/api/profile',
            '/api/quotes',
            '/api/policies',
            '/api/claims', // ADD THIS
        ]
    ]);
});