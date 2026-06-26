<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Session;

class CompanyScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (Session::has('company_id') && $this->hasCompanyColumn($model)) {
            $builder->where($model->getTable() . '.company_id', Session::get('company_id'));
        }
        
    }

    protected function hasCompanyColumn(Model $model)
    {
        return in_array('company_id', $model->getConnection()->getSchemaBuilder()->getColumnListing($model->getTable()));
    }
}
