<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create employee');
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id', 'unique:employees,user_id'],
            'department_id' => ['required', 'exists:departments,id'],
            'position' => ['required', 'string', 'max:255'],
            'salary' => ['required', 'numeric', 'min:0'],
            'hire_date' => ['required', 'date'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:active,inactive,on_leave,terminated'],
        ];
    }
}
