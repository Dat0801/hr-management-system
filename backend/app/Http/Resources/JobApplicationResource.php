<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_position_id' => $this->job_position_id,
            'job_position' => new JobPositionResource($this->whenLoaded('jobPosition')),
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'cover_letter' => $this->cover_letter,
            'resume_path' => $this->resume_path,
            'status' => $this->status,
            'rating' => $this->rating,
            'applied_date' => $this->applied_date,
            'last_updated' => $this->last_updated,
            'notes' => $this->notes,
            'interviews' => InterviewResource::collection($this->whenLoaded('interviews')),
            'job_offer' => new JobOfferResource($this->whenLoaded('jobOffer')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
