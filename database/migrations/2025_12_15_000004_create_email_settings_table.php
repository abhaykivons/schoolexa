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
        Schema::create('email_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            
            // Mail driver/provider
            $table->enum('mail_driver', ['smtp', 'sendmail', 'mailgun', 'ses', 'postmark'])->default('smtp');
            
            // SMTP settings
            $table->string('smtp_host')->nullable();
            $table->integer('smtp_port')->nullable();
            $table->string('smtp_username')->nullable();
            $table->text('smtp_password')->nullable(); // Encrypted
            $table->enum('smtp_encryption', ['tls', 'ssl', 'none'])->default('tls');
            
            // Mailgun settings
            $table->string('mailgun_domain')->nullable();
            $table->text('mailgun_secret')->nullable(); // Encrypted
            $table->string('mailgun_endpoint')->nullable();
            
            // AWS SES settings
            $table->string('ses_key')->nullable();
            $table->text('ses_secret')->nullable(); // Encrypted
            $table->string('ses_region')->nullable();
            
            // Postmark settings
            $table->text('postmark_token')->nullable(); // Encrypted
            
            // Default sender info
            $table->string('from_name')->nullable();
            $table->string('from_email')->nullable();
            $table->string('reply_to_email')->nullable();
            
            // Status
            $table->boolean('is_active')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('last_test_at')->nullable();
            $table->text('last_test_result')->nullable();
            
            $table->timestamps();
            
            // Unique constraint per company
            $table->unique('company_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_settings');
    }
};

