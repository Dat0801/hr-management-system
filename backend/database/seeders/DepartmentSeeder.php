<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\User;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        $hrManager = User::where('email', 'hr.manager@example.com')->first();

        $departments = [
            [
                'name' => 'Human Resources',
                'description' => 'Manages employee relations, recruitment, training, and benefits administration',
                'manager_id' => $hrManager?->id,
            ],
            [
                'name' => 'Information Technology',
                'description' => 'Responsible for IT infrastructure, software development, and technical support',
                'manager_id' => $admin?->id,
            ],
            [
                'name' => 'Finance',
                'description' => 'Handles financial planning, accounting, budgeting, and financial reporting',
                'manager_id' => null,
            ],
            [
                'name' => 'Marketing',
                'description' => 'Develops marketing strategies, branding, digital marketing, and customer engagement',
                'manager_id' => null,
            ],
            [
                'name' => 'Sales',
                'description' => 'Drives revenue through customer acquisition, account management, and business development',
                'manager_id' => null,
            ],
            [
                'name' => 'Operations',
                'description' => 'Manages day-to-day business operations, logistics, and process optimization',
                'manager_id' => null,
            ],
            [
                'name' => 'Customer Service',
                'description' => 'Provides customer support, handles inquiries, and ensures customer satisfaction',
                'manager_id' => null,
            ],
            [
                'name' => 'Research & Development',
                'description' => 'Focuses on innovation, product development, and research initiatives',
                'manager_id' => null,
            ],
        ];

        foreach ($departments as $dept) {
            Department::updateOrCreate(
                ['name' => $dept['name']],
                $dept
            );
        }
    }
}
