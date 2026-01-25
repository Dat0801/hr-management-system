<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobPositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create job positions');
    }

    public function rules(): array
    {
        return [
            'department_id' => 'required|exists:departments,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'headcount' => 'required|integer|min:1',
            'employment_type' => 'required|in:full_time,part_time,contract,intern',
            'status' => 'required|in:open,closed,on_hold',
            'salary_from' => 'nullable|numeric|min:0',
            'salary_to' => 'nullable|numeric|min:0|gte:salary_from',
        ];
    }

    public function messages(): array
    {
        return [
            'department_id.required' => 'Department is required',
            'title.required' => 'Position title is required',
            'headcount.required' => 'Headcount is required',
            'employment_type.required' => 'Employment type is required',
            'status.required' => 'Status is required',
            'salary_to.gte' => 'Maximum salary must be greater than or equal to minimum salary',
        ];
    }
}
