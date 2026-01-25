<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGoalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'created_by' => 'required|exists:users,id',
            'title' => 'required|string|max:200',
            'description' => 'required|string|max:1000',
            'category' => 'required|in:business,professional,personal,technical',
            'success_criteria' => 'nullable|string|max:1000',
            'start_date' => 'required|date',
            'due_date' => 'required|date|after:start_date',
            'weight' => 'nullable|numeric|min:0.1|max:5',
            'alignment_with_company' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.required' => 'Employee is required',
            'title.required' => 'Goal title is required',
            'description.required' => 'Goal description is required',
            'due_date.after' => 'Due date must be after start date',
        ];
    }
}
