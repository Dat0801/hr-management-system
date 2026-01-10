<?php

namespace App\Http\Requests\Department;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update department');
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255', 'unique:departments,name'],
            'description' => ['nullable', 'string'],
            'manager_id' => ['nullable', 'exists:users,id'],
        ];
    }
}
