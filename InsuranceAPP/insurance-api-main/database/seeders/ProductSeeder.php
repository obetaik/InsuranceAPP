public function run()
{
    $products = [
        ['name' => 'Auto Insurance Basic', 'description' => 'Basic coverage for your vehicle', 'base_price' => 500.00],
        ['name' => 'Auto Insurance Premium', 'description' => 'Comprehensive coverage', 'base_price' => 800.00],
        ['name' => 'Home Insurance Basic', 'description' => 'Coverage for your home', 'base_price' => 600.00],
        ['name' => 'Home Insurance Premium', 'description' => 'Comprehensive home coverage', 'base_price' => 950.00],
        ['name' => 'Life Insurance Term', 'description' => 'Term life insurance', 'base_price' => 300.00],
        ['name' => 'Health Insurance Basic', 'description' => 'Basic health coverage', 'base_price' => 400.00],
    ];
    
    foreach ($products as $product) {
        \App\Models\InsuranceProduct::create($product);
    }
}