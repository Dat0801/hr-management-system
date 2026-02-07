<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Goal;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class GoalSeeder extends Seeder
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

        // Get managers/creators (users with hr_manager role or admin role)
        $creators = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['hr_manager', 'admin']);
        })->get();

        if ($creators->isEmpty()) {
            // Fallback to any user
            $creators = User::all();
        }

        if ($creators->isEmpty()) {
            $this->command->warn('No users found. Please ensure users exist.');

            return;
        }

        $categories = ['business', 'professional', 'personal', 'technical'];
        $statuses = ['not_started', 'in_progress', 'completed', 'cancelled'];

        // Goal templates for different categories
        $goalTemplates = [
            'business' => [
                ['title' => 'Increase Sales Revenue', 'description' => 'Achieve 20% increase in sales revenue for the quarter'],
                ['title' => 'Improve Customer Satisfaction', 'description' => 'Raise customer satisfaction score to 4.5/5'],
                ['title' => 'Reduce Operational Costs', 'description' => 'Identify and implement cost-saving measures'],
                ['title' => 'Expand Market Reach', 'description' => 'Enter 2 new market segments'],
            ],
            'professional' => [
                ['title' => 'Complete Professional Certification', 'description' => 'Obtain industry-recognized certification'],
                ['title' => 'Attend Industry Conference', 'description' => 'Participate in annual industry conference'],
                ['title' => 'Mentor Junior Team Members', 'description' => 'Provide guidance to 3 junior team members'],
                ['title' => 'Publish Technical Article', 'description' => 'Write and publish article on technical expertise'],
            ],
            'personal' => [
                ['title' => 'Improve Work-Life Balance', 'description' => 'Maintain healthy work-life balance'],
                ['title' => 'Enhance Communication Skills', 'description' => 'Complete communication skills training'],
                ['title' => 'Build Professional Network', 'description' => 'Connect with 20+ professionals in the industry'],
            ],
            'technical' => [
                ['title' => 'Master New Technology Stack', 'description' => 'Learn and implement new technology framework'],
                ['title' => 'Improve Code Quality', 'description' => 'Achieve 95%+ code coverage in unit tests'],
                ['title' => 'Optimize System Performance', 'description' => 'Reduce system response time by 30%'],
                ['title' => 'Implement Security Best Practices', 'description' => 'Complete security audit and implement recommendations'],
            ],
        ];

        foreach ($employees as $employee) {
            // Generate 3-5 goals per employee
            $numberOfGoals = rand(3, 5);
            $creator = $creators->random();

            for ($i = 0; $i < $numberOfGoals; $i++) {
                $category = $categories[array_rand($categories)];
                $template = $goalTemplates[$category][array_rand($goalTemplates[$category])];

                // Determine status and dates based on goal index
                $status = $statuses[array_rand($statuses)];
                $progressPercentage = 0;
                $startDate = Carbon::now()->subMonths(rand(1, 6));
                $dueDate = Carbon::now()->addMonths(rand(1, 6));

                // Adjust status and progress based on dates
                if ($startDate->isPast() && $dueDate->isFuture()) {
                    // Active goal
                    $status = rand(0, 1) === 0 ? 'not_started' : 'in_progress';
                    $progressPercentage = $status === 'in_progress' ? rand(10, 90) : 0;
                } elseif ($dueDate->isPast()) {
                    // Past due - might be completed or cancelled
                    $status = rand(0, 2) === 0 ? 'completed' : (rand(0, 1) === 0 ? 'in_progress' : 'cancelled');
                    $progressPercentage = $status === 'completed' ? 100 : ($status === 'in_progress' ? rand(50, 95) : 0);
                } else {
                    // Future goal
                    $status = 'not_started';
                    $progressPercentage = 0;
                }

                // Ensure completed goals have 100% progress
                if ($status === 'completed') {
                    $progressPercentage = 100;
                }

                // Generate unique identifier for updateOrCreate
                $uniqueKey = $employee->id.'_'.$template['title'].'_'.$startDate->format('Y-m-d');

                Goal::updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'title' => $template['title'],
                        'start_date' => $startDate,
                    ],
                    [
                        'created_by' => $creator->id,
                        'description' => $template['description'],
                        'category' => $category,
                        'success_criteria' => 'Measurable outcomes: completion of key deliverables, achievement of target metrics, and positive feedback from stakeholders.',
                        'start_date' => $startDate,
                        'due_date' => $dueDate,
                        'status' => $status,
                        'progress_percentage' => $progressPercentage,
                        'progress_notes' => $status === 'completed' ? 'Goal successfully completed on time.' : ($status === 'in_progress' ? 'Making good progress towards completion.' : null),
                        'weight' => round(rand(50, 100) / 100, 2), // 0.50 to 1.00
                        'alignment_with_company' => 'This goal aligns with company objectives of growth, innovation, and excellence in service delivery.',
                    ]
                );
            }
        }

        $this->command->info('Goals seeded successfully!');
    }
}
