<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'manager' => $this->whenLoaded('manager', fn() => new UserResource($this->manager)),
            'employees_count' => $this->whenCounted('employees'),
            'created_at' => $this->created_at,
        ];
    }
}
