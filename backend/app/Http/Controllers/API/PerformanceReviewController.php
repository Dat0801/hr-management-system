<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePerformanceReviewRequest;
use App\Http\Requests\UpdatePerformanceReviewRequest;
use App\Http\Resources\PerformanceReviewResource;
use App\Services\PerformanceReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PerformanceReviewController extends Controller
{
    public function __construct(private PerformanceReviewService $reviewService)
    {
        $this->middleware('auth:sanctum');
        $this->middleware('can:manage performance reviews')->except(['index', 'show', 'getMyReviews', 'getByYear', 'getAverageRating']);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->query();
        $perPage = $request->query('per_page', 15);

        $reviews = $this->reviewService->getAllReviews($filters, $perPage);

        return response()->json([
            'data' => PerformanceReviewResource::collection($reviews)->resolve(),
            'meta' => [
                'total' => $reviews->total(),
                'per_page' => $reviews->perPage(),
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
            ],
            'links' => [
                'first' => $reviews->url(1),
                'last' => $reviews->url($reviews->lastPage()),
                'prev' => $reviews->previousPageUrl(),
                'next' => $reviews->nextPageUrl(),
            ],
        ]);
    }

    public function store(StorePerformanceReviewRequest $request): JsonResponse
    {
        $review = $this->reviewService->createReview($request->validated());

        return response()->json(new PerformanceReviewResource($review), 201);
    }

    public function show(string $id): JsonResponse
    {
        $review = $this->reviewService->getReviewById((int) $id);

        if (! $review) {
            return response()->json(['message' => 'Performance review not found'], 404);
        }

        return response()->json(new PerformanceReviewResource($review));
    }

    public function update(UpdatePerformanceReviewRequest $request, string $id): JsonResponse
    {
        $reviewId = (int) $id;
        $review = $this->reviewService->getReviewById($reviewId);

        if (! $review) {
            return response()->json(['message' => 'Performance review not found'], 404);
        }

        if ($review->status !== 'draft') {
            return response()->json(['message' => 'Can only update draft reviews'], 422);
        }

        $review = $this->reviewService->updateReview($reviewId, $request->validated());

        return response()->json(new PerformanceReviewResource($review));
    }

    public function destroy(string $id): JsonResponse
    {
        $reviewId = (int) $id;
        $review = $this->reviewService->getReviewById($reviewId);

        if (! $review) {
            return response()->json(['message' => 'Performance review not found'], 404);
        }

        if ($review->status !== 'draft') {
            return response()->json(['message' => 'Can only delete draft reviews'], 422);
        }

        $this->reviewService->deleteReview($reviewId);

        return response()->json(['message' => 'Performance review deleted']);
    }

    public function submit(string $id): JsonResponse
    {
        $reviewId = (int) $id;
        $review = $this->reviewService->getReviewById($reviewId);

        if (! $review) {
            return response()->json(['message' => 'Performance review not found'], 404);
        }

        if ($review->status !== 'draft') {
            return response()->json(['message' => 'Only draft reviews can be submitted'], 422);
        }

        $review = $this->reviewService->submitReview($reviewId);

        return response()->json(new PerformanceReviewResource($review));
    }

    public function approve(string $id): JsonResponse
    {
        $reviewId = (int) $id;
        $review = $this->reviewService->getReviewById($reviewId);

        if (! $review) {
            return response()->json(['message' => 'Performance review not found'], 404);
        }

        if ($review->status !== 'submitted') {
            return response()->json(['message' => 'Only submitted reviews can be approved'], 422);
        }

        $review = $this->reviewService->approveReview($reviewId);

        return response()->json(new PerformanceReviewResource($review));
    }

    public function getMyReviews(): JsonResponse
    {
        $user = auth('sanctum')->user();
        $employee = $user->employee;

        if (! $employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $reviews = $this->reviewService->getEmployeeReviewHistory($employee->id);

        return response()->json([
            'data' => PerformanceReviewResource::collection($reviews)->resolve(),
        ]);
    }

    public function getByYear(string $year): JsonResponse
    {
        $yearInt = (int) $year;
        $perPage = request()->query('per_page', 15);
        $reviews = $this->reviewService->getReviewsByYear($yearInt, $perPage);

        return response()->json([
            'data' => PerformanceReviewResource::collection($reviews)->resolve(),
            'meta' => [
                'total' => $reviews->total(),
                'per_page' => $reviews->perPage(),
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
            ],
            'links' => [
                'first' => $reviews->url(1),
                'last' => $reviews->url($reviews->lastPage()),
                'prev' => $reviews->previousPageUrl(),
                'next' => $reviews->nextPageUrl(),
            ],
        ]);
    }

    public function getAverageRating(string $employeeId): JsonResponse
    {
        $id = (int) $employeeId;
        $average = $this->reviewService->getAverageRatingByEmployee($id);

        return response()->json([
            'employee_id' => $id,
            'average_rating' => $average,
        ]);
    }
}
