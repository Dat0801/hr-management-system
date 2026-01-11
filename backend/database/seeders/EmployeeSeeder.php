<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employee;
use App\Models\User;
use App\Models\Department;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have departments
        $hrDept = Department::where('name', 'Human Resources')->first();
        $engDept = Department::where('name', 'Engineering')->first();

        if (!$hrDept || !$engDept) {
            return;
        }

        // Create an HR Manager Employee
        $hrUser = User::firstOrCreate(
            ['email' => 'hr@example.com'],
            [
                'name' => 'HR Manager',
                'password' => 'password',
            ]
        );
        $hrUser->assignRole('hr_manager');

        Employee::firstOrCreate(
            ['user_id' => $hrUser->id],
            [
                'department_id' => $hrDept->id,
                'position' => 'HR Manager',
                'salary' => 80000,
                'hire_date' => '2023-01-15',
                'status' => 'active',
            ]
        );

        // Create a Software Engineer
        $devUser = User::firstOrCreate(
            ['email' => 'dev@example.com'],
            [
                'name' => 'John Doe',
                'password' => 'password',
            ]
        );
        $devUser->assignRole('employee');

        Employee::firstOrCreate(
            ['user_id' => $devUser->id],
            [
                'department_id' => $engDept->id,
                'position' => 'Software Engineer',
                'salary' => 95000,
                'hire_date' => '2023-03-01',
                'status' => 'active',
            ]
        );
    }
}
