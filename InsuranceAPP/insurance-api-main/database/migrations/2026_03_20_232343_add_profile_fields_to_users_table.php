<?php
// database/migrations/xxxx_xx_xx_xxxxxx_add_profile_fields_to_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->text('address')->nullable()->after('phone');
            $table->string('city')->nullable()->after('address');
            $table->string('state')->nullable()->after('city');
            $table->string('zip_code')->nullable()->after('state');
            $table->string('auth0_id')->nullable()->unique()->after('zip_code');
            $table->string('avatar')->nullable()->after('auth0_id');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active')->after('avatar');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone', 'address', 'city', 'state', 'zip_code',
                'auth0_id', 'avatar', 'status', 'email_verified_at', 'last_login_at'
            ]);
        });
    }
};