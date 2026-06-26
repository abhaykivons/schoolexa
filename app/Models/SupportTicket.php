<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Tenant;
use App\Models\User;

class SupportTicket extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'subject',
        'description',
        'ticket_type',
        'status',
        'priority',
        'expected_resolution_date',
        'attachments',
    ];

    protected $casts = [
        'expected_resolution_date' => 'date',
        'attachments' => 'array',
    ];

    /**
     * Get the tenant that owns the support ticket.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the user who created the support ticket.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the replies for the support ticket.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(SupportTicketReply::class);
    }
}
