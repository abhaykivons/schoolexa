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
        Schema::create('admission_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('form_id')->constrained('student_admission_forms')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->comment('User who submitted/updated');
            
            // Form type for quick filtering
            $table->enum('form_type', [
                'pre_enrollment',
                'health_summary',
                'online_services',
                'enrollment_document',
                'emergency_contact',
                'transportation',
                'dietary_requirements',
                'extracurricular'
            ])->index();
            
            // text columns for form data
            $table->text('latest_data')->nullable()->comment('Most recent submission data');
            $table->text('approved_data')->nullable()->comment('Approved version data');
            
            // Approval tracking
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            
            // Status tracking
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft')->index();
            
            // Version tracking
            $table->integer('version')->default(1)->comment('Increments on each update');
            
            // Timestamps
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['student_id', 'form_type']);
            $table->index(['student_id', 'status']);
            $table->unique(['student_id', 'form_id'], 'unique_student_form');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admission_forms');
    }
};
