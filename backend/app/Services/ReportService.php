<?php

namespace App\Services;

use App\Repositories\ReportRepository;

class ReportService
{
    public function __construct(private ReportRepository $repository)
    {
    }

    public function getDashboardStats(): array
    {
        return [
            'total_employees' => $this->repository->getTotalEmployees(),
            'new_hires_this_year' => $this->repository->getNewHires(),
            'turnover_analysis' => $this->repository->getTurnoverAnalysis(),
            'payroll_summary' => $this->repository->getPayrollSummary(),
            'attendance_statistics' => $this->repository->getAttendanceStatistics(),
            'performance_statistics' => $this->repository->getPerformanceStatistics(),
        ];
    }

    public function getEmployeeAnalytics(): array
    {
        return [
            'by_department' => $this->repository->getEmployeesByDepartment(),
            'by_position' => $this->repository->getEmployeesByPosition(),
            'by_status' => $this->repository->getEmployeeDistributionByStatus(),
            'department_summary' => $this->repository->getDepartmentSummary(),
        ];
    }

    public function getSalaryAnalytics(int $year = null): array
    {
        $year = $year ?? now()->year;

        return [
            'total_salary_expenses' => $this->repository->getTotalSalaryExpenses(null, $year),
            'average_salary_by_department' => $this->repository->getAverageSalaryByDepartment($year),
        ];
    }

    public function getLeaveAnalytics(int $year = null): array
    {
        $year = $year ?? now()->year;

        return [
            'leave_statistics' => $this->repository->getLeaveStatistics($year),
        ];
    }

    public function getAttendanceAnalytics(int $year = null): array
    {
        $year = $year ?? now()->year;

        return [
            'attendance_statistics' => $this->repository->getAttendanceStatistics($year),
        ];
    }

    public function getPerformanceAnalytics(int $year = null): array
    {
        $year = $year ?? now()->year;

        return [
            'performance_statistics' => $this->repository->getPerformanceStatistics($year),
            'top_performers' => $this->repository->getTopPerformers(10, $year),
            'needs_improvement' => $this->repository->getEmployeesNeedingImprovement(2.5, $year),
        ];
    }

    public function getTurnoverAnalytics(): array
    {
        return [
            'turnover_analysis' => $this->repository->getTurnoverAnalysis(),
        ];
    }

    public function getComprehensiveReport(int $year = null): array
    {
        $year = $year ?? now()->year;

        return [
            'dashboard' => $this->getDashboardStats(),
            'employees' => $this->getEmployeeAnalytics(),
            'salary' => $this->getSalaryAnalytics($year),
            'attendance' => $this->getAttendanceAnalytics($year),
            'leave' => $this->getLeaveAnalytics($year),
            'performance' => $this->getPerformanceAnalytics($year),
            'turnover' => $this->getTurnoverAnalytics(),
        ];
    }
}
