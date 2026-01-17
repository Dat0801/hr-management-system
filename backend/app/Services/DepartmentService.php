<?php

namespace App\Services;

use App\Repositories\DepartmentRepository;

class DepartmentService
{
    public function __construct(
        protected DepartmentRepository $departments,
    ) {}

    public function list(int $perPage = 15)
    {
        return $this->departments->paginateWithEmployeesCount($perPage);
    }

    public function create(array $data)
    {
        return $this->departments->create($data);
    }

    public function get(int $id)
    {
        return $this->departments->findOrFail($id);
    }

    public function update(int $id, array $data)
    {
        return $this->departments->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->departments->delete($id);
    }
}
