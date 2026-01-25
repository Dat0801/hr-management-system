<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePerformanceReviewRequest extends FormRequest
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
            'reviewer_id' => 'required|exists:users,id',
            'rating_year' => 'required|integer|min:2000|max:2099',
            'period' => 'required|in:q1,q2,q3,q4,annual',
            'performance_summary' => 'nullable|string|max:2000',
            'strengths' => 'nullable|string|max:2000',
            'areas_for_improvement' => 'nullable|string|max:2000',
            'overall_rating' => 'required|numeric|min:1|max:5',
            'rating_leadership' => 'nullable|numeric|min:1|max:5',
            'rating_teamwork' => 'nullable|numeric|min:1|max:5',
            'rating_communication' => 'nullable|numeric|min:1|max:5',
            'rating_technical_skills' => 'nullable|numeric|min:1|max:5',
            'rating_attendance' => 'nullable|numeric|min:1|max:5',
            'feedback_from_manager' => 'nullable|string|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.required' => 'Employee is required',
            'employee_id.exists' => 'Selected employee does not exist',
            'reviewer_id.required' => 'Reviewer is required',
            'overall_rating.required' => 'Overall rating is required',
            'overall_rating.numeric' => 'Rating must be a number between 1 and 5',
            'overall_rating.min' => 'Rating must be at least 1',
            'overall_rating.max' => 'Rating cannot exceed 5',
        ];
    }
}
