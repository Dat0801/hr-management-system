<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Leave;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalEmployees = Employee::count();
        $activeEmployees = Employee::where('status', 'active')->count();
        
        $today = now()->format('Y-m-d');
        $todayAttendance = Attendance::whereDate('date', $today)->count();
        
        $pendingLeaves = Leave::where('status', 'pending')->count();

        // Calculate trends (comparing to yesterday or last month for simplicity)
        // For now, I'll return hardcoded trends or simple comparisons if possible.
        // Let's stick to simple counts for now to get it working.

        // Department stats
        $departmentStats = Department::withCount('employees')
            ->get()
            ->map(function ($dept) {
                return [
                    'name' => $dept->name,
                    'count' => $dept->employees_count,
                    // Assign random color or fixed based on index in frontend
                ];
            });

        // Recent Activity
        // Combine recent check-ins and leave requests
        $recentAttendances = Attendance::with('employee.user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($attendance) {
                return [
                    'id' => 'att-' . $attendance->id,
                    'name' => $attendance->employee->user->name,
                    'action' => $attendance->check_out ? 'Checked Out' : 'Checked In',
                    'time' => $attendance->updated_at->format('h:i A'),
                    'status' => 'success', // or based on late/early
                    'type' => 'attendance'
                ];
            });

        $recentLeaves = Leave::with('employee.user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => 'leave-' . $leave->id,
                    'name' => $leave->employee->user->name,
                    'action' => 'Applied for Leave',
                    'time' => $leave->created_at->format('h:i A'),
                    'status' => $leave->status,
                    'type' => 'leave'
                ];
            });
        
        // Merge and sort
        $recentActivity = $recentAttendances->concat($recentLeaves)
            ->sortByDesc('time') // This sort might be wrong because time string. Should sort by original timestamp.
            ->take(5)
            ->values(); // Re-index
            
        // Let's re-do recent activity sorting properly
        $recentAttendances = Attendance::with('employee.user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($attendance) {
                return [
                    'id' => 'att-' . $attendance->id,
                    'name' => $attendance->employee ? $attendance->employee->user->name : 'Unknown',
                    'action' => $attendance->check_out ? 'Checked Out' : 'Checked In',
                    'timestamp' => $attendance->updated_at,
                    'time' => $attendance->updated_at->format('h:i A'),
                    'status' => 'success',
                ];
            });

        $recentLeaves = Leave::with('employee.user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => 'leave-' . $leave->id,
                    'name' => $leave->employee ? $leave->employee->user->name : 'Unknown',
                    'action' => 'Applied for Leave',
                    'timestamp' => $leave->created_at,
                    'time' => $leave->created_at->format('h:i A'),
                    'status' => $leave->status,
                ];
            });

        $recentActivity = $recentAttendances->concat($recentLeaves)
            ->sortByDesc('timestamp')
            ->take(5)
            ->values()
            ->map(function ($item) {
                unset($item['timestamp']);
                return $item;
            });


        return response()->json([
            'stats' => [
                [
                    'id' => 1,
                    'title' => 'Total Employees',
                    'value' => $totalEmployees,
                    'trend' => null
                ],
                [
                    'id' => 2,
                    'title' => 'Active Employees',
                    'value' => $activeEmployees,
                    'trend' => null // Calculate logic later if needed
                ],
                [
                    'id' => 3,
                    'title' => 'Today Attendance',
                    'value' => $todayAttendance,
                    'trend' => null
                ],
                [
                    'id' => 4,
                    'title' => 'Pending Leave Requests',
                    'value' => $pendingLeaves,
                    'trend' => null
                ]
            ],
            'recentActivity' => $recentActivity,
            'departments' => $departmentStats
        ]);
    }
}
