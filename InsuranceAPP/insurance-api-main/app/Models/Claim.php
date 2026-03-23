<?php
// app/Models/Claim.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Claim extends Model
{
    protected $fillable = [
        'user_id',
        'policy_id',
        'claim_number',
        'incident_date',
        'description',
        'claim_amount',
        'approved_amount',
        'status',
        'documents',
        'resolution_date'
    ];

    protected $casts = [
        'incident_date' => 'date',
        'resolution_date' => 'date',
        'claim_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function policy()
    {
        return $this->belongsTo(Policy::class);
    }
}