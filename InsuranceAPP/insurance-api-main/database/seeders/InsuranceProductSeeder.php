<?php

namespace Database\Seeders;

use App\Models\InsuranceProduct;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InsuranceProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        InsuranceProduct::create([
            'name'=> 'Auto Insurance',
            'description'=> 'Provides coverage for vehicles against accidents and damages.',
            'base_price'=> 200,
        ]);

        InsuranceProduct::create([
            'name' => 'Health Insurance',
            'description' => 'Covers medical expenses including hospital visits and treatments.',
            'base_price' => 250
        ]);

        InsuranceProduct::create([
            'name' => 'Travel Insurance',
            'description' => 'Provides coverage for trip cancellations, delays and medical emergencies.',
            'base_price' => 150
        ]);

           InsuranceProduct::create([
            'name' => 'Home Insurance',
            'description' => 'Protects residential property against fire, theft and disasters.',
            'base_price' => 300
        ]);
    }
}
