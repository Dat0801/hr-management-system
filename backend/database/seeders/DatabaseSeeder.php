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
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'create department', 'update department', 'delete department', 'view department',
            'create employee', 'update employee', 'delete employee', 'view employee',
            'create attendance', 'update attendance', 'delete attendance', 'view attendance',
            'create leave', 'update leave', 'delete leave', 'view leave',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $hrRole = Role::firstOrCreate(['name' => 'hr_manager', 'guard_name' => 'web']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);

        $adminRole->givePermissionTo(Permission::all());
        
        $hrPermissions = [
            'create department', 'update department', 'view department',
            'create employee', 'update employee', 'view employee',
            'create attendance', 'update attendance', 'view attendance',
            'create leave', 'update leave', 'view leave',
        ];
        
        $hrRole->givePermissionTo($hrPermissions);

        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => 'password',
            ]
        );

        if (! $user->hasRole('admin')) {
            $user->assignRole($adminRole);
        }

        $this->call(DepartmentSeeder::class);
        $this->call(EmployeeSeeder::class);
    }
}
