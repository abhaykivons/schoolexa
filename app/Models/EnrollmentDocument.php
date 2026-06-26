<?php

namespace App\Models;

use App\Casts\EncryptedString;
use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Model;

class EnrollmentDocument extends Model
{
    protected $fillable = [
        'name',
        'description',
        'type',
        'file_path',
        'text_content',
        'is_required',
        'is_visible',
        'company_id',
    ];

    protected $casts = [
        'name' => EncryptedString::class,
        'description' => EncryptedString::class,
        'file_path' => EncryptedString::class,
        'text_content' => EncryptedString::class,
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
