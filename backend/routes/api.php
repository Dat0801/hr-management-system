<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\EmployeeController;
use App\Http\Controllers\API\DepartmentController;
use App\Http\Controllers\API\AttendanceController;
use App\Http\Controllers\API\LeaveController;
use App\Http\Controllers\API\PayrollController;
use App\Http\Controllers\API\PerformanceReviewController;
use App\Http\Controllers\API\GoalController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\JobPositionController;
use App\Http\Controllers\API\JobApplicationController;
use App\Http\Controllers\API\InterviewController;
use App\Http\Controllers\API\JobOfferController;

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Public Job Position Routes
Route::get('/job-positions', [JobPositionController::class, 'open']);
Route::get('/job-positions/search', [JobPositionController::class, 'search']);
Route::get('/job-positions/{id}', [JobPositionController::class, 'show']);

// Public Job Application Routes
Route::post('/job-applications', [JobApplicationController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('employees', EmployeeController::class);
    Route::apiResource('attendances', AttendanceController::class);
    Route::apiResource('leaves', LeaveController::class);
    
    // Payroll routes
    Route::apiResource('payrolls', PayrollController::class);
    Route::post('/payrolls/{id}/approve', [PayrollController::class, 'approve']);
    Route::post('/payrolls/{id}/mark-as-paid', [PayrollController::class, 'markAsPaid']);
    Route::get('/payrolls/status/{status}', [PayrollController::class, 'getByStatus']);
    Route::get('/my-payroll', [PayrollController::class, 'getMyPayroll']);

    // Performance Review routes
    Route::apiResource('performance-reviews', PerformanceReviewController::class);
    Route::post('/performance-reviews/{id}/submit', [PerformanceReviewController::class, 'submit']);
    Route::post('/performance-reviews/{id}/approve', [PerformanceReviewController::class, 'approve']);
    Route::get('/performance-reviews/year/{year}', [PerformanceReviewController::class, 'getByYear']);
    Route::get('/performance-reviews/employee/{employeeId}/average', [PerformanceReviewController::class, 'getAverageRating']);
    Route::get('/my-performance-reviews', [PerformanceReviewController::class, 'getMyReviews']);

    // Goal routes
    Route::apiResource('goals', GoalController::class);
    Route::post('/goals/{id}/update-progress', [GoalController::class, 'updateProgress']);
    Route::post('/goals/{id}/complete', [GoalController::class, 'completeGoal']);
    Route::post('/goals/{id}/cancel', [GoalController::class, 'cancelGoal']);
    Route::get('/goals/status/{status}', [GoalController::class, 'getByStatus']);
    Route::get('/goals/overdue', [GoalController::class, 'getOverdueGoals']);
    Route::get('/employee/{employeeId}/goals/completion', [GoalController::class, 'getEmployeeCompletion']);
    Route::get('/my-goals', [GoalController::class, 'getMyGoals']);

    // Report and Analytics routes
    Route::get('/reports/dashboard', [ReportController::class, 'getDashboard']);
    Route::get('/reports/employees', [ReportController::class, 'getEmployeeAnalytics']);
    Route::get('/reports/salary', [ReportController::class, 'getSalaryAnalytics']);
    Route::get('/reports/leave', [ReportController::class, 'getLeaveAnalytics']);
    Route::get('/reports/attendance', [ReportController::class, 'getAttendanceAnalytics']);
    Route::get('/reports/performance', [ReportController::class, 'getPerformanceAnalytics']);
    Route::get('/reports/turnover', [ReportController::class, 'getTurnoverAnalytics']);
    Route::get('/reports/comprehensive', [ReportController::class, 'getComprehensiveReport']);
    Route::post('/reports/export', [ReportController::class, 'exportReport']);

    // Job Position routes (Admin)
    Route::apiResource('job-positions', JobPositionController::class);
    Route::post('/job-positions/{id}/close', [JobPositionController::class, 'close']);
    Route::post('/job-positions/{id}/hold', [JobPositionController::class, 'hold']);
    Route::post('/job-positions/{id}/reopen', [JobPositionController::class, 'reopen']);
    Route::get('/job-positions/{id}/applications', [JobPositionController::class, 'applications']);
    Route::get('/job-positions/by-department/{departmentId}', [JobPositionController::class, 'byDepartment']);

    // Job Application routes
    Route::apiResource('job-applications', JobApplicationController::class, ['only' => ['index', 'show', 'update', 'destroy']]);
    Route::post('/job-applications/{id}/move-to-screening', [JobApplicationController::class, 'moveToScreening']);
    Route::post('/job-applications/{id}/schedule-interview', [JobApplicationController::class, 'scheduleInterview']);
    Route::post('/job-applications/{id}/make-offer', [JobApplicationController::class, 'makeOffer']);
    Route::post('/job-applications/{id}/hire', [JobApplicationController::class, 'hire']);
    Route::post('/job-applications/{id}/reject', [JobApplicationController::class, 'reject']);
    Route::post('/job-applications/{id}/withdraw', [JobApplicationController::class, 'withdraw']);
    Route::post('/job-applications/{id}/rate', [JobApplicationController::class, 'rate']);
    Route::get('/job-applications/status/{status}', [JobApplicationController::class, 'byStatus']);
    Route::get('/job-applications/stats/summary', [JobApplicationController::class, 'stats']);
    Route::get('/job-applications/top-rated', [JobApplicationController::class, 'topRated']);
    Route::get('/job-applications/hired/list', [JobApplicationController::class, 'hired']);

    // Interview routes
    Route::apiResource('interviews', InterviewController::class);
    Route::post('/interviews/{id}/complete', [InterviewController::class, 'complete']);
    Route::post('/interviews/{id}/cancel', [InterviewController::class, 'cancel']);
    Route::get('/interviews/application/{applicationId}', [InterviewController::class, 'byApplication']);
    Route::get('/interviews/scheduled/list', [InterviewController::class, 'scheduled']);

    // Job Offer routes
    Route::apiResource('job-offers', JobOfferController::class);
    Route::post('/job-offers/{id}/accept', [JobOfferController::class, 'accept']);
    Route::post('/job-offers/{id}/reject', [JobOfferController::class, 'reject']);
    Route::get('/job-offers/application/{applicationId}', [JobOfferController::class, 'byApplication']);
    Route::get('/job-offers/pending/list', [JobOfferController::class, 'pending']);
    Route::get('/job-offers/accepted/list', [JobOfferController::class, 'accepted']);
});

