<?php

namespace App\Services;

use App\Repositories\EmployeeRepository;

class EmployeeService
{
    public function __construct(
        protected EmployeeRepository $employees,
    ) {}

    public function list(int $perPage = 15)
    {
        return $this->employees->paginateWith(['user','department'], $perPage);
    }

    public function create(array $data)
    {
        return $this->employees->create($data);
    }

    public function get(int $id)
    {
        return $this->employees->findOrFail($id);
    }

    public function update(int $id, array $data)
    {
        return $this->employees->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->employees->delete($id);
    }
}
