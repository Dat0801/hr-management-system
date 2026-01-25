<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private ReportService $reportService)
    {
        $this->middleware('auth:sanctum');
        $this->middleware('can:view reports');
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboard(): JsonResponse
    {
        $stats = $this->reportService->getDashboardStats();

        return response()->json([
            'data' => $stats,
        ]);
    }

    /**
     * Get employee analytics
     */
    public function getEmployeeAnalytics(): JsonResponse
    {
        $analytics = $this->reportService->getEmployeeAnalytics();

        return response()->json([
            'data' => $analytics,
        ]);
    }

    /**
     * Get salary analytics for year
     */
    public function getSalaryAnalytics(Request $request): JsonResponse
    {
        $year = $request->query('year', now()->year);

        $analytics = $this->reportService->getSalaryAnalytics((int)$year);

        return response()->json([
            'data' => $analytics,
        ]);
    }

    /**
     * Get leave analytics
     */
    public function getLeaveAnalytics(Request $request): JsonResponse
    {
        $year = $request->query('year', now()->year);

        $analytics = $this->reportService->getLeaveAnalytics((int)$year);

        return response()->json([
            'data' => $analytics,
        ]);
    }

    /**
     * Get attendance analytics
     */
    public function getAttendanceAnalytics(Request $request): JsonResponse
    {
        $year = $request->query('year', now()->year);

        $analytics = $this->reportService->getAttendanceAnalytics((int)$year);

        return response()->json([
            'data' => $analytics,
        ]);
    }

    /**
     * Get performance analytics
     */
    public function getPerformanceAnalytics(Request $request): JsonResponse
    {
        $year = $request->query('year', now()->year);

        $analytics = $this->reportService->getPerformanceAnalytics((int)$year);

        return response()->json([
            'data' => $analytics,
        ]);
    }

    /**
     * Get turnover analytics
     */
    public function getTurnoverAnalytics(): JsonResponse
    {
        $analytics = $this->reportService->getTurnoverAnalytics();

        return response()->json([
            'data' => $analytics,
        ]);
    }

    /**
     * Get comprehensive annual report
     */
    public function getComprehensiveReport(Request $request): JsonResponse
    {
        $year = $request->query('year', now()->year);

        $report = $this->reportService->getComprehensiveReport((int)$year);

        return response()->json([
            'data' => $report,
            'year' => $year,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Export report as JSON (can be extended for PDF/Excel)
     */
    public function exportReport(Request $request): JsonResponse
    {
        $request->validate([
            'report_type' => 'required|in:dashboard,employees,salary,leave,attendance,performance,turnover,comprehensive',
            'year' => 'nullable|integer|min:2000|max:2099',
        ]);

        $reportType = $request->input('report_type');
        $year = $request->input('year', now()->year);

        $data = match($reportType) {
            'dashboard' => $this->reportService->getDashboardStats(),
            'employees' => $this->reportService->getEmployeeAnalytics(),
            'salary' => $this->reportService->getSalaryAnalytics($year),
            'leave' => $this->reportService->getLeaveAnalytics($year),
            'attendance' => $this->reportService->getAttendanceAnalytics($year),
            'performance' => $this->reportService->getPerformanceAnalytics($year),
            'turnover' => $this->reportService->getTurnoverAnalytics(),
            'comprehensive' => $this->reportService->getComprehensiveReport($year),
            default => [],
        };

        return response()->json([
            'report_type' => $reportType,
            'data' => $data,
            'exported_at' => now()->format('Y-m-d H:i:s'),
        ]);
    }
}
