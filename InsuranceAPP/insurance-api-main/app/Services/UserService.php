<?php
// app/Services/UserService.php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class UserService
{
    /**
     * Debug function
     */
    private function debug($message, $data = [])
    {
        echo "\n🔍 [UserService] {$message}\n";
        if (!empty($data)) {
            echo "   Data: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
        }
        Log::debug("[UserService] {$message}", $data);
    }

    public function registerOrUpdate(Request $request): User
    {
        echo "\n" . str_repeat("=", 80) . "\n";
        echo "🚀 [UserService] Starting registerOrUpdate\n";
        echo "Time: " . now()->toDateTimeString() . "\n";
        echo str_repeat("=", 80) . "\n";
        
        try {
            DB::beginTransaction();
            echo "✅ Database transaction started\n";

            $validatedData = $request->validated();
            echo "\n📋 Validated data received:\n";
            echo json_encode($validatedData, JSON_PRETTY_PRINT) . "\n";

            // Check if user exists by email
            echo "\n🔍 Checking if user exists with email: {$validatedData['email']}\n";
            $user = User::where('email', $validatedData['email'])->first();

            if ($user) {
                // Update existing user
                echo "\n✏️ User found! Updating existing user...\n";
                echo "   User ID: {$user->id}\n";
                echo "   Current name: {$user->name}\n";
                echo "   Current email: {$user->email}\n";
                
                $this->debug('Updating existing user', [
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);
                
                $updateData = [
                    'name' => $validatedData['name'] ?? $user->name,
                    'phone' => $validatedData['phone'] ?? $user->phone,
                    'address' => $validatedData['address'] ?? $user->address,
                    'city' => $validatedData['city'] ?? $user->city,
                    'state' => $validatedData['state'] ?? $user->state,
                    'zip_code' => $validatedData['zip_code'] ?? $user->zip_code,
                ];
                
                echo "\n📝 Update data:\n";
                echo json_encode($updateData, JSON_PRETTY_PRINT) . "\n";
                
                $user->update($updateData);
                echo "✅ User updated successfully\n";

                // Update password if provided
                if (!empty($validatedData['password'])) {
                    echo "\n🔐 Updating password...\n";
                    $user->password = Hash::make($validatedData['password']);
                    $user->save();
                    echo "✅ Password updated\n";
                }

                // Update auth0_id if provided and not already set
                if (!empty($validatedData['auth0_id']) && empty($user->auth0_id)) {
                    echo "\n🔑 Adding Auth0 ID: {$validatedData['auth0_id']}\n";
                    $user->auth0_id = $validatedData['auth0_id'];
                    $user->save();
                    echo "✅ Auth0 ID added\n";
                }

                DB::commit();
                echo "\n💾 Database transaction committed\n";
                echo "✅ User update completed successfully!\n";
                echo str_repeat("=", 80) . "\n\n";
                
                return $user->fresh();
            }

            // Create new user
            echo "\n✨ No existing user found. Creating new user...\n";
            $this->debug('Creating new user', ['email' => $validatedData['email']]);
            
            $userData = [
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'] ?? null,
                'address' => $validatedData['address'] ?? null,
                'city' => $validatedData['city'] ?? null,
                'state' => $validatedData['state'] ?? null,
                'zip_code' => $validatedData['zip_code'] ?? null,
                'status' => 'active',
            ];

            echo "\n📝 User data to create:\n";
            echo json_encode($userData, JSON_PRETTY_PRINT) . "\n";

            // Set password if provided (for non-Auth0 users)
            if (!empty($validatedData['password'])) {
                echo "\n🔐 Setting password\n";
                $userData['password'] = Hash::make($validatedData['password']);
            }

            // Set auth0_id if provided
            if (!empty($validatedData['auth0_id'])) {
                echo "\n🔑 Setting Auth0 ID: {$validatedData['auth0_id']}\n";
                $userData['auth0_id'] = $validatedData['auth0_id'];
            }

            $user = User::create($userData);
            echo "\n✅ User created successfully!\n";
            echo "   User ID: {$user->id}\n";
            echo "   Email: {$user->email}\n";

            DB::commit();
            echo "\n💾 Database transaction committed\n";
            echo "✅ New user registration completed successfully!\n";
            echo str_repeat("=", 80) . "\n\n";
            
            $this->debug('User created successfully', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);
            
            return $user;

        } catch (\Exception $e) {
            DB::rollBack();
            echo "\n❌ ERROR: Registration failed!\n";
            echo "   Error message: " . $e->getMessage() . "\n";
            echo "   File: " . $e->getFile() . "\n";
            echo "   Line: " . $e->getLine() . "\n";
            echo "   Trace: " . $e->getTraceAsString() . "\n";
            echo str_repeat("=", 80) . "\n\n";
            
            $this->debug('User registration failed', [
                'error' => $e->getMessage(),
                'email' => $request->email ?? 'unknown'
            ]);
            throw $e;
        }
    }

    public function findOrCreateByAuth0(string $auth0Id, array $userData = []): User
    {
        echo "\n" . str_repeat("=", 80) . "\n";
        echo "🔑 [UserService] findOrCreateByAuth0\n";
        echo "Auth0 ID: {$auth0Id}\n";
        echo str_repeat("=", 80) . "\n";
        
        $user = User::where('auth0_id', $auth0Id)->first();

        if ($user) {
            echo "\n✅ User found by Auth0 ID\n";
            echo "   User ID: {$user->id}\n";
            echo "   Email: {$user->email}\n";
            
            if (!empty($userData)) {
                echo "\n📝 Updating user with provided data\n";
                $user->update($userData);
                echo "✅ User updated\n";
            }
            
            echo str_repeat("=", 80) . "\n\n";
            return $user;
        }

        // Check if user exists by email
        if (!empty($userData['email'])) {
            echo "\n🔍 Checking for user by email: {$userData['email']}\n";
            $user = User::where('email', $userData['email'])->first();
            
            if ($user) {
                echo "\n✅ User found by email\n";
                echo "   User ID: {$user->id}\n";
                echo "🔗 Linking Auth0 ID to existing user\n";
                $user->auth0_id = $auth0Id;
                $user->save();
                echo "✅ Auth0 ID linked successfully\n";
                echo str_repeat("=", 80) . "\n\n";
                return $user;
            }
        }

        // Create new user
        echo "\n✨ Creating new user from Auth0 data\n";
        $newUserData = array_merge($userData, [
            'auth0_id' => $auth0Id,
            'status' => 'active',
        ]);
        
        echo "\n📝 User data:\n";
        echo json_encode($newUserData, JSON_PRETTY_PRINT) . "\n";
        
        $user = User::create($newUserData);
        
        echo "\n✅ User created successfully!\n";
        echo "   User ID: {$user->id}\n";
        echo "   Email: {$user->email}\n";
        echo str_repeat("=", 80) . "\n\n";
        
        return $user;
    }
}