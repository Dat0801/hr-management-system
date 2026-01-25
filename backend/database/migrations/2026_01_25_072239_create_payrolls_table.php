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
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->integer('month'); // 1-12
            $table->integer('year'); // 2024, 2025, etc
            $table->decimal('base_salary', 15, 2);
            $table->decimal('overtime_amount', 15, 2)->default(0);
            $table->decimal('bonus_amount', 15, 2)->default(0);
            $table->decimal('allowances', 15, 2)->default(0); // allowances
            $table->decimal('deductions', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('insurance_amount', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2); // final salary
            $table->decimal('gross_salary', 15, 2); // before tax and insurance
            $table->enum('status', ['draft', 'pending', 'approved', 'paid'])->default('draft');
            $table->dateTime('paid_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Unique constraint for employee + month + year
            $table->unique(['employee_id', 'month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
