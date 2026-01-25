<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Services\PayrollService;
use App\Http\Requests\StorePayrollRequest;
use App\Http\Requests\UpdatePayrollRequest;
use App\Http\Resources\PayrollResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function __construct(private PayrollService $payrollService)
    {
        $this->middleware('auth:sanctum');
        $this->middleware('can:manage payrolls')->except(['index', 'show', 'getMyPayroll']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->query();
        $perPage = $request->query('per_page', 15);

        $payrolls = $this->payrollService->getAllPayrolls($filters, $perPage);

        return response()->json([
            'data' => PayrollResource::collection($payrolls)->resolve(),
            'meta' => [
                'total' => $payrolls->total(),
                'per_page' => $payrolls->perPage(),
                'current_page' => $payrolls->currentPage(),
                'last_page' => $payrolls->lastPage(),
            ],
            'links' => [
                'first' => $payrolls->url(1),
                'last' => $payrolls->url($payrolls->lastPage()),
                'prev' => $payrolls->previousPageUrl(),
                'next' => $payrolls->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePayrollRequest $request): JsonResponse
    {
        $payroll = $this->payrollService->createPayroll($request->validated());

        return response()->json(
            new PayrollResource($payroll),
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        $payroll = $this->payrollService->getPayrollById($id);

        if (!$payroll) {
            return response()->json(['message' => 'Payroll not found'], 404);
        }

        return response()->json(new PayrollResource($payroll));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePayrollRequest $request, int $id): JsonResponse
    {
        $payroll = $this->payrollService->getPayrollById($id);

        if (!$payroll) {
            return response()->json(['message' => 'Payroll not found'], 404);
        }

        $payroll = $this->payrollService->updatePayroll($id, $request->validated());

        return response()->json(new PayrollResource($payroll));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $payroll = $this->payrollService->getPayrollById($id);

        if (!$payroll) {
            return response()->json(['message' => 'Payroll not found'], 404);
        }

        if ($payroll->status !== 'draft') {
            return response()->json(
                ['message' => 'Can only delete draft payrolls'],
                422
            );
        }

        $this->payrollService->deletePayroll($id);

        return response()->json(['message' => 'Payroll deleted successfully']);
    }

    /**
     * Approve payroll
     */
    public function approve(int $id): JsonResponse
    {
        $payroll = $this->payrollService->getPayrollById($id);

        if (!$payroll) {
            return response()->json(['message' => 'Payroll not found'], 404);
        }

        if ($payroll->status !== 'draft' && $payroll->status !== 'pending') {
            return response()->json(
                ['message' => 'Only draft or pending payrolls can be approved'],
                422
            );
        }

        $payroll = $this->payrollService->approvePayroll($id);

        return response()->json(new PayrollResource($payroll));
    }

    /**
     * Mark payroll as paid
     */
    public function markAsPaid(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'paid_date' => 'nullable|date',
        ]);

        $payroll = $this->payrollService->getPayrollById($id);

        if (!$payroll) {
            return response()->json(['message' => 'Payroll not found'], 404);
        }

        if ($payroll->status !== 'approved') {
            return response()->json(
                ['message' => 'Only approved payrolls can be marked as paid'],
                422
            );
        }

        $payroll = $this->payrollService->markAsPaid($id, $request->input('paid_date'));

        return response()->json(new PayrollResource($payroll));
    }

    /**
     * Get current employee's payroll history
     */
    public function getMyPayroll(): JsonResponse
    {
        $user = auth('sanctum')->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $payrolls = $this->payrollService->getEmployeePayrollHistory($employee->id, 12);

        return response()->json([
            'data' => PayrollResource::collection($payrolls)->resolve(),
        ]);
    }

    /**
     * Get payrolls by status
     */
    public function getByStatus(string $status): JsonResponse
    {
        $validStatuses = ['draft', 'pending', 'approved', 'paid'];

        if (!in_array($status, $validStatuses)) {
            return response()->json(['message' => 'Invalid status'], 422);
        }

        $perPage = request()->query('per_page', 15);
        $payrolls = $this->payrollService->getPayrollsByStatus($status, $perPage);

        return response()->json([
            'data' => PayrollResource::collection($payrolls)->resolve(),
            'meta' => [
                'total' => $payrolls->total(),
                'per_page' => $payrolls->perPage(),
                'current_page' => $payrolls->currentPage(),
                'last_page' => $payrolls->lastPage(),
            ],
            'links' => [
                'first' => $payrolls->url(1),
                'last' => $payrolls->url($payrolls->lastPage()),
                'prev' => $payrolls->previousPageUrl(),
                'next' => $payrolls->nextPageUrl(),
            ],
        ]);
    }
}

