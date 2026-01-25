<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\StoreInterviewRequest;
use App\Http\Resources\InterviewResource;
use App\Models\Interview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function store(StoreInterviewRequest $request): JsonResponse
    {
        $interview = Interview::create($request->validated());
        return response()->json(
            ['data' => new InterviewResource($interview->load('jobApplication', 'interviewer'))],
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $interview = Interview::findOrFail($id);
        return response()->json(['data' => new InterviewResource($interview)]);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'scheduled_date' => 'sometimes|date_format:Y-m-d H:i:s',
            'duration_minutes' => 'sometimes|integer|min:15',
            'interview_type' => 'sometimes|in:phone,video,in_person',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:scheduled,completed,cancelled,rescheduled',
        ]);

        $interview = Interview::findOrFail($id);
        $interview->update($request->validated());

        return response()->json(['data' => new InterviewResource($interview->load('jobApplication', 'interviewer'))]);
    }

    public function complete(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'rating' => 'nullable|numeric|min:1|max:5',
            'feedback' => 'nullable|string',
        ]);

        $interview = Interview::findOrFail($id);
        $interview->update([
            'status' => 'completed',
            'rating' => $request->input('rating'),
            'feedback' => $request->input('feedback'),
            'completed_at' => now(),
        ]);

        return response()->json(['data' => new InterviewResource($interview->load('jobApplication', 'interviewer'))]);
    }

    public function cancel(int $id, Request $request): JsonResponse
    {
        $interview = Interview::findOrFail($id);
        $interview->update([
            'status' => 'cancelled',
            'notes' => $request->input('notes'),
        ]);

        return response()->json(['data' => new InterviewResource($interview)]);
    }

    public function destroy(int $id): JsonResponse
    {
        $interview = Interview::findOrFail($id);
        $interview->delete();

        return response()->json(['message' => 'Interview deleted successfully']);
    }

    public function byApplication(int $applicationId): JsonResponse
    {
        $interviews = Interview::where('job_application_id', $applicationId)
            ->with('jobApplication', 'interviewer')
            ->get();

        return response()->json(['data' => InterviewResource::collection($interviews)]);
    }

    public function scheduled(): JsonResponse
    {
        $interviews = Interview::where('status', 'scheduled')
            ->with('jobApplication', 'interviewer')
            ->get();

        return response()->json(['data' => InterviewResource::collection($interviews)]);
    }
}
