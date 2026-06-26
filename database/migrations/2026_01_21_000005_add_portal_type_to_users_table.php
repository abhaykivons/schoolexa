<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('portal_type', ['developer', 'it_admin', 'admin', 'staff', 'parent', 'student'])->nullable()->after('type');
            $table->json('portal_permissions')->nullable()->after('portal_type'); // Additional portal-specific permissions
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['portal_type', 'portal_permissions']);
        });
    }
};
