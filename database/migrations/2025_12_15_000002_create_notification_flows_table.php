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
        Schema::create('notification_flows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            
            // Flow identification
            $table->string('name');
            $table->text('description')->nullable();
            
            // Trigger event
            $table->string('trigger_event'); // e.g., 'student_enrolled', 'admission_approved'
            
            // Recipients configuration
            $table->json('recipients'); // ['parent', 'student', 'staff', 'custom_emails']
            $table->json('custom_emails')->nullable(); // Additional email addresses
            
            // Notification channels
            $table->boolean('send_email')->default(true);
            $table->boolean('send_in_app')->default(false);
            $table->boolean('send_sms')->default(false);
            
            // Email template to use
            $table->foreignId('email_template_id')->nullable()->constrained('email_templates')->nullOnDelete();
            
            // Timing configuration
            $table->enum('send_timing', ['immediate', 'delayed', 'scheduled'])->default('immediate');
            $table->integer('delay_minutes')->nullable(); // For delayed notifications
            $table->string('schedule_time')->nullable(); // For scheduled (e.g., "09:00")
            
            // Conditions (optional filtering)
            $table->json('conditions')->nullable(); // e.g., {"grade": "5", "status": "active"}
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0); // Higher priority executes first
            
            // Tracking
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['company_id', 'trigger_event']);
            $table->index(['company_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_flows');
    }
};

