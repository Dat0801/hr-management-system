<?php

namespace Database\Seeders;

use App\Models\Leave;
use App\Models\Employee;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LeaveSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = Employee::where('status', 'active')->get();
        $admins = User::role('admin')->get();
        $hrManagers = User::role('hr_manager')->get();
        
        $approvers = $admins->merge($hrManagers);

        if ($employees->isEmpty()) {
            $this->command->warn('No active employees found. Please run EmployeeSeeder first.');
            return;
        }

        if ($approvers->isEmpty()) {
            $this->command->warn('No approvers found. Leave requests will have no approver.');
        }

        $leaveTypes = ['annual', 'sick', 'personal', 'emergency', 'unpaid'];
        $statuses = ['pending', 'approved', 'rejected'];

        // Generate leave requests for the past 3 months and future 2 months
        foreach ($employees as $employee) {
            $numberOfLeaves = rand(2, 5); // Each employee has 2-5 leave requests

            for ($i = 0; $i < $numberOfLeaves; $i++) {
                $type = $leaveTypes[array_rand($leaveTypes)];
                
                // Generate random leave dates (between 3 months ago and 2 months ahead)
                $startDate = Carbon::now()
                    ->subMonths(3)
                    ->addDays(rand(0, 150));

                // Leave duration between 1-5 days
                $duration = rand(1, 5);

                $endDate = $startDate->copy()->addDays($duration - 1);

                // Status logic: most past leaves are approved, future leaves are pending
                if ($startDate->isPast()) {
                    $status = (rand(1, 10) > 2) ? 'approved' : 'rejected'; // 80% approved
                } else {
                    $status = 'pending'; // Future leaves are pending
                }

                // Reason based on type
                $reasons = [
                    'annual' => ['Family vacation', 'Personal travel', 'Holiday trip', 'Annual time off', 'Rest and relaxation'],
                    'sick' => ['Medical appointment', 'Flu symptoms', 'Doctor consultation', 'Health checkup', 'Feeling unwell'],
                    'personal' => ['Personal matters', 'Family event', 'Home affairs', 'Personal commitment', 'Family obligation'],
                    'emergency' => ['Family emergency', 'Urgent personal matter', 'Unexpected situation', 'Critical family issue'],
                    'unpaid' => ['Extended personal leave', 'Unpaid time off', 'Personal sabbatical'],
                ];

                $reason = $reasons[$type][array_rand($reasons[$type])];

                $leaveData = [
                    'type' => $type,
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'reason' => $reason,
                    'status' => $status,
                ];

                // Add approver info if leave is approved or rejected
                if ($status !== 'pending' && $approvers->isNotEmpty()) {
                    $approver = $approvers->random();
                    $leaveData['approved_by'] = $approver->id;
                    $leaveData['approval_date'] = $startDate->copy()->subDays(rand(1, 5));
                }

                Leave::updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'start_date' => $leaveData['start_date'],
                        'end_date' => $leaveData['end_date'],
                    ],
                    $leaveData
                );
            }
        }

        $this->command->info('Leave records seeded successfully!');
    }
}
