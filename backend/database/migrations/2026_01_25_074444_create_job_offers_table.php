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
        Schema::create('job_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained('job_applications')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('offered_salary', 12, 2);
            $table->dateTime('offered_date');
            $table->dateTime('expiry_date');
            $table->enum('status', ['sent', 'accepted', 'rejected', 'expired'])->default('sent');
            $table->dateTime('response_date')->nullable();
            $table->text('terms_and_conditions')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('job_application_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_offers');
    }
};
