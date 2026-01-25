<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePerformanceReviewRequest extends FormRequest
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
            'performance_summary' => 'nullable|string|max:2000',
            'strengths' => 'nullable|string|max:2000',
            'areas_for_improvement' => 'nullable|string|max:2000',
            'overall_rating' => 'nullable|numeric|min:1|max:5',
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
            'overall_rating.numeric' => 'Overall rating must be a number between 1 and 5',
        ];
    }
}
