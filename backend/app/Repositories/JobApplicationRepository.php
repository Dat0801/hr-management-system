<?php

namespace App\Repositories;

use App\Models\JobApplication;
use Illuminate\Database\Eloquent\Collection;

class JobApplicationRepository
{
    public function all(): Collection
    {
        return JobApplication::with('jobPosition', 'interviews', 'jobOffer')->get();
    }

    public function find(int $id): JobApplication
    {
        return JobApplication::with('jobPosition', 'interviews', 'jobOffer')->findOrFail($id);
    }

    public function create(array $data): JobApplication
    {
        return JobApplication::create($data);
    }

    public function update(JobApplication $application, array $data): JobApplication
    {
        $application->update($data);
        return $application->refresh();
    }

    public function delete(JobApplication $application): bool
    {
        return $application->delete();
    }

    public function getByStatus(string $status): Collection
    {
        return JobApplication::where('status', $status)
            ->with('jobPosition', 'interviews', 'jobOffer')
            ->get();
    }

    public function getByJobPosition(int $jobPositionId): Collection
    {
        return JobApplication::where('job_position_id', $jobPositionId)
            ->with('jobPosition', 'interviews', 'jobOffer')
            ->get();
    }

    public function getByEmail(string $email): ?JobApplication
    {
        return JobApplication::where('email', $email)->first();
    }

    public function getInterviewedCandidates(): Collection
    {
        return JobApplication::where('status', 'interview')
            ->orWhere('status', 'offer')
            ->with('jobPosition', 'interviews')
            ->get();
    }

    public function getHiredCandidates(): Collection
    {
        return JobApplication::where('status', 'hired')
            ->with('jobPosition')
            ->get();
    }

    public function getRejectedCandidates(): Collection
    {
        return JobApplication::where('status', 'rejected')
            ->with('jobPosition')
            ->get();
    }

    public function getTopRatedApplications(int $limit = 10): Collection
    {
        return JobApplication::orderByDesc('rating')
            ->limit($limit)
            ->with('jobPosition')
            ->get();
    }

    public function getApplicationsByDateRange($startDate, $endDate): Collection
    {
        return JobApplication::whereBetween('applied_date', [$startDate, $endDate])
            ->with('jobPosition', 'interviews')
            ->get();
    }

    public function countByStatus(string $status): int
    {
        return JobApplication::where('status', $status)->count();
    }

    public function getApplicationStats(): array
    {
        return [
            'total' => JobApplication::count(),
            'applied' => $this->countByStatus('applied'),
            'screening' => $this->countByStatus('screening'),
            'interview' => $this->countByStatus('interview'),
            'offer' => $this->countByStatus('offer'),
            'hired' => $this->countByStatus('hired'),
            'rejected' => $this->countByStatus('rejected'),
            'withdrawn' => $this->countByStatus('withdrawn'),
        ];
    }
}
