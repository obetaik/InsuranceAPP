// database/migrations/xxxx_xx_xx_xxxxxx_create_insurance_products_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('insurance_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');          
            $table->text('description');
            $table->decimal('base_price', 10, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('insurance_products');
    }
};