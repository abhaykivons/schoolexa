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
        Schema::create('staff_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->text('full_legal_name');
            $table->text('phone_number');
            $table->text('email_address')->unique();
            $table->text('street_address');
            $table->text('city');
            $table->text('state', 2);
            $table->text('zip_code', 10);
            $table->boolean('work_authorized');
            $table->date('date_of_birth');
            $table->text('position_title');
            $table->text('subject_grade_level');
            $table->text('highest_degree');
            $table->text('major_area_of_study');
            $table->text('availability');
            
            // JSON fields for arrays of data
            $table->json('teaching_certifications')->nullable();
            $table->text('other_relevant_certifications')->nullable();
            $table->text('relevant_coursework')->nullable();
            $table->json('employment_history');
            $table->integer('total_years_experience');
            $table->text('administrative_experience')->nullable();
            $table->json('relevant_skills')->nullable();
            $table->text('areas_of_expertise')->nullable();
            $table->text('co_curricular_qualifications')->nullable();
            $table->text('hobbies_interests')->nullable();
            $table->json('references');
            $table->json('documents_accepted');
            
            // File paths
            $table->text('resume_file_path')->nullable();
            $table->text('portfolio_file_path')->nullable();
            
            // Signature and consent
            $table->text('digital_signature');
            $table->boolean('background_check_consent');
            
            // Timestamps
            $table->timestamps();
            
            // Indexes
            $table->index('email_address');
            $table->index('state');
            
            $table->boolean('approval_status')->default(false);
            $table->date('enrollment_date')->nullable();
            $table->foreignId('last_seen_by')->nullable()->constrained('users')->default(null);
            $table->timestamp('last_seen_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_enrollments');
    }
};
