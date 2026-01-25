<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\StoreJobApplicationRequest;
use App\Http\Requests\UpdateJobApplicationRequest;
use App\Http\Resources\JobApplicationResource;
use App\Services\JobApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobApplicationController extends Controller
{
    private JobApplicationService $service;

    public function __construct(JobApplicationService $service)
    {
        $this->service = $service;
    }

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\JobApplication::class);
        
        $applications = $this->service->getAllApplications();
        return response()->json(['data' => JobApplicationResource::collection($applications)]);
    }

    public function store(StoreJobApplicationRequest $request): JsonResponse
    {
        $application = $this->service->createApplication($request->validated());
        return response()->json(
            ['data' => new JobApplicationResource($application->load('jobPosition'))],
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $application = $this->service->getApplication($id);
        return response()->json(['data' => new JobApplicationResource($application)]);
    }

    public function update(UpdateJobApplicationRequest $request, int $id): JsonResponse
    {
        $application = $this->service->updateApplication($id, $request->validated());
        return response()->json(['data' => new JobApplicationResource($application->load('jobPosition', 'interviews', 'jobOffer'))]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->authorize('delete', \App\Models\JobApplication::class);
        
        $this->service->deleteApplication($id);
        return response()->json(['message' => 'Application deleted successfully']);
    }

    public function moveToScreening(int $id, Request $request): JsonResponse
    {
        $this->authorize('update', \App\Models\JobApplication::class);
        
        $application = $this->service->moveToScreening($id, $request->input('notes'));
        return response()->json(['data' => new JobApplicationResource($application)]);
    }

    public function scheduleInterview(int $id, Request $request): JsonResponse
    {
        $this->authorize('update', \App\Models\JobApplication::class);
        
        $application = $this->service->scheduleInterview($id, $request->input('notes'));
        return response()->json(['data' => new JobApplicationResource($application)]);
    }

    public function makeOffer(int $id, Request $request): JsonResponse
    {
        $this->authorize('update', \App\Models\JobApplication::class);
        
        $application = $this->service->makeOffer($id, $request->input('notes'));
        return response()->json(['data' => new JobApplicationResource($application)]);
    }

    public function hire(int $id, Request $request): JsonResponse
    {
        $this->authorize('update', \App\Models\JobApplication::class);
        
        $application = $this->service->hireCandidate($id, $request->input('notes'));
        return response()->json(['data' => new JobApplicationResource($application)]);
    }

    public function reject(int $id, Request $request): JsonResponse
    {
        $this->authorize('update', \App\Models\JobApplication::class);
        
        $application = $this->service->rejectApplication($id, $request->input('notes'));
        return response()->json(['data' => new JobApplicationResource($application)]);
    }

    public function withdraw(int $id, Request $request): JsonResponse
    {
        $this->authorize('update', \App\Models\JobApplication::class);
        
        $application = $this->service->withdrawApplication($id, $request->input('notes'));
        return response()->json(['data' => new JobApplicationResource($application)]);
    }

    public function rate(int $id, Request $request): JsonResponse
    {
        $this->authorize('update', \App\Models\JobApplication::class);
        
        $request->validate(['rating' => 'required|numeric|min:1|max:5']);
        
        $application = $this->service->rateApplication($id, $request->input('rating'), $request->input('notes'));
        return response()->json(['data' => new JobApplicationResource($application)]);
    }

    public function byStatus(string $status): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\JobApplication::class);
        
        $applications = $this->service->getApplicationsByStatus($status);
        return response()->json(['data' => JobApplicationResource::collection($applications)]);
    }

    public function stats(): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\JobApplication::class);
        
        $stats = $this->service->getApplicationStats();
        return response()->json(['data' => $stats]);
    }

    public function topRated(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\JobApplication::class);
        
        $limit = $request->query('limit', 10);
        $applications = $this->service->getTopRatedApplications($limit);
        return response()->json(['data' => JobApplicationResource::collection($applications)]);
    }

    public function hired(): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\JobApplication::class);
        
        $applications = $this->service->getHiredCandidates();
        return response()->json(['data' => JobApplicationResource::collection($applications)]);
    }
}
