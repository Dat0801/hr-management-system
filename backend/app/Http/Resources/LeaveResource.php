<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LeaveResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'type' => $this->type,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'reason' => $this->reason,
            'status' => $this->status,
            'approved_by' => $this->approved_by,
            'approval_date' => $this->approval_date,
            'created_at' => $this->created_at,
        ];
    }
}
