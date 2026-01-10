<?php

namespace App\Http\Requests\Leave;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create leave');
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'exists:employees,id'],
            'type' => ['required', 'in:annual,sick,personal,emergency,unpaid'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string'],
            'status' => ['sometimes', 'in:pending,approved,rejected,cancelled'],
            'approved_by' => ['nullable', 'exists:users,id'],
            'approval_date' => ['nullable', 'date'],
        ];
    }
}
