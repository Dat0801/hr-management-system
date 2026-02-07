<?php

namespace App\Services;

use App\Models\Payroll;
use App\Repositories\PayrollRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class PayrollService
{
    public function __construct(private PayrollRepository $repository) {}

    public function getAllPayrolls(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->all($filters, $perPage);
    }

    public function getPayrollById(int $id): ?Payroll
    {
        return $this->repository->find($id);
    }

    public function createPayroll(array $data): Payroll
    {
        // Calculate gross salary
        $grossSalary = $data['base_salary']
            + ($data['overtime_amount'] ?? 0)
            + ($data['bonus_amount'] ?? 0)
            + ($data['allowances'] ?? 0);

        $data['gross_salary'] = $grossSalary;

        // Calculate net salary
        $totalDeductions = ($data['tax_amount'] ?? 0)
            + ($data['insurance_amount'] ?? 0)
            + ($data['deductions'] ?? 0);

        $netSalary = $grossSalary - $totalDeductions;
        $data['net_salary'] = $netSalary;

        return $this->repository->create($data);
    }

    public function updatePayroll(int $id, array $data): Payroll
    {
        // Recalculate gross and net salary if any component changed
        if (isset($data['base_salary']) || isset($data['overtime_amount']) ||
            isset($data['bonus_amount']) || isset($data['allowances'])) {

            $payroll = $this->repository->find($id);
            $base = $data['base_salary'] ?? $payroll->base_salary;
            $overtime = $data['overtime_amount'] ?? $payroll->overtime_amount;
            $bonus = $data['bonus_amount'] ?? $payroll->bonus_amount;
            $allowances = $data['allowances'] ?? $payroll->allowances;

            $grossSalary = $base + $overtime + $bonus + $allowances;
            $data['gross_salary'] = $grossSalary;
        }

        if (isset($data['tax_amount']) || isset($data['insurance_amount']) || isset($data['deductions'])) {
            $payroll = $this->repository->find($id);
            $grossSalary = $data['gross_salary'] ?? $payroll->gross_salary;
            $tax = $data['tax_amount'] ?? $payroll->tax_amount;
            $insurance = $data['insurance_amount'] ?? $payroll->insurance_amount;
            $deductions = $data['deductions'] ?? $payroll->deductions;

            $netSalary = $grossSalary - ($tax + $insurance + $deductions);
            $data['net_salary'] = $netSalary;
        }

        return $this->repository->update($id, $data);
    }

    public function deletePayroll(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function getPayrollsByEmployeeAndPeriod(int $employeeId, int $month, int $year): ?Payroll
    {
        return $this->repository->getByEmployeeAndPeriod($employeeId, $month, $year);
    }

    public function getEmployeePayrollHistory(int $employeeId, int $limit = 12): array
    {
        return $this->repository->getEmployeePayrollHistory($employeeId, $limit);
    }

    public function approvePayroll(int $id): Payroll
    {
        return $this->repository->update($id, ['status' => 'approved']);
    }

    public function markAsPaid(int $id, ?string $paidDate = null): Payroll
    {
        $data = [
            'status' => 'paid',
            'paid_date' => $paidDate ?? now(),
        ];

        return $this->repository->update($id, $data);
    }

    public function getPayrollsByStatus(string $status, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getPayrollsByStatus($status, $perPage);
    }

    public function calculatePayroll(array $employeeData): array
    {
        $baseSalary = $employeeData['base_salary'];
        $overtimeAmount = $employeeData['overtime_amount'] ?? 0;
        $bonusAmount = $employeeData['bonus_amount'] ?? 0;
        $allowances = $employeeData['allowances'] ?? 0;

        $grossSalary = $baseSalary + $overtimeAmount + $bonusAmount + $allowances;

        // Simple tax calculation: 10% of gross salary
        $taxAmount = $employeeData['tax_amount'] ?? ($grossSalary * 0.1);

        // Insurance: 8% of gross salary
        $insuranceAmount = $employeeData['insurance_amount'] ?? ($grossSalary * 0.08);

        $deductions = $employeeData['deductions'] ?? 0;
        $totalDeductions = $taxAmount + $insuranceAmount + $deductions;

        $netSalary = $grossSalary - $totalDeductions;

        return [
            'gross_salary' => $grossSalary,
            'tax_amount' => $taxAmount,
            'insurance_amount' => $insuranceAmount,
            'net_salary' => $netSalary,
        ];
    }
}
