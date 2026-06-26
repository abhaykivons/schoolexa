<?php

namespace App\Models;

use App\Casts\EncryptedString;
use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Model;

class EnrollmentFormSetting extends Model
{
    protected $fillable = [
        'form_type',
        'form_title',
        'notification_email',
        'form_description',
        'public_access_enabled',
        'school_logo',
        'company_id',
    ];

    protected $casts = [
        'public_access_enabled' => 'boolean',
        'form_title' => EncryptedString::class,
        'notification_email' => EncryptedString::class,
        'school_logo' => EncryptedString::class,
    ];

    protected static function booted()
    {
        static::addGlobalScope(new CompanyScope);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (in_array('company_id', $model->getConnection()->getSchemaBuilder()->getColumnListing($model->getTable()))) {
                $model->company_id = session('company_id') ?? 1;
            }
        });
    }

}
