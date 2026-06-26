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
        Schema::create('module_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->string('version'); // e.g., "1.0.0", "2.1.3"
            $table->string('release_name')->nullable(); // e.g., "Stable", "Beta", "Alpha"
            $table->text('changelog')->nullable();
            $table->json('migration_files')->nullable(); // Array of migration file paths
            $table->json('routes')->nullable(); // Routes this version adds/modifies
            $table->json('permissions')->nullable(); // Permissions this version introduces
            $table->boolean('is_stable')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('released_at')->nullable();
            $table->timestamps();

            $table->unique(['module_id', 'version']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_versions');
    }
};
