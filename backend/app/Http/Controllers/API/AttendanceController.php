<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\StoreAttendanceRequest;
use App\Http\Requests\Attendance\UpdateAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 15);
        $attendances = Attendance::paginate($perPage);
        return AttendanceResource::collection($attendances);
    }

    public function store(StoreAttendanceRequest $request)
    {
        $attendance = Attendance::create($request->validated());
        return new AttendanceResource($attendance);
    }

    public function show(Attendance $attendance)
    {
        return new AttendanceResource($attendance);
    }

    public function update(UpdateAttendanceRequest $request, Attendance $attendance)
    {
        $attendance->update($request->validated());
        return new AttendanceResource($attendance);
    }

    public function destroy(Attendance $attendance)
    {
        $attendance->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
