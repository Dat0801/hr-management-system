<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobPositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update job positions');
    }

    public function rules(): array
    {
        return [
            'department_id' => 'sometimes|exists:departments,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'headcount' => 'sometimes|integer|min:1',
            'employment_type' => 'sometimes|in:full_time,part_time,contract,intern',
            'status' => 'sometimes|in:open,closed,on_hold',
            'salary_from' => 'nullable|numeric|min:0',
            'salary_to' => 'nullable|numeric|min:0|gte:salary_from',
        ];
    }
}
