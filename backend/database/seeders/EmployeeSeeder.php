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
        $departments = Department::all()->keyBy('name');

        if ($departments->isEmpty()) {
            $this->command->warn('No departments found. Please run DepartmentSeeder first.');
            return;
        }

        $employees = [
            // HR Department
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@company.com',
                'department' => 'Human Resources',
                'position' => 'HR Director',
                'salary' => 85000,
                'hire_date' => '2020-01-15',
                'phone' => '+1-555-0101',
                'address' => '123 Main St',
                'city' => 'New York',
                'country' => 'USA',
                'postal_code' => '10001',
                'status' => 'active',
                'role' => 'hr_manager',
            ],
            [
                'name' => 'Michael Chen',
                'email' => 'michael.chen@company.com',
                'department' => 'Human Resources',
                'position' => 'HR Specialist',
                'salary' => 55000,
                'hire_date' => '2021-06-10',
                'phone' => '+1-555-0102',
                'address' => '456 Oak Ave',
                'city' => 'New York',
                'country' => 'USA',
                'postal_code' => '10002',
                'status' => 'active',
                'role' => 'employee',
            ],

            // IT Department
            [
                'name' => 'David Smith',
                'email' => 'david.smith@company.com',
                'department' => 'Information Technology',
                'position' => 'Senior Software Engineer',
                'salary' => 105000,
                'hire_date' => '2019-03-20',
                'phone' => '+1-555-0103',
                'address' => '789 Tech Blvd',
                'city' => 'San Francisco',
                'country' => 'USA',
                'postal_code' => '94102',
                'status' => 'active',
                'role' => 'employee',
            ],
            [
                'name' => 'Emily Rodriguez',
                'email' => 'emily.rodriguez@company.com',
                'department' => 'Information Technology',
                'position' => 'Full Stack Developer',
                'salary' => 95000,
                'hire_date' => '2021-09-15',
                'phone' => '+1-555-0104',
                'address' => '321 Developer Dr',
                'city' => 'San Francisco',
                'country' => 'USA',
                'postal_code' => '94103',
                'status' => 'active',
                'role' => 'employee',
            ],
            [
                'name' => 'James Wilson',
                'email' => 'james.wilson@company.com',
                'department' => 'Information Technology',
                'position' => 'DevOps Engineer',
                'salary' => 98000,
                'hire_date' => '2020-11-01',
                'phone' => '+1-555-0105',
                'address' => '654 Cloud St',
                'city' => 'San Francisco',
                'country' => 'USA',
                'postal_code' => '94104',
                'status' => 'active',
                'role' => 'employee',
            ],

            // Finance Department
            [
                'name' => 'Lisa Anderson',
                'email' => 'lisa.anderson@company.com',
                'department' => 'Finance',
                'position' => 'Finance Manager',
                'salary' => 90000,
                'hire_date' => '2019-08-12',
                'phone' => '+1-555-0106',
                'address' => '987 Money Ln',
                'city' => 'Chicago',
                'country' => 'USA',
                'postal_code' => '60601',
                'status' => 'active',
                'role' => 'employee',
            ],
            [
                'name' => 'Robert Taylor',
                'email' => 'robert.taylor@company.com',
                'department' => 'Finance',
                'position' => 'Senior Accountant',
                'salary' => 72000,
                'hire_date' => '2020-04-20',
                'phone' => '+1-555-0107',
                'address' => '147 Budget Rd',
                'city' => 'Chicago',
                'country' => 'USA',
                'postal_code' => '60602',
                'status' => 'active',
                'role' => 'employee',
            ],

            // Marketing Department
            [
                'name' => 'Amanda Martinez',
                'email' => 'amanda.martinez@company.com',
                'department' => 'Marketing',
                'position' => 'Marketing Manager',
                'salary' => 82000,
                'hire_date' => '2020-02-15',
                'phone' => '+1-555-0108',
                'address' => '258 Brand St',
                'city' => 'Los Angeles',
                'country' => 'USA',
                'postal_code' => '90001',
                'status' => 'active',
                'role' => 'employee',
            ],
            [
                'name' => 'Christopher Lee',
                'email' => 'christopher.lee@company.com',
                'department' => 'Marketing',
                'position' => 'Digital Marketing Specialist',
                'salary' => 65000,
                'hire_date' => '2021-07-01',
                'phone' => '+1-555-0109',
                'address' => '369 Social Ave',
                'city' => 'Los Angeles',
                'country' => 'USA',
                'postal_code' => '90002',
                'status' => 'active',
                'role' => 'employee',
            ],

            // Sales Department
            [
                'name' => 'Jessica Brown',
                'email' => 'jessica.brown@company.com',
                'department' => 'Sales',
                'position' => 'Sales Director',
                'salary' => 95000,
                'hire_date' => '2019-05-10',
                'phone' => '+1-555-0110',
                'address' => '741 Revenue Rd',
                'city' => 'Boston',
                'country' => 'USA',
                'postal_code' => '02101',
                'status' => 'active',
                'role' => 'employee',
            ],
            [
                'name' => 'Daniel Garcia',
                'email' => 'daniel.garcia@company.com',
                'department' => 'Sales',
                'position' => 'Senior Sales Representative',
                'salary' => 68000,
                'hire_date' => '2020-09-18',
                'phone' => '+1-555-0111',
                'address' => '852 Deal Dr',
                'city' => 'Boston',
                'country' => 'USA',
                'postal_code' => '02102',
                'status' => 'active',
                'role' => 'employee',
            ],
            [
                'name' => 'Michelle White',
                'email' => 'michelle.white@company.com',
                'department' => 'Sales',
                'position' => 'Account Executive',
                'salary' => 62000,
                'hire_date' => '2021-03-25',
                'phone' => '+1-555-0112',
                'address' => '963 Client Ct',
                'city' => 'Boston',
                'country' => 'USA',
                'postal_code' => '02103',
                'status' => 'active',
                'role' => 'employee',
            ],

            // Operations Department
            [
                'name' => 'Kevin Thompson',
                'email' => 'kevin.thompson@company.com',
                'department' => 'Operations',
                'position' => 'Operations Manager',
                'salary' => 78000,
                'hire_date' => '2020-06-15',
                'phone' => '+1-555-0113',
                'address' => '159 Process Pkwy',
                'city' => 'Seattle',
                'country' => 'USA',
                'postal_code' => '98101',
                'status' => 'active',
                'role' => 'employee',
            ],
            [
                'name' => 'Sophia Davis',
                'email' => 'sophia.davis@company.com',
                'department' => 'Operations',
                'position' => 'Operations Coordinator',
                'salary' => 58000,
                'hire_date' => '2021-11-08',
                'phone' => '+1-555-0114',
                'address' => '357 Logistics Ln',
                'city' => 'Seattle',
                'country' => 'USA',
                'postal_code' => '98102',
                'status' => 'active',
                'role' => 'employee',
            ],

            // Customer Service Department
            [
                'name' => 'Brian Miller',
                'email' => 'brian.miller@company.com',
                'department' => 'Customer Service',
                'position' => 'Customer Service Manager',
                'salary' => 62000,
                'hire_date' => '2020-10-20',
                'phone' => '+1-555-0115',
                'address' => '753 Support St',
                'city' => 'Austin',
                'country' => 'USA',
                'postal_code' => '73301',
                'status' => 'active',
                'role' => 'employee',
            ],
            [
                'name' => 'Nicole Harris',
                'email' => 'nicole.harris@company.com',
                'department' => 'Customer Service',
                'position' => 'Customer Support Specialist',
                'salary' => 48000,
                'hire_date' => '2021-12-05',
                'phone' => '+1-555-0116',
                'address' => '951 Help Ave',
                'city' => 'Austin',
                'country' => 'USA',
                'postal_code' => '73302',
                'status' => 'active',
                'role' => 'employee',
            ],

            // Research & Development Department
            [
                'name' => 'Dr. Thomas Clark',
                'email' => 'thomas.clark@company.com',
                'department' => 'Research & Development',
                'position' => 'R&D Director',
                'salary' => 115000,
                'hire_date' => '2019-01-10',
                'phone' => '+1-555-0117',
                'address' => '246 Innovation Blvd',
                'city' => 'San Diego',
                'country' => 'USA',
                'postal_code' => '92101',
                'status' => 'active',
                'role' => 'employee',
            ],
            [
                'name' => 'Rachel Young',
                'email' => 'rachel.young@company.com',
                'department' => 'Research & Development',
                'position' => 'Research Scientist',
                'salary' => 92000,
                'hire_date' => '2020-07-22',
                'phone' => '+1-555-0118',
                'address' => '468 Lab Way',
                'city' => 'San Diego',
                'country' => 'USA',
                'postal_code' => '92102',
                'status' => 'active',
                'role' => 'employee',
            ],
        ];

        foreach ($employees as $empData) {
            $department = $departments->get($empData['department']);
            
            if (!$department) {
                continue;
            }

            $user = User::firstOrCreate(
                ['email' => $empData['email']],
                [
                    'name' => $empData['name'],
                    'password' => bcrypt('password123'),
                ]
            );

            // Assign role if not already assigned
            if (!$user->hasRole($empData['role'])) {
                $user->assignRole($empData['role']);
            }

            Employee::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'department_id' => $department->id,
                    'position' => $empData['position'],
                    'salary' => $empData['salary'],
                    'hire_date' => $empData['hire_date'],
                    'phone' => $empData['phone'],
                    'address' => $empData['address'],
                    'city' => $empData['city'],
                    'country' => $empData['country'],
                    'postal_code' => $empData['postal_code'],
                    'status' => $empData['status'],
                ]
            );
        }

        $this->command->info('Employees seeded successfully!');
    }
}
