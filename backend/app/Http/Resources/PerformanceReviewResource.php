<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PerformanceReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'employee' => [
                'id' => $this->employee?->id,
                'user' => [
                    'id' => $this->employee?->user?->id,
                    'name' => $this->employee?->user?->name,
                    'email' => $this->employee?->user?->email,
                ],
                'position' => $this->employee?->position,
                'department' => [
                    'id' => $this->employee?->department?->id,
                    'name' => $this->employee?->department?->name,
                ],
            ],
            'reviewer_id' => $this->reviewer_id,
            'reviewer' => [
                'id' => $this->reviewer?->id,
                'name' => $this->reviewer?->name,
            ],
            'rating_year' => $this->rating_year,
            'period' => $this->period,
            'performance_summary' => $this->performance_summary,
            'strengths' => $this->strengths,
            'areas_for_improvement' => $this->areas_for_improvement,
            'overall_rating' => (float) $this->overall_rating,
            'rating_leadership' => $this->rating_leadership ? (float) $this->rating_leadership : null,
            'rating_teamwork' => $this->rating_teamwork ? (float) $this->rating_teamwork : null,
            'rating_communication' => $this->rating_communication ? (float) $this->rating_communication : null,
            'rating_technical_skills' => $this->rating_technical_skills ? (float) $this->rating_technical_skills : null,
            'rating_attendance' => $this->rating_attendance ? (float) $this->rating_attendance : null,
            'status' => $this->status,
            'review_date' => $this->review_date?->format('Y-m-d H:i:s'),
            'feedback_from_manager' => $this->feedback_from_manager,
            'feedback' => FeedbackResource::collection($this->whenLoaded('feedback')),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
