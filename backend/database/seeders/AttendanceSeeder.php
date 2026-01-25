<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
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

        // Generate attendance records for the last 30 days
        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now()->subDay(); // Until yesterday

        foreach ($employees as $employee) {
            $currentDate = $startDate->copy();

            while ($currentDate->lte($endDate)) {
                // Skip weekends
                if ($currentDate->isWeekend()) {
                    $currentDate->addDay();
                    continue;
                }

                // Random chance of absence (10% chance)
                if (rand(1, 10) === 1) {
                    Attendance::updateOrCreate(
                        [
                            'employee_id' => $employee->id,
                            'date' => $currentDate->format('Y-m-d'),
                        ],
                        [
                            'check_in' => null,
                            'check_out' => null,
                            'status' => 'absent',
                            'notes' => null,
                        ]
                    );
                } else {
                    // Generate realistic check-in and check-out times
                    $checkInHour = rand(8, 9); // Between 8 AM and 9 AM
                    $checkInMinute = rand(0, 59);
                    $checkIn = $currentDate->copy()->setTime($checkInHour, $checkInMinute);

                    // Work duration between 8-9 hours
                    $workHours = rand(8, 9);
                    $workMinutes = rand(0, 59);
                    $checkOut = $checkIn->copy()->addHours($workHours)->addMinutes($workMinutes);

                    // Determine status
                    $status = 'present';
                    if ($checkInHour >= 9 && $checkInMinute > 15) {
                        $status = 'late';
                    } elseif ($workHours < 8) {
                        $status = 'half_day';
                    }

                    Attendance::updateOrCreate(
                        [
                            'employee_id' => $employee->id,
                            'date' => $currentDate->format('Y-m-d'),
                        ],
                        [
                            'check_in' => $checkIn,
                            'check_out' => $checkOut,
                            'status' => $status,
                            'notes' => $status === 'late' ? 'Traffic delay' : null,
                        ]
                    );
                }

                $currentDate->addDay();
            }
        }

        $this->command->info('Attendance records seeded successfully!');
    }
}
