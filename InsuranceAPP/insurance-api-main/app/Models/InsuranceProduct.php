<?php

namespace App\Models;

use App\Models\Policy;
use App\Models\Quote;
use Illuminate\Database\Eloquent\Model;

class InsuranceProduct extends Model
{
    protected $fillable = [
        'name',
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
