<?php

namespace App\Guards;

use Illuminate\Auth\GuardHelpers;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class Auth0Guard implements Guard
{
    use GuardHelpers;

    protected $request;

    public function __construct(UserProvider $provider, Request $request)
    {
        $this->provider = $provider;
        $this->request = $request;
    }

    public function user()
    {
        if ($this->user !== null) {
            return $this->user;
        }

        $token = $this->getTokenFromRequest();
        
        if (!$token) {
            Log::debug('No token found in request');
            return null;
        }

        try {
            // For now, let's just get the first user for testing
            // This will allow us to test without Auth0
            $user = User::first();
            
            if (!$user) {
                Log::warning('No user found in database');
                return null;
            }

            $this->user = $user;
            return $this->user;
            
        } catch (\Exception $e) {
            Log::error('Auth0 validation error: ' . $e->getMessage());
            return null;
        }
    }

    protected function getTokenFromRequest()
    {
        $token = $this->request->bearerToken();
        
        if (!$token) {
            $authHeader = $this->request->header('Authorization');
            if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }
        
        return $token;
    }

    public function validate(array $credentials = [])
    {
        return false;
    }
}