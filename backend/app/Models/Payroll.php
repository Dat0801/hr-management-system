<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'month',
        'year',
        'base_salary',
        'overtime_amount',
        'bonus_amount',
        'allowances',
        'deductions',
        'tax_amount',
        'insurance_amount',
        'net_salary',
        'gross_salary',
        'status',
        'paid_date',
        'notes',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'base_salary' => 'decimal:2',
        'overtime_amount' => 'decimal:2',
        'bonus_amount' => 'decimal:2',
        'allowances' => 'decimal:2',
        'deductions' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'insurance_amount' => 'decimal:2',
        'net_salary' => 'decimal:2',
        'gross_salary' => 'decimal:2',
        'paid_date' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
