<?php

namespace App\Repositories;

use App\Models\PerformanceReview;
use Illuminate\Pagination\Paginator;

class PerformanceReviewRepository
{
    public function __construct(private PerformanceReview $model)
    {
    }

    public function all(array $filters = [], int $perPage = 15): Paginator
    {
        $query = $this->model->query()->with(['employee.user', 'employee.department', 'reviewer']);

        if (isset($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (isset($filters['year'])) {
            $query->where('rating_year', $filters['year']);
        }

        if (isset($filters['period'])) {
            $query->where('period', $filters['period']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('employee.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('rating_year', 'desc')->orderBy('period', 'desc')->paginate($perPage);
    }

    public function find(int $id): ?PerformanceReview
    {
        return $this->model->with(['employee.user', 'employee.department', 'reviewer', 'feedback.fromUser'])->find($id);
    }

    public function create(array $data): PerformanceReview
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): PerformanceReview
    {
        $review = $this->find($id);
        $review->update($data);
        return $review;
    }

    public function delete(int $id): bool
    {
        return $this->model->destroy($id) > 0;
    }

    public function getByEmployeeAndPeriod(int $employeeId, string $period, int $year): ?PerformanceReview
    {
        return $this->model->where('employee_id', $employeeId)
            ->where('period', $period)
            ->where('rating_year', $year)
            ->first();
    }

    public function getEmployeeReviews(int $employeeId, int $limit = 10): array
    {
        return $this->model->where('employee_id', $employeeId)
            ->with(['reviewer'])
            ->orderBy('rating_year', 'desc')
            ->orderBy('period', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function getReviewsByYear(int $year, int $perPage = 15): Paginator
    {
        return $this->model->where('rating_year', $year)
            ->with(['employee.user', 'employee.department', 'reviewer'])
            ->orderBy('period', 'desc')
            ->paginate($perPage);
    }
}
