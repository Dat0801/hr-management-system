<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollResource extends JsonResource
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
            'month' => $this->month,
            'year' => $this->year,
            'base_salary' => (float) $this->base_salary,
            'overtime_amount' => (float) $this->overtime_amount,
            'bonus_amount' => (float) $this->bonus_amount,
            'allowances' => (float) $this->allowances,
            'deductions' => (float) $this->deductions,
            'tax_amount' => (float) $this->tax_amount,
            'insurance_amount' => (float) $this->insurance_amount,
            'gross_salary' => (float) $this->gross_salary,
            'net_salary' => (float) $this->net_salary,
            'status' => $this->status,
            'paid_date' => $this->paid_date?->format('Y-m-d H:i:s'),
            'notes' => $this->notes,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
