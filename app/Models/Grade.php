<?php

namespace App\Models;

use App\Casts\EncryptedString;
use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'order', 'company_id'];

    protected $casts = [
        'name' => EncryptedString::class,
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

    public static function fixOrdering()
    {
        $grades = self::orderBy('order')->get();
        
        foreach ($grades as $index => $grade) {
            $grade->update(['order' => $index + 1]);
        }
    }

    public function classes()
    {
        return $this->hasMany(SchoolClass::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }
}
