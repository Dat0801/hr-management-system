<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create job offers');
    }

    public function rules(): array
    {
        return [
            'job_application_id' => 'required|exists:job_applications,id',
            'offered_salary' => 'required|numeric|min:0',
            'offered_date' => 'required|date_format:Y-m-d H:i:s',
            'expiry_date' => 'required|date_format:Y-m-d H:i:s|after:offered_date',
            'terms_and_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'job_application_id.required' => 'Job application is required',
            'offered_salary.required' => 'Offered salary is required',
            'expiry_date.after' => 'Expiry date must be after offered date',
        ];
    }
}
