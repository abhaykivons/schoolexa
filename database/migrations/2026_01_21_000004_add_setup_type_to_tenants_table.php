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
        Schema::table('tenants', function (Blueprint $table) {
            $table->enum('setup_type', ['public_portal', 'cloud_hosted', 'private_setup'])->default('public_portal')->after('name');
            $table->boolean('allows_multiple_campuses')->default(false)->after('setup_type');
            $table->json('module_settings')->nullable()->after('data'); // Tenant-level module settings
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['setup_type', 'allows_multiple_campuses', 'module_settings']);
        });
    }
};
