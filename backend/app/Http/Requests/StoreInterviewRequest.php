<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInterviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create interviews');
    }

    public function rules(): array
    {
        return [
            'job_application_id' => 'required|exists:job_applications,id',
            'interviewer_id' => 'nullable|exists:users,id',
            'scheduled_date' => 'required|date_format:Y-m-d H:i:s|after:now',
            'duration_minutes' => 'required|integer|min:15',
            'interview_type' => 'required|in:phone,video,in_person',
            'notes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'job_application_id.required' => 'Job application is required',
            'scheduled_date.required' => 'Interview date and time is required',
            'scheduled_date.after' => 'Interview date must be in the future',
            'duration_minutes.min' => 'Duration must be at least 15 minutes',
        ];
    }
}
