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
        // Models that don't carry a company_id can't be scoped; leave them alone.
        if (! $this->hasCompanyColumn($model)) {
            return;
        }

        if (Session::has('company_id')) {
            $builder->where($model->getTable() . '.company_id', Session::get('company_id'));
            return;
        }

        // Fail closed: with no resolvable company context (queue worker, console
        // command, or guest request) we must NOT fall through and return another
        // company's rows. Previously this scope was a no-op here, which silently
        // leaked cross-tenant data. Trusted server-side code that legitimately runs
        // without a session must opt out explicitly via
        // ->withoutGlobalScope(\App\Models\Scopes\CompanyScope::class) and then
        // constrain company_id itself.
        $builder->whereRaw('1 = 0');
    }

    protected function hasCompanyColumn(Model $model)
    {
        return in_array('company_id', $model->getConnection()->getSchemaBuilder()->getColumnListing($model->getTable()));
    }
}
