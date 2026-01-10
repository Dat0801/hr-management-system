<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user' => $this->whenLoaded('user', fn() => new UserResource($this->user)),
            'department' => $this->whenLoaded('department', fn() => new DepartmentResource($this->department)),
            'position' => $this->position,
            'salary' => $this->salary,
            'hire_date' => $this->hire_date,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,
            'postal_code' => $this->postal_code,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
