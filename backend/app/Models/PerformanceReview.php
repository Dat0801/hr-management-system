<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'reviewer_id',
        'rating_year',
        'period',
        'performance_summary',
        'strengths',
        'areas_for_improvement',
        'overall_rating',
        'rating_leadership',
        'rating_teamwork',
        'rating_communication',
        'rating_technical_skills',
        'rating_attendance',
        'status',
        'review_date',
        'feedback_from_manager',
    ];

    protected $casts = [
        'overall_rating' => 'float',
        'rating_leadership' => 'float',
        'rating_teamwork' => 'float',
        'rating_communication' => 'float',
        'rating_technical_skills' => 'float',
        'rating_attendance' => 'float',
        'review_date' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class, 'performance_review_id');
    }
}
