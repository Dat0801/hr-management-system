<?php

namespace App\Services;

use App\Repositories\JobPositionRepository;
use Illuminate\Database\Eloquent\Collection;

class JobPositionService
{
    private JobPositionRepository $repository;

    public function __construct(JobPositionRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAllPositions(): Collection
    {
        return $this->repository->all();
    }

    public function getPosition(int $id)
    {
        return $this->repository->find($id);
    }

    public function createPosition(array $data)
    {
        $data['posted_date'] = now();
        return $this->repository->create($data);
    }

    public function updatePosition(int $id, array $data)
    {
        $position = $this->repository->find($id);
        return $this->repository->update($position, $data);
    }

    public function deletePosition(int $id): bool
    {
        $position = $this->repository->find($id);
        return $this->repository->delete($position);
    }

    public function closePosition(int $id)
    {
        $position = $this->repository->find($id);
        return $this->repository->update($position, [
            'status' => 'closed',
            'closed_date' => now(),
        ]);
    }

    public function holdPosition(int $id)
    {
        $position = $this->repository->find($id);
        return $this->repository->update($position, ['status' => 'on_hold']);
    }

    public function reopenPosition(int $id)
    {
        $position = $this->repository->find($id);
        return $this->repository->update($position, [
            'status' => 'open',
            'closed_date' => null,
        ]);
    }

    public function getOpenPositions(): Collection
    {
        return $this->repository->getOpenPositions();
    }

    public function getPositionsByDepartment(int $departmentId): Collection
    {
        return $this->repository->getByDepartment($departmentId);
    }

    public function searchPositions(string $query): Collection
    {
        return $this->repository->search($query);
    }

    public function getPositionApplications(int $jobPositionId): Collection
    {
        return $this->repository->getApplicationsByPosition($jobPositionId);
    }
}
