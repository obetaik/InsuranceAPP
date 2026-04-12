// database/migrations/xxxx_xx_xx_xxxxxx_create_quotes_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('quote_number')->unique()->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('no action');
            $table->foreignId('insurance_product_id')->constrained()->onDelete('no action');
            $table->decimal('coverage_amount', 10, 2)->nullable();
            $table->decimal('deductible', 10, 2)->nullable();
            $table->text('additional_options')->nullable();
            $table->decimal('estimated_premium', 10, 2);
            $table->decimal('calculated_price', 10, 2)->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('quotes');
    }
};