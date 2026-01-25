<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\StoreJobOfferRequest;
use App\Http\Resources\JobOfferResource;
use App\Models\JobOffer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobOfferController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function store(StoreJobOfferRequest $request): JsonResponse
    {
        $jobOffer = JobOffer::create($request->validated());
        return response()->json(
            ['data' => new JobOfferResource($jobOffer->load('jobApplication', 'approvedBy'))],
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $jobOffer = JobOffer::findOrFail($id);
        return response()->json(['data' => new JobOfferResource($jobOffer)]);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'offered_salary' => 'sometimes|numeric|min:0',
            'offered_date' => 'sometimes|date_format:Y-m-d H:i:s',
            'expiry_date' => 'sometimes|date_format:Y-m-d H:i:s',
            'terms_and_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $jobOffer = JobOffer::findOrFail($id);
        $jobOffer->update($request->validated());

        return response()->json(['data' => new JobOfferResource($jobOffer->load('jobApplication', 'approvedBy'))]);
    }

    public function accept(int $id, Request $request): JsonResponse
    {
        $jobOffer = JobOffer::findOrFail($id);
        $jobOffer->update([
            'status' => 'accepted',
            'response_date' => now(),
            'notes' => $request->input('notes'),
        ]);

        return response()->json(['data' => new JobOfferResource($jobOffer)]);
    }

    public function reject(int $id, Request $request): JsonResponse
    {
        $jobOffer = JobOffer::findOrFail($id);
        $jobOffer->update([
            'status' => 'rejected',
            'response_date' => now(),
            'notes' => $request->input('notes'),
        ]);

        return response()->json(['data' => new JobOfferResource($jobOffer)]);
    }

    public function destroy(int $id): JsonResponse
    {
        $jobOffer = JobOffer::findOrFail($id);
        $jobOffer->delete();

        return response()->json(['message' => 'Offer deleted successfully']);
    }

    public function byApplication(int $applicationId): JsonResponse
    {
        $jobOffer = JobOffer::where('job_application_id', $applicationId)
            ->with('jobApplication', 'approvedBy')
            ->first();

        if (!$jobOffer) {
            return response()->json(['message' => 'Offer not found'], 404);
        }

        return response()->json(['data' => new JobOfferResource($jobOffer)]);
    }

    public function pending(): JsonResponse
    {
        $offers = JobOffer::where('status', 'sent')
            ->with('jobApplication', 'approvedBy')
            ->get();

        return response()->json(['data' => JobOfferResource::collection($offers)]);
    }

    public function accepted(): JsonResponse
    {
        $offers = JobOffer::where('status', 'accepted')
            ->with('jobApplication', 'approvedBy')
            ->get();

        return response()->json(['data' => JobOfferResource::collection($offers)]);
    }
}
