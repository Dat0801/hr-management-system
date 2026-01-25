<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobOfferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_application_id' => $this->job_application_id,
            'approved_by' => $this->approved_by,
            'approver' => new UserResource($this->whenLoaded('approvedBy')),
            'offered_salary' => $this->offered_salary,
            'offered_date' => $this->offered_date,
            'expiry_date' => $this->expiry_date,
            'status' => $this->status,
            'response_date' => $this->response_date,
            'terms_and_conditions' => $this->terms_and_conditions,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
