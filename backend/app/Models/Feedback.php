<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    use HasFactory;

    protected $fillable = [
        'performance_review_id',
        'from_user_id',
        'feedback_type',
        'rating',
        'comment',
        'status',
        'acknowledged_at',
        'is_anonymous',
    ];

    protected $casts = [
        'acknowledged_at' => 'datetime',
        'is_anonymous' => 'boolean',
        'rating' => 'integer',
    ];

    public function performanceReview(): BelongsTo
    {
        return $this->belongsTo(PerformanceReview::class);
    }

    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }
}
