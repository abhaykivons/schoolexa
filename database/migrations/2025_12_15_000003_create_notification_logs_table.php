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
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            
            // Related flow and template
            $table->foreignId('notification_flow_id')->nullable()->constrained('notification_flows')->nullOnDelete();
            $table->foreignId('email_template_id')->nullable()->constrained('email_templates')->nullOnDelete();
            
            // Event details
            $table->string('trigger_event');
            $table->string('trigger_entity_type')->nullable(); // e.g., 'App\Models\Student'
            $table->unsignedBigInteger('trigger_entity_id')->nullable();
            
            // Recipient info
            $table->string('recipient_type'); // 'parent', 'student', 'staff', 'custom'
            $table->string('recipient_email');
            $table->string('recipient_name')->nullable();
            $table->unsignedBigInteger('recipient_user_id')->nullable();
            
            // Notification channels used
            $table->boolean('email_sent')->default(false);
            $table->boolean('in_app_sent')->default(false);
            $table->boolean('sms_sent')->default(false);
            
            // Email content (stored for reference)
            $table->string('subject')->nullable();
            $table->longText('body')->nullable();
            
            // Status
            $table->enum('status', ['pending', 'sent', 'failed', 'queued'])->default('pending');
            $table->text('error_message')->nullable();
            
            // Timing
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            
            // Variables used
            $table->json('variables')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['company_id', 'status']);
            $table->index(['company_id', 'trigger_event']);
            $table->index(['company_id', 'created_at']);
            $table->index(['recipient_email']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};

