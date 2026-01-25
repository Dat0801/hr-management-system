<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InterviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_application_id' => $this->job_application_id,
            'interviewer_id' => $this->interviewer_id,
            'interviewer' => new UserResource($this->whenLoaded('interviewer')),
            'scheduled_date' => $this->scheduled_date,
            'duration_minutes' => $this->duration_minutes,
            'interview_type' => $this->interview_type,
            'notes' => $this->notes,
            'status' => $this->status,
            'rating' => $this->rating,
            'feedback' => $this->feedback,
            'completed_at' => $this->completed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
