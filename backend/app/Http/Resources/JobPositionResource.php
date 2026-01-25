<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPositionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'department_id' => $this->department_id,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'title' => $this->title,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'headcount' => $this->headcount,
            'employment_type' => $this->employment_type,
            'status' => $this->status,
            'salary_from' => $this->salary_from,
            'salary_to' => $this->salary_to,
            'posted_date' => $this->posted_date,
            'closed_date' => $this->closed_date,
            'applications_count' => $this->applications_count,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
