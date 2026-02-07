<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Payroll;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PayrollSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = Employee::where('status', 'active')->get();

        if ($employees->isEmpty()) {
            $this->command->warn('No active employees found. Please run EmployeeSeeder first.');

            return;
        }

        // Generate payroll records for the last 6 months
        $currentDate = Carbon::now();
        $monthsToGenerate = 6;

        foreach ($employees as $employee) {
            for ($i = 0; $i < $monthsToGenerate; $i++) {
                $targetDate = $currentDate->copy()->subMonths($i);
                $month = $targetDate->month;
                $year = $targetDate->year;

                // Base salary from employee record
                $baseSalary = (float) $employee->salary;

                // Generate random additional amounts
                $overtimeAmount = rand(0, 5000); // 0 to 5000
                $bonusAmount = rand(0, 10000); // 0 to 10000
                $allowances = rand(500, 2000); // 500 to 2000
                $deductions = rand(0, 1000); // 0 to 1000

                // Calculate gross salary (base + overtime + bonus + allowances)
                $grossSalary = $baseSalary + $overtimeAmount + $bonusAmount + $allowances;

                // Calculate tax (approximately 20% of gross)
                $taxAmount = round($grossSalary * 0.20, 2);

                // Calculate insurance (approximately 5% of gross)
                $insuranceAmount = round($grossSalary * 0.05, 2);

                // Calculate net salary (gross - tax - insurance - deductions)
                $netSalary = $grossSalary - $taxAmount - $insuranceAmount - $deductions;

                // Determine status based on how recent the month is
                $status = 'paid';
                $paidDate = null;

                if ($i === 0) {
                    // Current month - might be draft or pending
                    $status = rand(0, 1) === 0 ? 'draft' : 'pending';
                } elseif ($i === 1) {
                    // Last month - might be approved or paid
                    $status = rand(0, 1) === 0 ? 'approved' : 'paid';
                    if ($status === 'paid') {
                        $paidDate = $targetDate->copy()->endOfMonth()->subDays(rand(0, 5));
                    }
                } else {
                    // Older months - should be paid
                    $status = 'paid';
                    $paidDate = $targetDate->copy()->endOfMonth()->subDays(rand(0, 5));
                }

                Payroll::updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'month' => $month,
                        'year' => $year,
                    ],
                    [
                        'base_salary' => $baseSalary,
                        'overtime_amount' => $overtimeAmount,
                        'bonus_amount' => $bonusAmount,
                        'allowances' => $allowances,
                        'deductions' => $deductions,
                        'tax_amount' => $taxAmount,
                        'insurance_amount' => $insuranceAmount,
                        'net_salary' => $netSalary,
                        'gross_salary' => $grossSalary,
                        'status' => $status,
                        'paid_date' => $paidDate,
                        'notes' => $status === 'paid' ? 'Monthly payroll processed' : null,
                    ]
                );
            }
        }

        $this->command->info('Payroll records seeded successfully!');
    }
}
