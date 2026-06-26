<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('school_size');
            $table->string('company_website')->nullable()->after('company_name');
            $table->string('partner_type')->nullable()->after('company_website');
        });

        // Widen the `type` enum to include 'partner' and 'contact'. MySQL/MariaDB use a
        // native MODIFY; other drivers (e.g. SQLite in tests/CI) recreate the column via
        // the schema builder so migrations stay portable.
        if (in_array(Schema::getConnection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE leads MODIFY COLUMN type ENUM('waitlist', 'demo', 'contact_sales', 'free_trial', 'partner', 'contact') DEFAULT 'waitlist'");
        } else {
            Schema::table('leads', function (Blueprint $table) {
                $table->enum('type', ['waitlist', 'demo', 'contact_sales', 'free_trial', 'partner', 'contact'])->default('waitlist')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn(['company_name', 'company_website', 'partner_type']);
        });

        if (in_array(Schema::getConnection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE leads MODIFY COLUMN type ENUM('waitlist', 'demo', 'contact_sales', 'free_trial') DEFAULT 'waitlist'");
        } else {
            Schema::table('leads', function (Blueprint $table) {
                $table->enum('type', ['waitlist', 'demo', 'contact_sales', 'free_trial'])->default('waitlist')->change();
            });
        }
    }
};
