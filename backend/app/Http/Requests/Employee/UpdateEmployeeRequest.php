<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update employee');
    }

    public function rules(): array
    {
        return [
            'department_id' => ['sometimes', 'exists:departments,id'],
            'position' => ['sometimes', 'string', 'max:255'],
            'salary' => ['sometimes', 'numeric', 'min:0'],
            'hire_date' => ['sometimes', 'date'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'status' => ['sometimes', 'in:active,inactive,on_leave,terminated'],
        ];
    }
}
