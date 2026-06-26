<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Casts\EncryptedJson;

class AdmissionForm extends Model
{
    protected $fillable = [
        'student_id',
        'form_id',
        'user_id',
        'form_type',
        'latest_data',
        'approved_data',
        'approved_by',
        'approved_at',
        'status',
        'version',
    ];

    protected $casts = [
        'latest_data' => EncryptedJson::class,
        'approved_data' => EncryptedJson::class,
        'approved_at' => 'datetime',
        'version' => 'integer',
    ];

    /**
     * Get the student that owns this form
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the form template
     */
    public function form(): BelongsTo
    {
        return $this->belongsTo(StudentAdmissionForm::class, 'form_id');
    }

    /**
     * Get the user who submitted/updated
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who approved
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the data to display (approved if available, otherwise latest)
     */
    public function getDisplayDataAttribute(): array
    {
        return $this->approved_data ?? $this->latest_data ?? [];
    }

    /**
     * Check if form has approved data
     */
    public function hasApprovedData(): bool
    {
        return !empty($this->approved_data);
    }

    /**
     * Get form data by key
     */
    public function getData(string $key, $default = null)
    {
        $data = $this->display_data;
        return $data[$key] ?? $default;
    }

    /**
     * Update latest data
     */
    public function updateLatestData(array $data): void
    {
        $this->latest_data = $data;
        $this->version = ($this->version ?? 0) + 1;
        $this->status = 'submitted';
        $this->save();
    }

    /**
     * Approve latest data
     * Copies latest_data to approved_data, making it the official approved version
     */
    public function approve(int $approvedBy): void
    {
        // Copy latest_data to approved_data (this becomes the official approved version)
        $this->approved_data = $this->latest_data ?? [];
        $this->approved_by = $approvedBy;
        $this->approved_at = now();
        $this->status = 'approved';
        $this->save();
    }

    /**
     * Reject form
     */
    public function reject(): void
    {
        $this->status = 'rejected';
        $this->save();
    }

    /**
     * Get comments for this form
     */
    public function comments(): HasMany
    {
        return $this->hasMany(AdmissionFormComment::class);
    }

    /**
     * Get documents for this form
     */
    public function documents(): HasMany
    {
        return $this->hasMany(AdmissionDocument::class);
    }

    /**
     * Get unresolved comments count
     */
    public function getUnresolvedCommentsCountAttribute(): int
    {
        return $this->comments()->where('is_resolved', false)->count();
    }

    /**
     * Get global comments (not on specific fields)
     */
    public function globalComments(): HasMany
    {
        return $this->hasMany(AdmissionFormComment::class)->whereNull('field_name');
    }

    /**
     * Get field-specific comments
     */
    public function fieldComments(): HasMany
    {
        return $this->hasMany(AdmissionFormComment::class)->whereNotNull('field_name');
    }
}
