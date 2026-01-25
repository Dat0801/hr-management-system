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
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained('job_applications')->onDelete('cascade');
            $table->foreignId('interviewer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->dateTime('scheduled_date');
            $table->integer('duration_minutes')->default(60);
            $table->enum('interview_type', ['phone', 'video', 'in_person'])->default('in_person');
            $table->text('notes')->nullable();
            $table->enum('status', ['scheduled', 'completed', 'cancelled', 'rescheduled'])->default('scheduled');
            $table->decimal('rating', 3, 1)->nullable();
            $table->text('feedback')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('job_application_id');
            $table->index('scheduled_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
