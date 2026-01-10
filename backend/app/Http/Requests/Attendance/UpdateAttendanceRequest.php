<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update attendance');
    }

    public function rules(): array
    {
        return [
            'check_in' => ['nullable', 'date'],
            'check_out' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:present,absent,late,half_day'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
