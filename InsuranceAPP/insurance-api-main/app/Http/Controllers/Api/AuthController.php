<?php
// app/Http/Controllers/Api/AuthController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user profile (no password - will use Auth0 for authentication)
     */
    public function register(Request $request)
    {
        try {
            // Validate request - no password required
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:50',
                'zip_code' => 'nullable|string|max:20',
            ]);

            Log::info('Registration attempt', ['email' => $validated['email']]);

            // Create user with a placeholder password (won't be used)
            // The user will authenticate via Auth0
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt(uniqid()), // Random password since Auth0 handles auth
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'zip_code' => $validated['zip_code'] ?? null,
                'status' => 'active'
            ]);

            Log::info('User profile created', ['user_id' => $user->id, 'email' => $user->email]);

            return response()->json([
                'success' => true,
                'message' => 'Profile created successfully. Please login with Auth0.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'city' => $user->city,
                    'state' => $user->state,
                    'zip_code' => $user->zip_code,
                ],
                // Return email for Auth0 to use
                'email' => $user->email
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login is handled by Auth0 - this endpoint is for testing only
     */
    public function login(Request $request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Please use Auth0 for authentication'
        ], 401);
    }

    /**
     * Get authenticated user profile (from Auth0 token)
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'address' => $user->address ?? '',
                'city' => $user->city ?? '',
                'state' => $user->state ?? '',
                'zip_code' => $user->zip_code ?? '',
                'status' => $user->status ?? 'active',
                'auth0_id' => $user->auth0_id,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }
        
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:50',
            'zip_code' => 'nullable|string|max:20',
        ]);
        
        $updateData = [];
        foreach (['name', 'phone', 'address', 'city', 'state', 'zip_code'] as $field) {
            if ($request->has($field)) {
                $value = $request->input($field);
                $updateData[$field] = ($value === '' || $value === null) ? null : $value;
            }
        }
        
        if (!empty($updateData)) {
            $user->update($updateData);
            Log::info('Profile updated', ['user_id' => $user->id]);
        }
        
        $user->refresh();
        
        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name ?? '',
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'address' => $user->address ?? '',
                'city' => $user->city ?? '',
                'state' => $user->state ?? '',
                'zip_code' => $user->zip_code ?? '',
            ]
        ]);
    }

    /**
     * Logout - handled by frontend
     */
    public function logout(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}