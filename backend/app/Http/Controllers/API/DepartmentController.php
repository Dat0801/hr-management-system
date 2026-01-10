<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use App\Services\DepartmentService;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function __construct(private DepartmentService $service) {}

    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 15);
        $departments = $this->service->list($perPage);
        return DepartmentResource::collection($departments);
    }

    public function store(StoreDepartmentRequest $request)
    {
        $department = $this->service->create($request->validated());
        return new DepartmentResource($department);
    }

    public function show(Department $department)
    {
        return new DepartmentResource($department->loadCount('employees')->load('manager'));
    }

    public function update(UpdateDepartmentRequest $request, Department $department)
    {
        $updated = $this->service->update($department->id, $request->validated());
        return new DepartmentResource($updated);
    }

    public function destroy(Department $department)
    {
        $this->service->delete($department->id);
        return response()->json(['message' => 'Deleted']);
    }
}
