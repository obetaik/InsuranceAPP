<?php
// app/Http/Middleware/SimpleAuth.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class SimpleAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        
        Log::info('SimpleAuth: Request received', [
            'uri' => $request->path(),
            'has_token' => !empty($token),
            'token_preview' => $token ? substr($token, 0, 50) . '...' : null
        ]);
        
        if (!$token) {
            Log::warning('SimpleAuth: No token provided');
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        
        try {
            // Decode JWT payload
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                Log::warning('SimpleAuth: Invalid token format');
                return response()->json(['message' => 'Invalid token format'], 401);
            }
            
            // Decode the payload
            $payload = json_decode(base64_decode(str_replace('_', '/', str_replace('-', '+', $parts[1]))), true);
            
            Log::info('SimpleAuth: Token decoded', [
                'sub' => $payload['sub'] ?? null,
                'email' => $payload['email'] ?? null,
                'name' => $payload['name'] ?? null
            ]);
            
            // Get user identifier from token
            $sub = $payload['sub'] ?? null;
            $email = $payload['email'] ?? null;
            $name = $payload['name'] ?? $payload['nickname'] ?? null;
            
            // If email is not in token, fetch from userinfo endpoint
            if (!$email && $sub) {
                Log::info('Email not in token, fetching from userinfo');
                try {
                    $domain = env('AUTH0_DOMAIN');
                    $userinfoUrl = "https://{$domain}/userinfo";
                    
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $userinfoUrl);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, [
                        'Authorization: Bearer ' . $token
                    ]);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                    
                    $response = curl_exec($ch);
                    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);
                    
                    if ($httpCode === 200) {
                        $userinfo = json_decode($response, true);
                        $email = $userinfo['email'] ?? null;
                        $name = $userinfo['name'] ?? $userinfo['nickname'] ?? $name;
                        Log::info('Userinfo fetched', ['email' => $email, 'name' => $name]);
                    } else {
                        Log::warning('Failed to fetch userinfo', ['http_code' => $httpCode]);
                    }
                } catch (\Exception $e) {
                    Log::error('Error fetching userinfo: ' . $e->getMessage());
                }
            }
            
            if (!$sub && !$email) {
                Log::warning('SimpleAuth: No user identifier in token');
                return response()->json(['message' => 'No user identifier in token'], 401);
            }
            
            // Try to find user by email first
            $user = null;
            
            if ($email) {
                Log::info('Looking for user by email: ' . $email);
                $user = User::where('email', $email)->first();
                if ($user) {
                    Log::info('User found by email', ['user_id' => $user->id]);
                }
            }
            
            // If not found by email, try by auth0_id
            if (!$user && $sub) {
                Log::info('Looking for user by auth0_id: ' . $sub);
                $user = User::where('auth0_id', $sub)->first();
                if ($user) {
                    Log::info('User found by auth0_id', ['user_id' => $user->id]);
                }
            }
            
            // If still not found, create a new user
            if (!$user) {
                Log::info('Creating new user');
                
                // Use the real email if available, otherwise use sub
                $userEmail = $email;
                if (!$userEmail) {
                    // Extract email from sub if it's a Google OAuth format
                    if (strpos($sub, 'google-oauth2|') === 0) {
                        $userEmail = str_replace('google-oauth2|', '', $sub) . '@gmail.com';
                    } else {
                        $userEmail = $sub . '@auth0.local';
                    }
                }
                
                $user = User::create([
                    'name' => $name ?: ($email ? explode('@', $email)[0] : 'User'),
                    'email' => $userEmail,
                    'auth0_id' => $sub,
                    'password' => bcrypt(uniqid()),
                    'status' => 'active'
                ]);
                Log::info('User created', ['user_id' => $user->id, 'email' => $user->email]);
            } else {
                // Update existing user if needed
                $updated = false;
                
                if ($sub && !$user->auth0_id) {
                    $user->auth0_id = $sub;
                    $updated = true;
                    Log::info('Adding auth0_id to existing user', ['user_id' => $user->id]);
                }
                
                if ($name && $user->name !== $name) {
                    $user->name = $name;
                    $updated = true;
                    Log::info('Updating user name', ['user_id' => $user->id]);
                }
                
                if ($email && $user->email !== $email && !str_contains($user->email, '@auth0.local')) {
                    $user->email = $email;
                    $updated = true;
                    Log::info('Updating user email', ['user_id' => $user->id, 'email' => $email]);
                }
                
                if ($updated) {
                    $user->save();
                }
            }
            
            // Set the user in the request
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
            
            Log::info('User authenticated', ['user_id' => $user->id, 'email' => $user->email]);
            
            return $next($request);
            
        } catch (\Exception $e) {
            Log::error('SimpleAuth error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Authentication failed: ' . $e->getMessage()], 401);
        }
    }
}