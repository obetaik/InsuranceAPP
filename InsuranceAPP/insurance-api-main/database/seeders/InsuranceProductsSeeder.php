<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\InsuranceProducts;  // Note: Plural name

class InsuranceProductsSeeder extends Seeder
{
    public function run()
    {
        // Disable foreign key checks for SQL Server
        DB::statement('ALTER TABLE quotes NOCHECK CONSTRAINT ALL');
        DB::statement('ALTER TABLE policies NOCHECK CONSTRAINT ALL');
        
        // Delete existing records
        InsuranceProducts::query()->delete();
        
        // Re-enable foreign key checks
        DB::statement('ALTER TABLE quotes WITH CHECK CHECK CONSTRAINT ALL');
        DB::statement('ALTER TABLE policies WITH CHECK CHECK CONSTRAINT ALL');
        
        // Insert sample products
        $products = [
            [
                'name' => 'Home Insurance',
                'category' => 'Property',
                'description' => 'Comprehensive protection for your home and belongings against fire, theft, and natural disasters.',
                'base_price' => 500.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Auto Insurance',
                'category' => 'Vehicle',
                'description' => 'Full coverage for your vehicle including collision, liability, and comprehensive protection.',
                'base_price' => 750.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Life Insurance',
                'category' => 'Life',
                'description' => 'Secure your family\'s financial future with term and whole life insurance options.',
                'base_price' => 300.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Health Insurance',
                'category' => 'Health',
                'description' => 'Medical expense coverage including hospitalization, surgery, and prescription drugs.',
                'base_price' => 450.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Travel Insurance',
                'category' => 'Travel',
                'description' => 'Protection for your trips including trip cancellation, medical emergencies, and lost luggage.',
                'base_price' => 120.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        
        foreach ($products as $product) {
            InsuranceProducts::create($product);
        }
        
        $this->command->info('Insurance products seeded successfully!');
        $this->command->info('Total products: ' . InsuranceProducts::count());
    }
}