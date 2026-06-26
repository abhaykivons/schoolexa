<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class EmailSettings extends Model
{
    use HasFactory;

    protected $table = 'email_settings';

    protected $fillable = [
        'company_id',
        'mail_driver',
        'smtp_host',
        'smtp_port',
        'smtp_username',
        'smtp_password',
        'smtp_encryption',
        'mailgun_domain',
        'mailgun_secret',
        'mailgun_endpoint',
        'ses_key',
        'ses_secret',
        'ses_region',
        'postmark_token',
        'from_name',
        'from_email',
        'reply_to_email',
        'is_active',
        'is_verified',
        'verified_at',
        'last_test_at',
        'last_test_result',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'last_test_at' => 'datetime',
    ];

    protected $hidden = [
        'smtp_password',
        'mailgun_secret',
        'ses_secret',
        'postmark_token',
    ];

    /**
     * Boot the model
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new CompanyScope);

        static::creating(function ($settings) {
            if (empty($settings->company_id)) {
                $settings->company_id = auth()->user()?->company_id;
            }
        });
    }

    /**
     * Available mail drivers
     */
    public static function getMailDrivers(): array
    {
        return [
            'smtp' => 'SMTP Server',
            'sendmail' => 'Sendmail',
            'mailgun' => 'Mailgun',
            'ses' => 'Amazon SES',
            'postmark' => 'Postmark',
        ];
    }

    /**
     * Available encryption types
     */
    public static function getEncryptionTypes(): array
    {
        return [
            'tls' => 'TLS',
            'ssl' => 'SSL',
            'none' => 'None',
        ];
    }

    /**
     * Set SMTP password (encrypted)
     */
    public function setSmtpPasswordAttribute($value): void
    {
        if ($value) {
            $this->attributes['smtp_password'] = Crypt::encryptString($value);
        } else {
            $this->attributes['smtp_password'] = null;
        }
    }

    /**
     * Get SMTP password (decrypted)
     */
    public function getSmtpPasswordAttribute($value): ?string
    {
        if ($value) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Set Mailgun secret (encrypted)
     */
    public function setMailgunSecretAttribute($value): void
    {
        if ($value) {
            $this->attributes['mailgun_secret'] = Crypt::encryptString($value);
        } else {
            $this->attributes['mailgun_secret'] = null;
        }
    }

    /**
     * Get Mailgun secret (decrypted)
     */
    public function getMailgunSecretAttribute($value): ?string
    {
        if ($value) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Set SES secret (encrypted)
     */
    public function setSesSecretAttribute($value): void
    {
        if ($value) {
            $this->attributes['ses_secret'] = Crypt::encryptString($value);
        } else {
            $this->attributes['ses_secret'] = null;
        }
    }

    /**
     * Get SES secret (decrypted)
     */
    public function getSesSecretAttribute($value): ?string
    {
        if ($value) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Set Postmark token (encrypted)
     */
    public function setPostmarkTokenAttribute($value): void
    {
        if ($value) {
            $this->attributes['postmark_token'] = Crypt::encryptString($value);
        } else {
            $this->attributes['postmark_token'] = null;
        }
    }

    /**
     * Get Postmark token (decrypted)
     */
    public function getPostmarkTokenAttribute($value): ?string
    {
        if ($value) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Relationships
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get settings for current company
     */
    public static function getForCurrentCompany(): ?self
    {
        return static::first();
    }

    /**
     * Check if email settings are properly configured (has all required fields)
     */
    public function isConfigured(): bool
    {
        // Check common required fields
        if (empty($this->from_name) || empty($this->from_email)) {
            return false;
        }

        // Check driver-specific required fields
        switch ($this->mail_driver) {
            case 'smtp':
                return !empty($this->smtp_host) && !empty($this->smtp_port);
            case 'sendmail':
                return true; // Sendmail doesn't require additional configuration
            case 'mailgun':
                return !empty($this->mailgun_domain) && !empty($this->getRawOriginal('mailgun_secret'));
            case 'ses':
                return !empty($this->ses_key) && !empty($this->getRawOriginal('ses_secret'));
            case 'postmark':
                return !empty($this->getRawOriginal('postmark_token'));
            default:
                return false;
        }
    }

    /**
     * Check if email settings are configured AND active
     */
    public function isActive(): bool
    {
        return $this->is_active && $this->isConfigured();
    }

    /**
     * Get mail configuration array for dynamic mailer
     */
    public function getMailConfig(): array
    {
        $config = [
            'driver' => $this->mail_driver,
            'from' => [
                'address' => $this->from_email,
                'name' => $this->from_name,
            ],
        ];

        switch ($this->mail_driver) {
            case 'smtp':
                $config['host'] = $this->smtp_host;
                $config['port'] = $this->smtp_port;
                $config['username'] = $this->smtp_username;
                $config['password'] = $this->smtp_password;
                $config['encryption'] = $this->smtp_encryption === 'none' ? null : $this->smtp_encryption;
                break;

            case 'mailgun':
                $config['domain'] = $this->mailgun_domain;
                $config['secret'] = $this->mailgun_secret;
                $config['endpoint'] = $this->mailgun_endpoint ?? 'api.mailgun.net';
                break;

            case 'ses':
                $config['key'] = $this->ses_key;
                $config['secret'] = $this->ses_secret;
                $config['region'] = $this->ses_region ?? 'us-east-1';
                break;

            case 'postmark':
                $config['token'] = $this->postmark_token;
                break;
        }

        return $config;
    }

    /**
     * Mark as verified
     */
    public function markAsVerified(): void
    {
        $this->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);
    }

    /**
     * Record test result
     */
    public function recordTestResult(bool $success, ?string $message = null): void
    {
        $this->update([
            'last_test_at' => now(),
            'last_test_result' => $success ? 'Success' : ($message ?? 'Failed'),
            'is_verified' => $success,
            'verified_at' => $success ? now() : null,
        ]);
    }
}

