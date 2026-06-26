<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmissionFormComment extends Model
{
    protected $fillable = [
        'admission_form_id',
        'user_id',
        'field_name',
        'comment',
        'reply',
        'reply_by',
        'reply_at',
        'is_resolved',
        'resolved_at',
        'resolved_by',
    ];

    protected $casts = [
        'is_resolved' => 'boolean',
        'resolved_at' => 'datetime',
        'reply_at' => 'datetime',
    ];

    /**
     * Get the admission form this comment belongs to
     */
    public function admissionForm(): BelongsTo
    {
        return $this->belongsTo(AdmissionForm::class);
    }

    /**
     * Get the user who created this comment (school user)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who replied to this comment (parent)
     */
    public function replier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reply_by');
    }

    /**
     * Check if this is a global comment (not on a specific field)
     */
    public function isGlobal(): bool
    {
        return empty($this->field_name);
    }

    /**
     * Check if this comment has a reply
     */
    public function hasReply(): bool
    {
        return !empty($this->reply);
    }

    /**
     * Mark comment as resolved
     */
    public function markResolved(): void
    {
        $this->is_resolved = true;
        $this->resolved_at = now();
        $this->save();
    }

    /**
     * Add reply from parent
     */
    public function addReply(string $reply, int $userId): void
    {
        $this->reply = $reply;
        $this->reply_by = $userId;
        $this->reply_at = now();
        $this->save();
    }
}
