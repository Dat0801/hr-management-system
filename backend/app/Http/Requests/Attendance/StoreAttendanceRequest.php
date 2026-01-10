<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create attendance');
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'exists:employees,id'],
            'date' => ['required', 'date'],
            'check_in' => ['nullable', 'date'],
            'check_out' => ['nullable', 'date'],
            'status' => ['required', 'in:present,absent,late,half_day'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
