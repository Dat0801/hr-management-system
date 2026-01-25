<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use App\Services\GoalService;
use App\Http\Requests\StoreGoalRequest;
use App\Http\Requests\UpdateGoalRequest;
use App\Http\Resources\GoalResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function __construct(private GoalService $goalService)
    {
        $this->middleware('auth:sanctum');
        $this->middleware('can:manage goals')->except(['index', 'show', 'getMyGoals']);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->query();
        $perPage = $request->query('per_page', 15);

        $goals = $this->goalService->getAllGoals($filters, $perPage);

        return response()->json([
            'data' => GoalResource::collection($goals)->resolve(),
            'meta' => [
                'total' => $goals->total(),
                'per_page' => $goals->perPage(),
                'current_page' => $goals->currentPage(),
                'last_page' => $goals->lastPage(),
            ],
            'links' => [
                'first' => $goals->url(1),
                'last' => $goals->url($goals->lastPage()),
                'prev' => $goals->previousPageUrl(),
                'next' => $goals->nextPageUrl(),
            ],
        ]);
    }

    public function store(StoreGoalRequest $request): JsonResponse
    {
        $goal = $this->goalService->createGoal($request->validated());

        return response()->json(new GoalResource($goal), 201);
    }

    public function show(int $id): JsonResponse
    {
        $goal = $this->goalService->getGoalById($id);

        if (!$goal) {
            return response()->json(['message' => 'Goal not found'], 404);
        }

        return response()->json(new GoalResource($goal));
    }

    public function update(UpdateGoalRequest $request, int $id): JsonResponse
    {
        $goal = $this->goalService->getGoalById($id);

        if (!$goal) {
            return response()->json(['message' => 'Goal not found'], 404);
        }

        if ($goal->status === 'completed' || $goal->status === 'cancelled') {
            return response()->json(['message' => 'Cannot update completed or cancelled goals'], 422);
        }

        $goal = $this->goalService->updateGoal($id, $request->validated());

        return response()->json(new GoalResource($goal));
    }

    public function destroy(int $id): JsonResponse
    {
        $goal = $this->goalService->getGoalById($id);

        if (!$goal) {
            return response()->json(['message' => 'Goal not found'], 404);
        }

        if ($goal->status === 'completed' || $goal->status === 'cancelled') {
            return response()->json(['message' => 'Cannot delete completed or cancelled goals'], 422);
        }

        $this->goalService->deleteGoal($id);

        return response()->json(['message' => 'Goal deleted']);
    }

    public function updateProgress(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'progress_percentage' => 'required|integer|min:0|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $goal = $this->goalService->getGoalById($id);

        if (!$goal) {
            return response()->json(['message' => 'Goal not found'], 404);
        }

        $goal = $this->goalService->updateProgress($id, $request->input('progress_percentage'), $request->input('notes'));

        return response()->json(new GoalResource($goal));
    }

    public function getMyGoals(): JsonResponse
    {
        $user = auth('sanctum')->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $goals = $this->goalService->getEmployeeActiveGoals($employee->id);

        return response()->json([
            'data' => GoalResource::collection($goals)->resolve(),
        ]);
    }

    public function getByStatus(string $status): JsonResponse
    {
        $validStatuses = ['not_started', 'in_progress', 'completed', 'cancelled'];

        if (!in_array($status, $validStatuses)) {
            return response()->json(['message' => 'Invalid status'], 422);
        }

        $perPage = request()->query('per_page', 15);
        $goals = $this->goalService->getGoalsByStatus($status, $perPage);

        return response()->json([
            'data' => GoalResource::collection($goals)->resolve(),
            'meta' => [
                'total' => $goals->total(),
                'per_page' => $goals->perPage(),
                'current_page' => $goals->currentPage(),
                'last_page' => $goals->lastPage(),
            ],
            'links' => [
                'first' => $goals->url(1),
                'last' => $goals->url($goals->lastPage()),
                'prev' => $goals->previousPageUrl(),
                'next' => $goals->nextPageUrl(),
            ],
        ]);
    }

    public function getOverdueGoals(): JsonResponse
    {
        $goals = $this->goalService->getOverdueGoals();

        return response()->json([
            'data' => GoalResource::collection($goals)->resolve(),
        ]);
    }

    public function completeGoal(int $id): JsonResponse
    {
        $goal = $this->goalService->getGoalById($id);

        if (!$goal) {
            return response()->json(['message' => 'Goal not found'], 404);
        }

        if ($goal->status === 'completed') {
            return response()->json(['message' => 'Goal is already completed'], 422);
        }

        $goal = $this->goalService->completeGoal($id);

        return response()->json(new GoalResource($goal));
    }

    public function cancelGoal(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $goal = $this->goalService->getGoalById($id);

        if (!$goal) {
            return response()->json(['message' => 'Goal not found'], 404);
        }

        if ($goal->status === 'cancelled') {
            return response()->json(['message' => 'Goal is already cancelled'], 422);
        }

        $goal = $this->goalService->cancelGoal($id, $request->input('reason'));

        return response()->json(new GoalResource($goal));
    }

    public function getEmployeeCompletion(int $employeeId): JsonResponse
    {
        $completion = $this->goalService->getEmployeeGoalCompletion($employeeId);

        return response()->json([
            'employee_id' => $employeeId,
            'completion' => $completion,
        ]);
    }
}
