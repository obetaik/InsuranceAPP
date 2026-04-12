<?php

namespace App\Models;

use App\Models\Policy;
use App\Models\Quote;
use Illuminate\Database\Eloquent\Model;

class InsuranceProducts extends Model
{
    protected $fillable = [
        'name',
        'category',
        'description',
        'base_price',
    ];

    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    public function policies()
    {
        return $this->hasMany(Policy::class);
    }
}
