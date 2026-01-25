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
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('performance_review_id')->constrained('performance_reviews')->onDelete('cascade');
            $table->foreignId('from_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('feedback_type', ['manager', 'peer', 'subordinate', 'self', 'client'])->default('manager');
            $table->integer('rating')->nullable();
            $table->text('comment');
            $table->enum('status', ['pending', 'acknowledged', 'archived'])->default('pending');
            $table->dateTime('acknowledged_at')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};
