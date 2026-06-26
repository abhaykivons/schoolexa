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
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Student Management", "Attendance", "Fee Management"
            $table->string('code')->unique(); // e.g., "student_management", "attendance", "fee_management"
            $table->text('description')->nullable();
            $table->string('category')->nullable(); // e.g., "core", "academic", "financial", "communication"
            $table->boolean('is_core')->default(false); // Core modules cannot be disabled
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('dependencies')->nullable(); // Array of module codes this module depends on
            $table->json('config_schema')->nullable(); // JSON schema for module configuration
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
