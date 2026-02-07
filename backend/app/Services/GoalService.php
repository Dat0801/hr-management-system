<?php

namespace App\Services;

use App\Models\Goal;
use App\Repositories\GoalRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class GoalService
{
    public function __construct(private GoalRepository $repository) {}

    public function getAllGoals(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->all($filters, $perPage);
    }

    public function getGoalById(int $id): ?Goal
    {
        return $this->repository->find($id);
    }

    public function getGoalByIdOrFail(int $id): Goal
    {
        return $this->repository->findOrFail($id);
    }

    public function createGoal(array $data): Goal
    {
        return $this->repository->create($data);
    }

    public function updateGoal(int $id, array $data): Goal
    {
        return $this->repository->update($id, $data);
    }

    public function deleteGoal(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function updateProgress(int $id, int $progressPercentage, ?string $notes = null): Goal
    {
        $data = ['progress_percentage' => $progressPercentage];
        if ($notes) {
            $data['progress_notes'] = $notes;
        }

        // Auto-complete goal if progress reaches 100%
        if ($progressPercentage >= 100) {
            $data['status'] = 'completed';
        }

        return $this->repository->update($id, $data);
    }

    public function getEmployeeActiveGoals(int $employeeId): array
    {
        return $this->repository->getEmployeeActiveGoals($employeeId);
    }

    public function getGoalsByStatus(string $status, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getGoalsByStatus($status, $perPage);
    }

    public function getOverdueGoals(): array
    {
        return $this->repository->getOverdueGoals();
    }

    public function completeGoal(int $id): Goal
    {
        return $this->repository->update($id, [
            'status' => 'completed',
            'progress_percentage' => 100,
        ]);
    }

    public function cancelGoal(int $id, ?string $reason = null): Goal
    {
        $data = ['status' => 'cancelled'];
        if ($reason) {
            $data['progress_notes'] = $reason;
        }

        return $this->repository->update($id, $data);
    }

    public function getEmployeeGoalCompletion(int $employeeId): array
    {
        $activeGoals = $this->repository->getEmployeeActiveGoals($employeeId);
        $totalGoals = count($activeGoals);

        if ($totalGoals === 0) {
            return ['total' => 0, 'completed' => 0, 'completion_rate' => 0];
        }

        $completedGoals = array_filter($activeGoals, fn ($g) => $g['status'] === 'completed');

        return [
            'total' => $totalGoals,
            'completed' => count($completedGoals),
            'completion_rate' => (count($completedGoals) / $totalGoals) * 100,
        ];
    }
}
