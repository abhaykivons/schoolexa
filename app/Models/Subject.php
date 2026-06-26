<?php

namespace App\Models;

use App\Casts\EncryptedString;
use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Subject extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'type',
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

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(SchoolClass::class, 'class_subject_teacher', 'subject_id', 'class_id')
            ->using(ClassSubjectTeacher::class)
            ->withPivot('staff_id', 'id');
    }

    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(Staff::class, 'class_subject_teacher', 'subject_id', 'staff_id')
            ->using(ClassSubjectTeacher::class)
            ->withPivot('class_id', 'id');
    }

}
