<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public application submission
    }

    public function rules(): array
    {
        return [
            'job_position_id' => 'required|exists:job_positions,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:job_applications,email',
            'phone' => 'required|string|max:20',
            'cover_letter' => 'nullable|string|max:2000',
            'resume_path' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'job_position_id.required' => 'Job position is required',
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'email.required' => 'Email is required',
            'email.unique' => 'This email has already applied',
            'phone.required' => 'Phone number is required',
            'resume_path.mimes' => 'Resume must be a PDF or Word document',
            'resume_path.max' => 'Resume file must not exceed 5MB',
        ];
    }
}
