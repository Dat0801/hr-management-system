<?php

namespace App\Repositories;

use App\Models\JobPosition;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\Paginator;

class JobPositionRepository
{
    public function all(): Collection
    {
        return JobPosition::with('department')->get();
    }

    public function find(int $id): JobPosition
    {
        return JobPosition::with('department', 'jobApplications')->findOrFail($id);
    }

    public function create(array $data): JobPosition
    {
        return JobPosition::create($data);
    }

    public function update(JobPosition $jobPosition, array $data): JobPosition
    {
        $jobPosition->update($data);
        return $jobPosition;
    }

    public function delete(JobPosition $jobPosition): bool
    {
        return $jobPosition->delete();
    }

    public function getByStatus(string $status): Collection
    {
        return JobPosition::where('status', $status)->with('department')->get();
    }

    public function getByDepartment(int $departmentId): Collection
    {
        return JobPosition::where('department_id', $departmentId)->with('department')->get();
    }

    public function getOpenPositions(): Collection
    {
        return JobPosition::where('status', 'open')->with('department')->get();
    }

    public function getApplicationsByPosition(int $jobPositionId): Collection
    {
        return JobPosition::findOrFail($jobPositionId)->jobApplications()->get();
    }

    public function getPositionsWithApplicationCount(): Collection
    {
        return JobPosition::withCount('jobApplications')->get();
    }

    public function search(string $query): Collection
    {
        return JobPosition::where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->with('department')
            ->get();
    }

    public function paginate(int $perPage = 15): Paginator
    {
        return JobPosition::with('department')
            ->paginate($perPage);
    }
}
