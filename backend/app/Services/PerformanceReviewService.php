<?php

namespace App\Services;

use App\Models\PerformanceReview;
use App\Repositories\PerformanceReviewRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class PerformanceReviewService
{
    public function __construct(private PerformanceReviewRepository $repository) {}

    public function getAllReviews(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->all($filters, $perPage);
    }

    public function getReviewById(int $id): ?PerformanceReview
    {
        return $this->repository->find($id);
    }

    public function createReview(array $data): PerformanceReview
    {
        // Calculate average rating
        $ratings = [
            $data['rating_leadership'] ?? 0,
            $data['rating_teamwork'] ?? 0,
            $data['rating_communication'] ?? 0,
            $data['rating_technical_skills'] ?? 0,
            $data['rating_attendance'] ?? 0,
        ];

        $validRatings = array_filter($ratings, fn ($r) => $r > 0);
        $data['overall_rating'] = ! empty($validRatings) ? array_sum($validRatings) / count($validRatings) : $data['overall_rating'];

        return $this->repository->create($data);
    }

    public function updateReview(int $id, array $data): PerformanceReview
    {
        // Recalculate average rating if any rating field is updated
        if (isset($data['rating_leadership']) || isset($data['rating_teamwork']) ||
            isset($data['rating_communication']) || isset($data['rating_technical_skills']) ||
            isset($data['rating_attendance'])) {

            $review = $this->repository->find($id);
            $ratings = [
                $data['rating_leadership'] ?? $review->rating_leadership,
                $data['rating_teamwork'] ?? $review->rating_teamwork,
                $data['rating_communication'] ?? $review->rating_communication,
                $data['rating_technical_skills'] ?? $review->rating_technical_skills,
                $data['rating_attendance'] ?? $review->rating_attendance,
            ];

            $validRatings = array_filter($ratings, fn ($r) => $r > 0);
            $data['overall_rating'] = ! empty($validRatings) ? array_sum($validRatings) / count($validRatings) : ($data['overall_rating'] ?? $review->overall_rating);
        }

        return $this->repository->update($id, $data);
    }

    public function deleteReview(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function submitReview(int $id): PerformanceReview
    {
        return $this->repository->update($id, ['status' => 'submitted']);
    }

    public function approveReview(int $id): PerformanceReview
    {
        return $this->repository->update($id, ['status' => 'approved', 'review_date' => now()]);
    }

    public function getEmployeeReviewHistory(int $employeeId, int $limit = 10): array
    {
        return $this->repository->getEmployeeReviews($employeeId, $limit);
    }

    public function getReviewsByYear(int $year, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getReviewsByYear($year, $perPage);
    }

    public function getAverageRatingByEmployee(int $employeeId): ?float
    {
        $reviews = $this->repository->getEmployeeReviews($employeeId, 100);
        if (empty($reviews)) {
            return null;
        }

        $sum = array_sum(array_column($reviews, 'overall_rating'));

        return $sum / count($reviews);
    }
}
