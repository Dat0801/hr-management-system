<?php

namespace App\Repositories;

use App\Models\Payroll;
use Illuminate\Pagination\Paginator;

class PayrollRepository
{
    public function __construct(private Payroll $model)
    {
    }

    public function all(array $filters = [], int $perPage = 15): Paginator
    {
        $query = $this->model->query()->with(['employee.user', 'employee.department']);

        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['month'])) {
            $query->where('month', $filters['month']);
        }

        if (isset($filters['year'])) {
            $query->where('year', $filters['year']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('employee.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->paginate($perPage);
    }

    public function find(int $id): ?Payroll
    {
        return $this->model->with(['employee.user', 'employee.department'])->find($id);
    }

    public function create(array $data): Payroll
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): Payroll
    {
        $payroll = $this->find($id);
        $payroll->update($data);
        return $payroll;
    }

    public function delete(int $id): bool
    {
        return $this->model->destroy($id) > 0;
    }

    public function getByEmployeeAndPeriod(int $employeeId, int $month, int $year): ?Payroll
    {
        return $this->model->where('employee_id', $employeeId)
            ->where('month', $month)
            ->where('year', $year)
            ->first();
    }

    public function getEmployeePayrollHistory(int $employeeId, int $limit = 12): array
    {
        return $this->model->where('employee_id', $employeeId)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function getPayrollsByStatus(string $status, int $perPage = 15): Paginator
    {
        return $this->model->where('status', $status)
            ->with(['employee.user', 'employee.department'])
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->paginate($perPage);
    }
}
