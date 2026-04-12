// database/migrations/xxxx_xx_xx_xxxxxx_create_claims_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('no action');
            $table->foreignId('policy_id')->constrained()->onDelete('no action');
            $table->string('claim_number')->unique();
            $table->date('incident_date');
            $table->text('description');
            $table->decimal('claim_amount', 10, 2);
            $table->decimal('approved_amount', 10, 2)->nullable();
            $table->enum('status', ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'])->default('Submitted');
            $table->text('documents')->nullable();
            $table->date('resolution_date')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('claims');
    }
};