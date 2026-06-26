<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'notification_flow_id',
        'email_template_id',
        'trigger_event',
        'trigger_entity_type',
        'trigger_entity_id',
        'recipient_type',
        'recipient_email',
        'recipient_name',
        'recipient_user_id',
        'email_sent',
        'in_app_sent',
        'sms_sent',
        'subject',
        'body',
        'status',
        'error_message',
        'scheduled_at',
        'sent_at',
        'variables',
    ];

    protected $casts = [
        'variables' => 'array',
        'email_sent' => 'boolean',
        'in_app_sent' => 'boolean',
        'sms_sent' => 'boolean',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    /**
     * Boot the model
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new CompanyScope);

        static::creating(function ($log) {
            if (empty($log->company_id)) {
                $log->company_id = auth()->user()?->company_id;
            }
        });
    }

    /**
     * Status labels
     */
    public static function getStatusLabels(): array
    {
        return [
            'pending' => 'Pending',
            'sent' => 'Sent',
            'failed' => 'Failed',
            'queued' => 'Queued',
        ];
    }

    /**
     * Relationships
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function notificationFlow()
    {
        return $this->belongsTo(NotificationFlow::class);
    }

    public function emailTemplate()
    {
        return $this->belongsTo(EmailTemplate::class);
    }

    public function recipientUser()
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    /**
     * Get the trigger entity
     */
    public function triggerEntity()
    {
        if ($this->trigger_entity_type && $this->trigger_entity_id) {
            return $this->trigger_entity_type::find($this->trigger_entity_id);
        }
        return null;
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeForEvent($query, string $event)
    {
        return $query->where('trigger_event', $event);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Mark as sent
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * Mark as failed
     */
    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
        ]);
    }
}

