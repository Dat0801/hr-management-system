<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGoalRequest extends FormRequest
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
            'title' => 'sometimes|required|string|max:200',
            'description' => 'sometimes|required|string|max:1000',
            'category' => 'nullable|in:business,professional,personal,technical',
            'success_criteria' => 'nullable|string|max:1000',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:not_started,in_progress,completed,cancelled',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
            'progress_notes' => 'nullable|string|max:500',
            'weight' => 'nullable|numeric|min:0.1|max:5',
            'alignment_with_company' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'progress_percentage.min' => 'Progress must be at least 0%',
            'progress_percentage.max' => 'Progress cannot exceed 100%',
        ];
    }
}
