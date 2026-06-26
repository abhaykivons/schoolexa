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
        Schema::create('admission_form_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_form_id')->constrained('admission_forms')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->comment('School user who added the comment');
            $table->string('field_name')->nullable()->comment('Null means global comment on the form');
            $table->text('comment');
            $table->text('reply')->nullable()->comment('Parent reply to school comment');
            $table->foreignId('reply_by')->nullable()->constrained('users')->onDelete('set null')->comment('User who replied (parent)');
            $table->timestamp('reply_at')->nullable();
            $table->boolean('is_resolved')->default(false)->comment('Parent has addressed this comment');
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            // Indexes
            $table->index(['admission_form_id', 'field_name']);
            $table->index(['admission_form_id', 'is_resolved']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admission_form_comments');
    }
};
