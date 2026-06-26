<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Casts\EncryptedEmail;
use App\Casts\EncryptedString;
use App\Notifications\CustomResetPassword;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_login',
        'user_id',
        'created_by',
        'status',
        'company_id',
        'type',
        'portal_type',
        'portal_permissions',
    ];

    protected $casts = [
        'status' => 'boolean',
        'is_login' => 'boolean',
        'name' => EncryptedString::class,
        'email' => EncryptedEmail::class,
        'portal_permissions' => 'array',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if ($user->company) {
                $prefix = strtoupper(Str::substr(preg_replace('/\s+/', '', $user->company->name), 0, 3));
                $uniqueNumber = str_pad((string)mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

                $user->user_id = $prefix . '_' . $uniqueNumber;
            }
        });
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new CustomResetPassword($token));
    }

    /**
     * Check if user has access to a specific portal
     */
    public function hasPortalAccess(string $portalType): bool
    {
        if ($this->portal_type === $portalType) {
            return true;
        }

        // Developer should NOT have access to tenant portals (school data)
        // Developers can only access developer portal on central domain
        if ($this->portal_type === 'developer') {
            return false; // Developers cannot access tenant portals
        }

        // IT Admin has access to all tenant portals (for their school only)
        if ($this->portal_type === 'it_admin' && in_array($portalType, ['admin', 'staff', 'parent', 'student'])) {
            return true;
        }

        // Admin users can access staff portal (for managing staff)
        if ($this->portal_type === 'admin' && $portalType === 'staff') {
            return true;
        }

        return false;
    }

    /**
     * Check if user is developer
     */
    public function isDeveloper(): bool
    {
        return $this->portal_type === 'developer' || $this->type === 'developer';
    }

    /**
     * Check if user is IT Admin
     */
    public function isItAdmin(): bool
    {
        return $this->portal_type === 'it_admin';
    }

    /**
     * Check if user is Admin (Dean/Principal/Admin)
     */
    public function isAdmin(): bool
    {
        return $this->portal_type === 'admin';
    }

    /**
     * Check if user is Staff
     */
    public function isStaff(): bool
    {
        return $this->portal_type === 'staff';
    }

    /**
     * Check if user is Parent
     */
    public function isParent(): bool
    {
        return $this->portal_type === 'parent';
    }

    /**
     * Check if user is Student
     */
    public function isStudent(): bool
    {
        return $this->portal_type === 'student';
    }
}
