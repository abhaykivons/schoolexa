<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Model;

class ApprovalHistory extends Model
{
    protected $fillable = [
        'module_type',
        'module_id',
        'approval_flow_id',
        'user_id',
        'status',
        'comments',
        'data_snapshot',
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

    public function approvalFlow()
    {
        return $this->belongsTo(ApprovalFlow::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
