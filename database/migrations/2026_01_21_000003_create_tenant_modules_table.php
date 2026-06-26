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
        Schema::create('tenant_modules', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id'); // Tenant ID (not foreign key as it's in central DB)
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->foreignId('module_version_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('is_enabled')->default(true);
            $table->json('custom_config')->nullable(); // Tenant-specific module configuration
            $table->json('custom_overrides')->nullable(); // Custom code/file overrides
            $table->boolean('auto_update')->default(true); // Whether to auto-update this module
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'module_id']);
            $table->index('tenant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_modules');
    }
};
