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
        Schema::create('public_holidays', function (Blueprint $table) {
            $table->id();
            $table->string('country_code', 2)->nullable(); // ISO country code (e.g., 'US', 'IN'), null for global
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('date'); // Specific date for the holiday
            $table->date('end_date')->nullable(); // For multi-day holidays
            $table->boolean('recurring')->default(true); // Recurring holidays repeat yearly
            $table->integer('recurrence_type')->default(1); // 1 = yearly fixed date, 2 = yearly calculated (e.g., Easter)
            $table->string('month')->nullable(); // For recurring holidays (1-12)
            $table->integer('day')->nullable(); // For recurring holidays (day of month)
            $table->string('color', 20)->default('#ef4444'); // Default red color for holidays
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['country_code', 'date']);
            $table->index(['recurring', 'month', 'day']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('public_holidays');
    }
};

