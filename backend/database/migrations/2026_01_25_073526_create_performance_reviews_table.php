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
        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade');
            $table->integer('rating_year');
            $table->enum('period', ['q1', 'q2', 'q3', 'q4', 'annual'])->default('annual');
            $table->text('performance_summary')->nullable();
            $table->text('strengths')->nullable();
            $table->text('areas_for_improvement')->nullable();
            $table->decimal('overall_rating', 3, 2);
            $table->decimal('rating_leadership', 3, 2)->nullable();
            $table->decimal('rating_teamwork', 3, 2)->nullable();
            $table->decimal('rating_communication', 3, 2)->nullable();
            $table->decimal('rating_technical_skills', 3, 2)->nullable();
            $table->decimal('rating_attendance', 3, 2)->nullable();
            $table->enum('status', ['draft', 'submitted', 'approved', 'archived'])->default('draft');
            $table->dateTime('review_date')->nullable();
            $table->text('feedback_from_manager')->nullable();
            $table->timestamps();
            $table->unique(['employee_id', 'period', 'rating_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance_reviews');
    }
};
