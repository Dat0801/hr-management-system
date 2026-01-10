<?php

namespace App\Http\Requests\Leave;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update leave');
    }

    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'in:annual,sick,personal,emergency,unpaid'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
            'reason' => ['sometimes', 'string'],
            'status' => ['sometimes', 'in:pending,approved,rejected,cancelled'],
            'approved_by' => ['nullable', 'exists:users,id'],
            'approval_date' => ['nullable', 'date'],
        ];
    }
}
