// database/migrations/xxxx_xx_xx_xxxxxx_create_policies_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('no action');
            $table->foreignId('quote_id')->constrained()->onDelete('no action');
            $table->foreignId('insurance_product_id')->constrained()->onDelete('no action');
            $table->string('policy_number')->unique();
            $table->decimal('premium_amount', 10, 2);
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['Active', 'Expired', 'Cancelled'])->default('Active');
            $table->date('effective_date');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('policies');
    }
};