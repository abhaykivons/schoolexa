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
        Schema::create('approval_flows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('module_type'); // e.g., 'staff-enrollment'
            $table->foreignId('user_id')->constrained('users');
            $table->unsignedInteger('order')->default(1);
            $table->boolean('is_email_send')->default(true);
            $table->string('comment')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('approval_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('module_type');
            $table->unsignedBigInteger('module_id'); // ID of the record in the module's table
            $table->foreignId('user_id')->constrained('users'); // The user who took action
            $table->enum('status', ['pending', 'approved', 'rejected', 'reassigned']);
            $table->text('comments')->nullable();
            $table->json('data_snapshot')->nullable(); // Snapshot of data at time of approval
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_flows');
    }
};
