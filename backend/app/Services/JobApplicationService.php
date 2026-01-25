<?php

namespace App\Services;

use App\Repositories\JobApplicationRepository;
use App\Repositories\JobPositionRepository;
use Illuminate\Database\Eloquent\Collection;

class JobApplicationService
{
    private JobApplicationRepository $repository;
    private JobPositionRepository $positionRepository;

    public function __construct(
        JobApplicationRepository $repository,
        JobPositionRepository $positionRepository
    ) {
        $this->repository = $repository;
        $this->positionRepository = $positionRepository;
    }

    public function getAllApplications(): Collection
    {
        return $this->repository->all();
    }

    public function getApplication(int $id)
    {
        return $this->repository->find($id);
    }

    public function createApplication(array $data)
    {
        $data['applied_date'] = now();
        $data['status'] = 'applied';
        $data['last_updated'] = now();

        $application = $this->repository->create($data);
        
        // Increment job position application count
        $position = $this->positionRepository->find($data['job_position_id']);
        $position->incrementApplicationCount();

        return $application;
    }

    public function updateApplication(int $id, array $data)
    {
        $application = $this->repository->find($id);
        $data['last_updated'] = now();
        return $this->repository->update($application, $data);
    }

    public function deleteApplication(int $id): bool
    {
        $application = $this->repository->find($id);
        
        // Decrement job position application count
        if ($application->jobPosition) {
            $application->jobPosition->decrementApplicationCount();
        }

        return $this->repository->delete($application);
    }

    public function moveToScreening(int $id, ?string $notes = null)
    {
        return $this->updateApplicationStatus($id, 'screening', $notes);
    }

    public function scheduleInterview(int $id, ?string $notes = null)
    {
        return $this->updateApplicationStatus($id, 'interview', $notes);
    }

    public function makeOffer(int $id, ?string $notes = null)
    {
        return $this->updateApplicationStatus($id, 'offer', $notes);
    }

    public function hireCandidate(int $id, ?string $notes = null)
    {
        return $this->updateApplicationStatus($id, 'hired', $notes);
    }

    public function rejectApplication(int $id, ?string $notes = null)
    {
        return $this->updateApplicationStatus($id, 'rejected', $notes);
    }

    public function withdrawApplication(int $id, ?string $notes = null)
    {
        return $this->updateApplicationStatus($id, 'withdrawn', $notes);
    }

    public function rateApplication(int $id, float $rating, ?string $notes = null)
    {
        return $this->updateApplication($id, [
            'rating' => min(5, max(1, $rating)),
            'notes' => $notes,
        ]);
    }

    public function getApplicationsByStatus(string $status): Collection
    {
        return $this->repository->getByStatus($status);
    }

    public function getApplicationsByPosition(int $jobPositionId): Collection
    {
        return $this->repository->getByJobPosition($jobPositionId);
    }

    public function getApplicationStats(): array
    {
        return $this->repository->getApplicationStats();
    }

    public function getTopRatedApplications(int $limit = 10): Collection
    {
        return $this->repository->getTopRatedApplications($limit);
    }

    public function getHiredCandidates(): Collection
    {
        return $this->repository->getHiredCandidates();
    }

    private function updateApplicationStatus(int $id, string $status, ?string $notes = null)
    {
        $data = ['status' => $status];
        if ($notes) {
            $data['notes'] = $notes;
        }
        return $this->updateApplication($id, $data);
    }
}
