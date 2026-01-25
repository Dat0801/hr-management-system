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
        Schema::create('job_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('requirements')->nullable();
            $table->integer('headcount');
            $table->enum('employment_type', ['full_time', 'part_time', 'contract', 'intern'])->default('full_time');
            $table->enum('status', ['open', 'closed', 'on_hold'])->default('open');
            $table->decimal('salary_from', 12, 2)->nullable();
            $table->decimal('salary_to', 12, 2)->nullable();
            $table->dateTime('posted_date');
            $table->dateTime('closed_date')->nullable();
            $table->integer('applications_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_positions');
    }
};
