<?php

namespace App\Repositories;

use App\Models\Employee;

class EmployeeRepository extends BaseRepository
{
    public function getModel(): string
    {
        return Employee::class;
    }

    public function paginateWith(array $relations, int $perPage = 15)
    {
        return $this->model->with($relations)->paginate($perPage);
    }

    public function getWithRelations(int $id)
    {
        return $this->model->with(['user', 'department', 'attendances', 'leaves'])->findOrFail($id);
    }

    public function getAllWithRelations()
    {
        return $this->model->with(['user', 'department'])->get();
    }

    public function paginateWithRelations(int $perPage = 15)
    {
        return $this->model->with(['user', 'department'])->paginate($perPage);
    }

    public function findByUserId(int $userId)
    {
        return $this->model->where('user_id', $userId)->first();
    }

    public function findByDepartment(int $departmentId)
    {
        return $this->model->where('department_id', $departmentId)->get();
    }

    public function findByStatus(string $status)
    {
        return $this->model->where('status', $status)->get();
    }
}
