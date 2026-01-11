<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Services\EmployeeService;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function __construct(private EmployeeService $service) {}

    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 15);
        $employees = $this->service->list($perPage);
        return EmployeeResource::collection($employees);
    }

    public function store(StoreEmployeeRequest $request)
    {
        $employee = $this->service->create($request->validated());
        return new EmployeeResource($employee->load(['user', 'department']));
    }

    public function show(Employee $employee)
    {
        return new EmployeeResource($employee->load(['user', 'department']));
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $updated = $this->service->update($employee->id, $request->validated());
        return new EmployeeResource($updated->load(['user', 'department']));
    }

    public function destroy(Employee $employee)
    {
        $this->service->delete($employee->id);
        return response()->json(['message' => 'Deleted']);
    }
}
