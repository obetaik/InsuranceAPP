<?php
// database/migrations/xxxx_xx_xx_xxxxxx_add_missing_columns_to_policies_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('policies', function (Blueprint $table) {
            // Check if columns exist before adding
            if (!Schema::hasColumn('policies', 'premium_amount')) {
                $table->decimal('premium_amount', 10, 2)->after('policy_number');
            }
            if (!Schema::hasColumn('policies', 'start_date')) {
                $table->date('start_date')->after('premium_amount');
            }
            if (!Schema::hasColumn('policies', 'end_date')) {
                $table->date('end_date')->after('start_date');
            }
            if (!Schema::hasColumn('policies', 'quote_id')) {
                $table->foreignId('quote_id')->nullable()->after('user_id')->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('policies', 'status')) {
                $table->enum('status', ['Active', 'Expired', 'Cancelled'])->default('Active')->after('end_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('policies', function (Blueprint $table) {
            $table->dropColumn([
                'premium_amount',
                'start_date',
                'end_date',
                'quote_id',
                'status'
            ]);
        });
    }
};