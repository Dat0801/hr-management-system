<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobPosition extends Model
{
    protected $fillable = [
        'department_id',
        'title',
        'description',
        'requirements',
        'headcount',
        'employment_type',
        'status',
        'salary_from',
        'salary_to',
        'posted_date',
        'closed_date',
        'applications_count',
    ];

    protected $casts = [
        'posted_date' => 'datetime',
        'closed_date' => 'datetime',
        'salary_from' => 'decimal:2',
        'salary_to' => 'decimal:2',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function jobApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function incrementApplicationCount(): void
    {
        $this->increment('applications_count');
    }

    public function decrementApplicationCount(): void
    {
        $this->decrement('applications_count');
    }
}
