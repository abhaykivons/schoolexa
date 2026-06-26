<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This table tracks student enrollment records by academic year.
     * Each year, a new enrollment record is created when student is promoted/re-enrolled.
     * This allows tracking of:
     * - Year-wise class assignments
     * - Year-wise class teacher assignments
     * - Student history and past records
     */
    public function up(): void
    {
        Schema::create('student_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->foreignId('grade_id')->constrained();
            $table->foreignId('class_id')->constrained('school_classes');
            $table->foreignId('class_teacher_id')->nullable()->constrained('staff');
            
            // Roll number within the class for this academic year
            $table->string('roll_number')->nullable();
            
            // Enrollment details
            $table->date('enrollment_date');
            $table->date('leaving_date')->nullable();
            
            // Status: active, promoted, transferred, withdrawn, completed
            $table->string('status')->default('active');
            
            // For tracking promotions
            $table->foreignId('promoted_from_enrollment_id')->nullable()
                ->constrained('student_enrollments')->nullOnDelete();
            
            // Additional notes
            $table->text('remarks')->nullable();
            
            $table->timestamps();
            
            // Ensure a student can only have one enrollment per academic year
            $table->unique(['student_id', 'academic_year_id']);
            
            // Index for quick lookups
            $table->index(['academic_year_id', 'class_id']);
            $table->index(['student_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_enrollments');
    }
};

