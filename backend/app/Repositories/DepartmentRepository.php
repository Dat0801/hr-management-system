<?php

namespace App\Repositories;

use App\Models\Department;

class DepartmentRepository extends BaseRepository
{
    public function getModel(): string
    {
        return Department::class;
    }
}
