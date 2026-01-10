<?php

namespace Database\Seeders;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $permissions = [
            'create department', 'update department', 'delete department', 'view department',
            'create employee', 'update employee', 'delete employee', 'view employee',
            'create attendance', 'update attendance', 'delete attendance', 'view attendance',
            'create leave', 'update leave', 'delete leave', 'view leave',
        ];

        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm);
        }

        $adminRole = Role::findOrCreate('admin');
        $hrRole = Role::findOrCreate('hr_manager');
        $employeeRole = Role::findOrCreate('employee');

        $adminRole->givePermissionTo($permissions);
        $hrRole->givePermissionTo([
            'create department', 'update department', 'view department',
            'create employee', 'update employee', 'view employee',
            'create attendance', 'update attendance', 'view attendance',
            'create leave', 'update leave', 'view leave',
        ]);

        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => 'password',
            ]
        );

        if (! $user->hasRole($adminRole)) {
            $user->assignRole($adminRole);
        }

        $this->call(DepartmentSeeder::class);
        $this->call(EmployeeSeeder::class);
    }
}
