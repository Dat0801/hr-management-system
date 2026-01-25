<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobOffer extends Model
{
    protected $fillable = [
        'job_application_id',
        'approved_by',
        'offered_salary',
        'offered_date',
        'expiry_date',
        'status',
        'response_date',
        'terms_and_conditions',
        'notes',
    ];

    protected $casts = [
        'offered_salary' => 'decimal:2',
        'offered_date' => 'datetime',
        'expiry_date' => 'datetime',
        'response_date' => 'datetime',
    ];

    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
