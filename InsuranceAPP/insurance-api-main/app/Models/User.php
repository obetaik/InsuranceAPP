<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
// Remove this line: use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    // Remove HasApiTokens from the use statement
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'city',
        'state',
        'zip_code',
        'auth0_id',
        'avatar',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->status)) {
                $user->status = 'active';
            }
            if (empty($user->email) && !empty($user->auth0_id)) {
                $user->email = $user->auth0_id . '@auth0.local';
            }
        });

        static::updating(function ($user) {
            // Use logging instead of echo
            \Log::info('Updating user', ['user_id' => $user->id, 'changes' => $user->getDirty()]);
        });
    }

    /**
     * Check if user is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get user's full address
     */
    public function getFullAddressAttribute(): string
    {
        $addressParts = array_filter([
            $this->address,
            $this->city,
            $this->state,
            $this->zip_code
        ]);

        return implode(', ', $addressParts);
    }

    /**
     * Scope for active users
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Relationship with quotes
     */
    public function quotes()
    {
        return $this->hasMany(\App\Models\Quote::class);
    }

    /**
     * Relationship with policies
     */
    public function policies()
    {
        return $this->hasMany(\App\Models\Policy::class);
    }

    /**
     * Link Auth0 ID to existing user by email
     */
    public static function linkAuth0User($auth0Id, $email, $name = null)
    {
        $user = self::where('email', $email)->first();
        
        if ($user) {
            $user->auth0_id = $auth0Id;
            if ($name && !$user->name) {
                $user->name = $name;
            }
            $user->save();
            return $user;
        }
        
        // Create new user if doesn't exist
        return self::create([
            'name' => $name ?? explode('@', $email)[0],
            'email' => $email,
            'auth0_id' => $auth0Id,
            'password' => bcrypt(uniqid()),
            'status' => 'active'
        ]);
    }
}