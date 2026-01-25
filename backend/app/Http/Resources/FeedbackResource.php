<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackResource extends JsonResource
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
            'performance_review_id' => $this->performance_review_id,
            'from_user' => [
                'id' => $this->fromUser?->id,
                'name' => $this->fromUser?->name,
                'email' => $this->fromUser?->email,
            ],
            'feedback_type' => $this->feedback_type,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'status' => $this->status,
            'acknowledged_at' => $this->acknowledged_at?->format('Y-m-d H:i:s'),
            'is_anonymous' => $this->is_anonymous,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
