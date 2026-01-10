<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leave\StoreLeaveRequest;
use App\Http\Requests\Leave\UpdateLeaveRequest;
use App\Http\Resources\LeaveResource;
use App\Models\Leave;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 15);
        $leaves = Leave::paginate($perPage);
        return LeaveResource::collection($leaves);
    }

    public function store(StoreLeaveRequest $request)
    {
        $leave = Leave::create($request->validated());
        return new LeaveResource($leave);
    }

    public function show(Leave $leave)
    {
        return new LeaveResource($leave);
    }

    public function update(UpdateLeaveRequest $request, Leave $leave)
    {
        $leave->update($request->validated());
        return new LeaveResource($leave);
    }

    public function destroy(Leave $leave)
    {
        $leave->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
