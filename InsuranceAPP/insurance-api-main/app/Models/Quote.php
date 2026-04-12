<?php
// app/Models/Quote.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    protected $fillable = [
        'user_id',
        'insurance_product_id',
        'quote_number',
        'estimated_premium',
        'coverage_amount',
        'deductible',
        'additional_options',
        'status'
    ];
    
    protected $casts = [
        'estimated_premium' => 'decimal:2',
        'coverage_amount' => 'decimal:2',
        'deductible' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    public function product()
    {
        return $this->belongsTo(InsuranceProducts::class, 'insurance_product_id');
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}