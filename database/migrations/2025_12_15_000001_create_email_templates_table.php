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
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            
            // Template identification
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            
            // Template category/module
            $table->enum('category', [
                'parent',
                'student', 
                'staff',
                'enrollment',
                'admission',
                'approval',
                'notification',
                'general'
            ])->default('general');
            
            // Template type/event
            $table->string('event_type');
            
            // Email content
            $table->string('subject');
            $table->longText('body');
            
            // Optional fields
            $table->string('from_name')->nullable();
            $table->string('from_email')->nullable();
            $table->string('reply_to')->nullable();
            $table->string('cc')->nullable();
            $table->string('bcc')->nullable();
            
            // Available variables for this template
            $table->json('available_variables')->nullable();
            
            // Template status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            
            // Tracking
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['company_id', 'category']);
            $table->index(['company_id', 'event_type']);
            $table->index(['company_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};

