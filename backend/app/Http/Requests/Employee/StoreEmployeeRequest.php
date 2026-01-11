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
            'user_id' => ['nullable', 'exists:users,id', 'unique:employees,user_id'],
            'name' => ['required_without:user_id', 'string', 'max:255'],
            'email' => ['required_without:user_id', 'email'],
            'password' => ['nullable', 'string', 'min:6'],
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

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $email = $this->input('email');
            $userId = $this->input('user_id');

            if (!$userId && $email) {
                $user = \App\Models\User::where('email', $email)->first();
                if ($user) {
                    // Check if user has an active employee record
                    // Note: Employee model uses SoftDeletes, so where() excludes deleted records by default.
                    $employee = \App\Models\Employee::where('user_id', $user->id)->first();
                    
                    if ($employee) {
                        $validator->errors()->add('email', 'This email is already associated with an active employee.');
                    }
                }
            }
        });
    }
}
