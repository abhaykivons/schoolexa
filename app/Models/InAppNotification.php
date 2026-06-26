<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InAppNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'title',
        'message',
        'type',
        'icon',
        'action_url',
        'action_text',
        'notifiable_type',
        'notifiable_id',
        'notification_log_id',
        'trigger_event',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * Boot the model
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new CompanyScope);

        static::creating(function ($notification) {
            if (empty($notification->company_id) && auth()->user()) {
                $notification->company_id = auth()->user()->company_id;
            }
        });
    }

    /**
     * Notification types with icons
     */
    public static function getTypes(): array
    {
        return [
            'info' => ['label' => 'Info', 'icon' => 'info', 'color' => 'blue'],
            'success' => ['label' => 'Success', 'icon' => 'check-circle', 'color' => 'green'],
            'warning' => ['label' => 'Warning', 'icon' => 'alert-triangle', 'color' => 'amber'],
            'error' => ['label' => 'Error', 'icon' => 'x-circle', 'color' => 'red'],
        ];
    }

    /**
     * Relationships
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function notificationLog()
    {
        return $this->belongsTo(NotificationLog::class);
    }

    public function notifiable()
    {
        return $this->morphTo();
    }

    /**
     * Scopes
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, int $limit = 10)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    /**
     * Mark as read
     */
    public function markAsRead(): bool
    {
        return $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    /**
     * Create notification for user
     */
    public static function createForUser(int $userId, array $data): self
    {
        $user = User::find($userId);
        
        return static::create([
            'company_id' => $user?->company_id,
            'user_id' => $userId,
            'title' => $data['title'],
            'message' => $data['message'],
            'type' => $data['type'] ?? 'info',
            'icon' => $data['icon'] ?? null,
            'action_url' => $data['action_url'] ?? null,
            'action_text' => $data['action_text'] ?? null,
            'notifiable_type' => $data['notifiable_type'] ?? null,
            'notifiable_id' => $data['notifiable_id'] ?? null,
            'notification_log_id' => $data['notification_log_id'] ?? null,
            'trigger_event' => $data['trigger_event'] ?? null,
        ]);
    }
}

