<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            ['name' => 'Human Resources', 'description' => 'Handles employee relations and benefits.'],
            ['name' => 'Engineering', 'description' => 'Responsible for software development and infrastructure.'],
            ['name' => 'Sales', 'description' => 'Focuses on customer acquisition and revenue.'],
            ['name' => 'Marketing', 'description' => 'Promotes the company brand and products.'],
            ['name' => 'Finance', 'description' => 'Manages company finances and accounting.'],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(['name' => $dept['name']], $dept);
        }
    }
}
