<?php

namespace App\Repositories;

use App\Models\Goal;
use Illuminate\Pagination\LengthAwarePaginator;

class GoalRepository
{
    public function __construct(private Goal $model) {}

    public function all(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->query()->with(['employee.user', 'createdBy']);

        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        return $query->orderBy('due_date', 'asc')->paginate($perPage);
    }

    public function find(int $id): ?Goal
    {
        return $this->model->with(['employee.user', 'createdBy'])->find($id);
    }

    public function findOrFail(int $id): Goal
    {
        return $this->model->with(['employee.user', 'createdBy'])->findOrFail($id);
    }

    public function create(array $data): Goal
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): Goal
    {
        $goal = $this->find($id);
        
        if (! $goal) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Goal not found');
        }
        
        $goal->update($data);

        return $goal;
    }

    public function delete(int $id): bool
    {
        return $this->model->destroy($id) > 0;
    }

    public function getEmployeeActiveGoals(int $employeeId): array
    {
        return $this->model->where('employee_id', $employeeId)
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled')
            ->orderBy('due_date', 'asc')
            ->get()
            ->toArray();
    }

    public function getGoalsByStatus(string $status, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->where('status', $status)
            ->with(['employee.user', 'createdBy'])
            ->orderBy('due_date', 'asc')
            ->paginate($perPage);
    }

    public function getOverdueGoals(): array
    {
        return $this->model->where('due_date', '<', now())
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'cancelled')
            ->with(['employee.user'])
            ->orderBy('due_date', 'asc')
            ->get()
            ->toArray();
    }
}
