<?php
// database/migrations/xxxx_xx_xx_xxxxxx_add_fields_to_quotes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            if (!Schema::hasColumn('quotes', 'coverage_amount')) {
                $table->decimal('coverage_amount', 10, 2)->nullable()->after('insurance_product_id');
            }
            if (!Schema::hasColumn('quotes', 'deductible')) {
                $table->decimal('deductible', 10, 2)->nullable()->after('coverage_amount');
            }
            if (!Schema::hasColumn('quotes', 'additional_options')) {
                $table->text('additional_options')->nullable()->after('deductible');
            }
            if (!Schema::hasColumn('quotes', 'quote_number')) {
                $table->string('quote_number')->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('quotes', 'calculated_price')) {
                $table->decimal('calculated_price', 10, 2)->nullable()->after('estimated_premium');
            }
        });
    }

    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn([
                'coverage_amount',
                'deductible',
                'additional_options',
                'quote_number',
                'calculated_price'
            ]);
        });
    }
};