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
        // Add 'developer' to the `type` enum. MySQL/MariaDB use a native MODIFY; other
        // drivers (e.g. SQLite in tests/CI) recreate the column for portability.
        if (in_array(Schema::getConnection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE users MODIFY COLUMN type ENUM('student', 'parent', 'staff', 'admin', 'it_admin', 'developer') DEFAULT 'staff'");
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->enum('type', ['student', 'parent', 'staff', 'admin', 'it_admin', 'developer'])->default('staff')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'developer' from the `type` enum.
        if (in_array(Schema::getConnection()->getDriverName(), ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE users MODIFY COLUMN type ENUM('student', 'parent', 'staff', 'admin', 'it_admin') DEFAULT 'staff'");
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->enum('type', ['student', 'parent', 'staff', 'admin', 'it_admin'])->default('staff')->change();
            });
        }
    }
};
