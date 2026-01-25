<?php

namespace App\Repositories;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\Leave;
use App\Models\Attendance;
use App\Models\PerformanceReview;
use App\Models\Department;

class ReportRepository
{
    /**
     * Get total employee count
     */
    public function getTotalEmployees(): int
    {
        return Employee::where('status', 'active')->count();
    }

    /**
     * Get employee count by department
     */
    public function getEmployeesByDepartment(): array
    {
        return Department::withCount(['employees' => function ($q) {
            $q->where('status', 'active');
        }])
        ->get(['id', 'name'])
        ->map(fn ($dept) => [
            'department_id' => $dept->id,
            'department_name' => $dept->name,
            'employee_count' => $dept->employees_count,
        ])
        ->toArray();
    }

    /**
     * Get employee count by position
     */
    public function getEmployeesByPosition(): array
    {
        return Employee::where('status', 'active')
            ->select('position')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('position')
            ->get()
            ->toArray();
    }

    /**
     * Get total salary expenses for given month/year
     */
    public function getTotalSalaryExpenses(int $month = null, int $year = null): float
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        return (float) Payroll::where('month', $month)
            ->where('year', $year)
            ->where('status', 'paid')
            ->sum('net_salary');
    }

    /**
     * Get average salary by department
     */
    public function getAverageSalaryByDepartment(int $year = null): array
    {
        $year = $year ?? now()->year;

        return Department::with('employees')
            ->get()
            ->map(function ($dept) use ($year) {
                $avgSalary = Payroll::whereHas('employee', function ($q) use ($dept) {
                    $q->where('department_id', $dept->id);
                })
                ->where('year', $year)
                ->avg('net_salary');

                return [
                    'department_id' => $dept->id,
                    'department_name' => $dept->name,
                    'average_salary' => $avgSalary ? (float) $avgSalary : 0,
                ];
            })
            ->toArray();
    }

    /**
     * Get leave statistics for period
     */
    public function getLeaveStatistics(int $year = null): array
    {
        $year = $year ?? now()->year;

        $leaves = Leave::whereYear('start_date', $year)
            ->select('type')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('SUM(DATEDIFF(end_date, start_date) + 1) as total_days')
            ->where('status', 'approved')
            ->groupBy('type')
            ->get()
            ->toArray();

        return $leaves;
    }

    /**
     * Get attendance statistics
     */
    public function getAttendanceStatistics(int $year = null): array
    {
        $year = $year ?? now()->year;

        $total = Attendance::whereYear('date', $year)->count();
        $present = Attendance::whereYear('date', $year)->where('status', 'present')->count();
        $absent = Attendance::whereYear('date', $year)->where('status', 'absent')->count();
        $late = Attendance::whereYear('date', $year)->where('status', 'late')->count();

        return [
            'total_records' => $total,
            'present' => $present,
            'present_percentage' => $total > 0 ? ($present / $total) * 100 : 0,
            'absent' => $absent,
            'absent_percentage' => $total > 0 ? ($absent / $total) * 100 : 0,
            'late' => $late,
            'late_percentage' => $total > 0 ? ($late / $total) * 100 : 0,
        ];
    }

    /**
     * Get turnover analysis
     */
    public function getTurnoverAnalysis(): array
    {
        $currentYear = now()->year;
        $totalEmployees = Employee::count();
        $departedEmployees = Employee::where('status', 'inactive')->orWhere('status', 'terminated')->count();

        return [
            'total_employees' => $totalEmployees,
            'departed_employees' => $departedEmployees,
            'turnover_rate' => $totalEmployees > 0 ? ($departedEmployees / $totalEmployees) * 100 : 0,
        ];
    }

    /**
     * Get performance statistics
     */
    public function getPerformanceStatistics(int $year = null): array
    {
        $year = $year ?? now()->year;

        $reviews = PerformanceReview::where('rating_year', $year)
            ->selectRaw('ROUND(overall_rating, 1) as rating')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('rating')
            ->orderBy('rating', 'desc')
            ->get()
            ->toArray();

        $avgRating = PerformanceReview::where('rating_year', $year)->avg('overall_rating');

        return [
            'average_rating' => $avgRating ? (float) round($avgRating, 2) : 0,
            'total_reviews' => PerformanceReview::where('rating_year', $year)->count(),
            'rating_distribution' => $reviews,
        ];
    }

    /**
     * Get payroll summary for period
     */
    public function getPayrollSummary(int $month = null, int $year = null): array
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        $payrolls = Payroll::where('month', $month)
            ->where('year', $year)
            ->get();

        return [
            'period' => "$month/$year",
            'total_payrolls' => $payrolls->count(),
            'paid' => $payrolls->where('status', 'paid')->count(),
            'pending' => $payrolls->where('status', '!=', 'paid')->count(),
            'total_gross_salary' => (float) $payrolls->sum('gross_salary'),
            'total_net_salary' => (float) $payrolls->sum('net_salary'),
            'total_tax' => (float) $payrolls->sum('tax_amount'),
            'total_insurance' => (float) $payrolls->sum('insurance_amount'),
        ];
    }

    /**
     * Get employee distribution by status
     */
    public function getEmployeeDistributionByStatus(): array
    {
        return Employee::select('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(fn ($emp) => [
                'status' => $emp->status,
                'count' => $emp->count,
            ])
            ->toArray();
    }

    /**
     * Get new hires in period
     */
    public function getNewHires(int $year = null): int
    {
        $year = $year ?? now()->year;

        return Employee::whereYear('hire_date', $year)->count();
    }

    /**
     * Get department summary
     */
    public function getDepartmentSummary(): array
    {
        return Department::with('employees')
            ->get()
            ->map(function ($dept) {
                $avgRating = PerformanceReview::whereHas('employee', function ($q) use ($dept) {
                    $q->where('department_id', $dept->id);
                })->avg('overall_rating');

                return [
                    'id' => $dept->id,
                    'name' => $dept->name,
                    'employee_count' => $dept->employees->where('status', 'active')->count(),
                    'average_performance_rating' => $avgRating ? (float) round($avgRating, 2) : 0,
                ];
            })
            ->toArray();
    }

    /**
     * Get top performers
     */
    public function getTopPerformers(int $limit = 10, int $year = null): array
    {
        $year = $year ?? now()->year;

        return PerformanceReview::where('rating_year', $year)
            ->with(['employee.user'])
            ->orderBy('overall_rating', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn ($review) => [
                'employee_id' => $review->employee_id,
                'employee_name' => $review->employee->user->name,
                'position' => $review->employee->position,
                'rating' => (float) $review->overall_rating,
            ])
            ->toArray();
    }

    /**
     * Get employees needing improvement
     */
    public function getEmployeesNeedingImprovement(float $threshold = 2.5, int $year = null): array
    {
        $year = $year ?? now()->year;

        return PerformanceReview::where('rating_year', $year)
            ->where('overall_rating', '<', $threshold)
            ->with(['employee.user', 'employee.department'])
            ->get()
            ->map(fn ($review) => [
                'employee_id' => $review->employee_id,
                'employee_name' => $review->employee->user->name,
                'position' => $review->employee->position,
                'department' => $review->employee->department->name,
                'rating' => (float) $review->overall_rating,
            ])
            ->toArray();
    }
}
