<?php
// app/Models/Policy.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Policy extends Model
{
    protected $fillable = [
        'user_id',
        'quote_id',
        'insurance_product_id',
        'policy_number',
        'premium_amount',
        'start_date',
        'end_date',
        'effective_date',
        'status'
    ];
    
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'effective_date' => 'date',
        'premium_amount' => 'decimal:2',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }
    
    public function product()
    {
        return $this->belongsTo(InsuranceProducts::class, 'insurance_product_id');
    }
}