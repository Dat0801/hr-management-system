<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoalResource extends JsonResource
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
            'created_by_user' => [
                'id' => $this->createdBy?->id,
                'name' => $this->createdBy?->name,
            ],
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'success_criteria' => $this->success_criteria,
            'start_date' => $this->start_date->format('Y-m-d H:i:s'),
            'due_date' => $this->due_date->format('Y-m-d H:i:s'),
            'status' => $this->status,
            'progress_percentage' => $this->progress_percentage,
            'progress_notes' => $this->progress_notes,
            'weight' => (float) $this->weight,
            'alignment_with_company' => $this->alignment_with_company,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
