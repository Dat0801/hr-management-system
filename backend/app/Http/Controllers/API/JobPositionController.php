<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\StoreJobPositionRequest;
use App\Http\Requests\UpdateJobPositionRequest;
use App\Http\Resources\JobPositionResource;
use App\Services\JobPositionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobPositionController extends Controller
{
    private JobPositionService $service;

    public function __construct(JobPositionService $service)
    {
        $this->service = $service;
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request): JsonResponse
    {
        $positions = $this->service->getAllPositions();
        return response()->json(['data' => JobPositionResource::collection($positions)]);
    }

    public function store(StoreJobPositionRequest $request): JsonResponse
    {
        $position = $this->service->createPosition($request->validated());
        return response()->json(
            ['data' => new JobPositionResource($position->load('department'))],
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $position = $this->service->getPosition($id);
        return response()->json(['data' => new JobPositionResource($position)]);
    }

    public function update(UpdateJobPositionRequest $request, int $id): JsonResponse
    {
        $position = $this->service->updatePosition($id, $request->validated());
        return response()->json(['data' => new JobPositionResource($position->load('department'))]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->deletePosition($id);
        return response()->json(['message' => 'Position deleted successfully']);
    }

    public function open(): JsonResponse
    {
        $positions = $this->service->getOpenPositions();
        return response()->json(['data' => JobPositionResource::collection($positions)]);
    }

    public function close(int $id): JsonResponse
    {
        $position = $this->service->closePosition($id);
        return response()->json(['data' => new JobPositionResource($position)]);
    }

    public function hold(int $id): JsonResponse
    {
        $position = $this->service->holdPosition($id);
        return response()->json(['data' => new JobPositionResource($position)]);
    }

    public function reopen(int $id): JsonResponse
    {
        $position = $this->service->reopenPosition($id);
        return response()->json(['data' => new JobPositionResource($position)]);
    }

    public function byDepartment(int $departmentId): JsonResponse
    {
        $positions = $this->service->getPositionsByDepartment($departmentId);
        return response()->json(['data' => JobPositionResource::collection($positions)]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->query('q', '');
        if (!$query) {
            return response()->json(['message' => 'Search query is required'], 400);
        }
        
        $positions = $this->service->searchPositions($query);
        return response()->json(['data' => JobPositionResource::collection($positions)]);
    }

    public function applications(int $id): JsonResponse
    {
        $applications = $this->service->getPositionApplications($id);
        return response()->json(['data' => $applications]);
    }
}
