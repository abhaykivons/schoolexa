<?php

namespace App\Models;

use App\Casts\EncryptedString;
use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'company_id',
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

    protected $casts = [
        'name' => EncryptedString::class,
        'description' => EncryptedString::class,
    ];

    public static function rules($id = null): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:departments,name,'.$id
            ],
            'description' => ['nullable', 'string']
        ];
    }
}
