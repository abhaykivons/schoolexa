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
        Schema::create('enrollment_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->text('name');
            $table->text('description')->nullable();
            $table->string('type'); // e.g., 'Module Type like staff-enrollment'
            $table->text('file_path')->nullable(); // Path to the file if type is 'file' or 'image'
            $table->text('text_content')->nullable();
            $table->boolean('is_required')->default(false); // Whether the document is required
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollment_documents');
    }
};
