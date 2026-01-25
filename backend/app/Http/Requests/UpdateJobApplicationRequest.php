<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update job applications');
    }

    public function rules(): array
    {
        return [
            'status' => 'sometimes|in:applied,screening,interview,offer,rejected,withdrawn,hired',
            'rating' => 'nullable|numeric|min:1|max:5',
            'notes' => 'nullable|string',
        ];
    }
}
