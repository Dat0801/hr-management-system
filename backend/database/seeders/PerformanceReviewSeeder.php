<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\PerformanceReview;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PerformanceReviewSeeder extends Seeder
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

        // Get managers/reviewers (users with hr_manager role or admin role)
        $reviewers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['hr_manager', 'admin']);
        })->get();

        if ($reviewers->isEmpty()) {
            $this->command->warn('No reviewers found. Please ensure HR managers or admins exist.');

            return;
        }

        $currentYear = Carbon::now()->year;
        $yearsToGenerate = [$currentYear - 1, $currentYear]; // Last year and current year
        $periods = ['q1', 'q2', 'q3', 'q4', 'annual'];

        foreach ($employees as $employee) {
            foreach ($yearsToGenerate as $year) {
                // Generate quarterly reviews
                foreach (['q1', 'q2', 'q3', 'q4'] as $period) {
                    $reviewer = $reviewers->random();

                    // Generate realistic ratings (scale 1.0 to 5.0)
                    $overallRating = round(rand(30, 50) / 10, 2); // 3.0 to 5.0
                    $ratingLeadership = round(rand(25, 50) / 10, 2);
                    $ratingTeamwork = round(rand(30, 50) / 10, 2);
                    $ratingCommunication = round(rand(30, 50) / 10, 2);
                    $ratingTechnicalSkills = round(rand(30, 50) / 10, 2);
                    $ratingAttendance = round(rand(35, 50) / 10, 2);

                    // Determine status based on year and period
                    $status = 'approved';
                    $reviewDate = null;

                    if ($year === $currentYear) {
                        // Current year - might be draft or submitted
                        if ($period === 'q4') {
                            $status = rand(0, 1) === 0 ? 'draft' : 'submitted';
                        } else {
                            $status = 'approved';
                            $reviewDate = $this->getReviewDateForPeriod($year, $period);
                        }
                    } else {
                        // Past year - should be approved
                        $status = 'approved';
                        $reviewDate = $this->getReviewDateForPeriod($year, $period);
                    }

                    PerformanceReview::updateOrCreate(
                        [
                            'employee_id' => $employee->id,
                            'period' => $period,
                            'rating_year' => $year,
                        ],
                        [
                            'reviewer_id' => $reviewer->id,
                            'overall_rating' => $overallRating,
                            'rating_leadership' => $ratingLeadership,
                            'rating_teamwork' => $ratingTeamwork,
                            'rating_communication' => $ratingCommunication,
                            'rating_technical_skills' => $ratingTechnicalSkills,
                            'rating_attendance' => $ratingAttendance,
                            'status' => $status,
                            'review_date' => $reviewDate,
                            'performance_summary' => "Strong performance during {$period} {$year}. Demonstrated excellent work ethic and commitment to team goals.",
                            'strengths' => 'Excellent technical skills, strong communication abilities, reliable attendance, and good teamwork.',
                            'areas_for_improvement' => 'Could benefit from more leadership opportunities and advanced training in emerging technologies.',
                            'feedback_from_manager' => $status === 'approved' ? 'Keep up the great work! Continue focusing on professional development.' : null,
                        ]
                    );
                }

                // Generate annual review
                $reviewer = $reviewers->random();
                $overallRating = round(rand(35, 50) / 10, 2);
                $ratingLeadership = round(rand(30, 50) / 10, 2);
                $ratingTeamwork = round(rand(35, 50) / 10, 2);
                $ratingCommunication = round(rand(35, 50) / 10, 2);
                $ratingTechnicalSkills = round(rand(35, 50) / 10, 2);
                $ratingAttendance = round(rand(40, 50) / 10, 2);

                $status = $year === $currentYear ? 'draft' : 'approved';
                $reviewDate = $year === $currentYear ? null : Carbon::create($year, 12, 31)->subDays(rand(0, 10));

                PerformanceReview::updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'period' => 'annual',
                        'rating_year' => $year,
                    ],
                    [
                        'reviewer_id' => $reviewer->id,
                        'overall_rating' => $overallRating,
                        'rating_leadership' => $ratingLeadership,
                        'rating_teamwork' => $ratingTeamwork,
                        'rating_communication' => $ratingCommunication,
                        'rating_technical_skills' => $ratingTechnicalSkills,
                        'rating_attendance' => $ratingAttendance,
                        'status' => $status,
                        'review_date' => $reviewDate,
                        'performance_summary' => "Annual review for {$year}. Overall strong performance with consistent contributions throughout the year.",
                        'strengths' => 'Consistent high-quality work, excellent collaboration skills, strong technical expertise, and reliable performance.',
                        'areas_for_improvement' => 'Focus on strategic thinking and cross-functional collaboration. Consider mentoring junior team members.',
                        'feedback_from_manager' => $status === 'approved' ? 'Outstanding year! Your contributions have been valuable to the team. Looking forward to continued growth.' : null,
                    ]
                );
            }
        }

        $this->command->info('Performance reviews seeded successfully!');
    }

    /**
     * Get review date for a specific period and year.
     */
    private function getReviewDateForPeriod(int $year, string $period): Carbon
    {
        return match ($period) {
            'q1' => Carbon::create($year, 3, 31)->subDays(rand(0, 10)),
            'q2' => Carbon::create($year, 6, 30)->subDays(rand(0, 10)),
            'q3' => Carbon::create($year, 9, 30)->subDays(rand(0, 10)),
            'q4' => Carbon::create($year, 12, 31)->subDays(rand(0, 10)),
            default => Carbon::create($year, 12, 31)->subDays(rand(0, 10)),
        };
    }
}
