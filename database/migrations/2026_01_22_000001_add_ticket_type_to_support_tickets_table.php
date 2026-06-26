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
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->enum('ticket_type', ['bug', 'feature_request', 'error_report', 'question', 'other'])->default('question')->after('description');
            $table->date('expected_resolution_date')->nullable()->after('priority');
            $table->json('attachments')->nullable()->after('expected_resolution_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropColumn(['ticket_type', 'expected_resolution_date', 'attachments']);
        });
    }
};
