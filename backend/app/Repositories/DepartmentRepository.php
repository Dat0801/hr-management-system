<?php

namespace App\Repositories;

use App\Models\Department;

class DepartmentRepository extends BaseRepository
{
    public function getModel(): string
    {
        return Department::class;
    }

    public function paginateWithEmployeesCount(int $perPage = 15)
    {
        return $this->model->withCount('employees')->paginate($perPage);
    }
}
