<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class EmployeeTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $adminUser;
    protected $department;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        
        $permissions = [
            'view employee',
            'create employee',
            'update employee',
            'delete employee',
        ];

        foreach ($permissions as $perm) {
            Permission::create(['name' => $perm, 'guard_name' => 'web']);
        }

        $role = Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $role->givePermissionTo($permissions);

        Role::create(['name' => 'employee', 'guard_name' => 'web']);

        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole($role);

        $this->department = Department::create([
            'name' => 'IT Department',
            'description' => 'Information Technology',
        ]);
    }

    public function test_can_list_employees()
    {
        $user = User::factory()->create();
        Employee::create([
            'user_id' => $user->id,
            'department_id' => $this->department->id,
            'position' => 'Developer',
            'salary' => 60000,
            'hire_date' => '2023-01-01',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/employees');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'department_id',
                        'user' => ['id', 'name', 'email'],
                        'department' => ['id', 'name'],
                        'position',
                        'salary',
                        'hire_date',
                        'status',
                    ]
                ],
                'meta',
                'links',
            ]);
    }

    public function test_can_create_employee_with_new_user()
    {
        $data = [
            'name' => 'New Employee',
            'email' => 'new.employee@example.com',
            'password' => 'password123',
            'department_id' => $this->department->id,
            'position' => 'Senior Developer',
            'salary' => 80000,
            'hire_date' => '2023-02-01',
            'status' => 'active',
        ];

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/employees', $data);

        $response->assertStatus(201)
            ->assertJsonPath('user.name', 'New Employee')
            ->assertJsonPath('user.email', 'new.employee@example.com')
            ->assertJsonPath('position', 'Senior Developer');

        $this->assertDatabaseHas('users', [
            'email' => 'new.employee@example.com',
        ]);

        $this->assertDatabaseHas('employees', [
            'department_id' => $this->department->id,
            'position' => 'Senior Developer',
        ]);
    }

    public function test_can_create_employee_with_existing_user()
    {
        $existingUser = User::factory()->create();

        $data = [
            'user_id' => $existingUser->id,
            'department_id' => $this->department->id,
            'position' => 'Designer',
            'salary' => 55000,
            'hire_date' => '2023-03-01',
            'status' => 'active',
        ];

        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/employees', $data);

        $response->assertStatus(201)
            ->assertJsonPath('user.id', $existingUser->id)
            ->assertJsonPath('position', 'Designer');

        $this->assertDatabaseHas('employees', [
            'user_id' => $existingUser->id,
            'position' => 'Designer',
        ]);
    }

    public function test_can_update_employee()
    {
        $user = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $user->id,
            'department_id' => $this->department->id,
            'position' => 'Junior Developer',
            'salary' => 40000,
            'hire_date' => '2023-04-01',
            'status' => 'active',
        ]);

        $updateData = [
            'name' => 'Updated Name', // Should update user
            'position' => 'Mid Developer',
            'salary' => 50000,
        ];

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/employees/{$employee->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonPath('position', 'Mid Developer')
            ->assertJsonPath('user.name', 'Updated Name');

        $this->assertDatabaseHas('employees', [
            'id' => $employee->id,
            'position' => 'Mid Developer',
            'salary' => 50000,
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_can_delete_employee()
    {
        $user = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $user->id,
            'department_id' => $this->department->id,
            'position' => 'To Be Deleted',
            'salary' => 30000,
            'hire_date' => '2023-05-01',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/employees/{$employee->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('employees', [
            'id' => $employee->id,
        ]);

        // We decided NOT to delete the user in the service, so user should still exist
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
        ]);
    }

    public function test_validation_errors()
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/employees', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['department_id', 'position', 'salary', 'hire_date', 'status']);
        
        // Either user_id or name/email is required
        // Since we didn't provide user_id, name and email should be required if user_id is missing
        // Wait, StoreEmployeeRequest:
        // 'user_id' => ['nullable', ...],
        // 'name' => ['required_without:user_id', ...],
        // 'email' => ['required_without:user_id', ...],
        
        $response->assertJsonValidationErrors(['name', 'email']);
    }
}
