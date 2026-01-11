<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\EmployeeRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EmployeeService
{
    public function __construct(
        protected EmployeeRepository $employees,
    ) {}

    public function list(int $perPage = 15)
    {
        return $this->employees->paginateWith(['user', 'department'], $perPage);
    }

    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            $user = null;
            
            if (!empty($data['user_id'])) {
                $user = User::find($data['user_id']);
            } elseif (!empty($data['email'])) {
                $user = User::where('email', $data['email'])->first();
            }

            if (!$user) {
                $password = $data['password'] ?? Str::random(10);
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make($password),
                ]);
                
                // Assign default role if using Spatie Permission
                if (method_exists($user, 'assignRole')) {
                    $user->assignRole('employee');
                }
            }
            
            $data['user_id'] = $user->id;

            // Check for existing soft-deleted employee
            $existingEmployee = \App\Models\Employee::withTrashed()
                ->where('user_id', $user->id)
                ->first();

            if ($existingEmployee) {
                if ($existingEmployee->trashed()) {
                    $existingEmployee->restore();
                    // Remove user data from employee data array
                    $employeeData = collect($data)->except(['name', 'email', 'password', 'user_id'])->toArray();
                    $this->employees->update($existingEmployee->id, $employeeData);
                    return $existingEmployee->refresh();
                } else {
                    // This should be caught by validation, but just in case
                    throw new \Exception('Employee already exists and is active.');
                }
            }

            // Remove user data from employee data array
            $employeeData = collect($data)->except(['name', 'email', 'password'])->toArray();

            return $this->employees->create($employeeData);
        });
    }

    public function get(int $id)
    {
        return $this->employees->getWithRelations($id);
    }

    public function update(int $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $employee = $this->employees->findOrFail($id);

            // Update user info if provided
            if (isset($data['name']) || isset($data['email'])) {
                $userData = [];
                if (isset($data['name'])) $userData['name'] = $data['name'];
                if (isset($data['email'])) $userData['email'] = $data['email'];
                
                $employee->user->update($userData);
            }

            // Remove user data from employee data array
            $employeeData = collect($data)->except(['name', 'email', 'password'])->toArray();

            return $this->employees->update($id, $employeeData);
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $employee = $this->employees->findOrFail($id);
            $user = $employee->user;
            
            $deleted = $this->employees->delete($id);
            
            // Optionally delete the user account too?
            // Usually we might want to keep the user or soft delete.
            // But since the relationship is 1:1 and tight, let's delete the user for now
            // or let the database cascade handle it if configured (onDelete('cascade') is on employees table, but that deletes employee when user is deleted)
            // The migration says: $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            // This means if User is deleted, Employee is deleted.
            // But here we are deleting Employee. Should we delete User?
            // If we delete Employee, the User remains.
            // Let's leave User for now as they might have other roles or data.
            // But for a simple CRUD where we created the user, we might want to delete.
            // Given "CRUD for employees", deleting an employee usually implies removing them from the system.
            // However, keeping the user account allows re-hiring or history.
            // Let's stick to deleting the employee record only as per standard repository pattern.
            
            return $deleted;
        });
    }
}
