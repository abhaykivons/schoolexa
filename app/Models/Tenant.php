<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    protected $fillable = [
        'id',
        'name',
        'data',
        'setup_type',
        'allows_multiple_campuses',
        'module_settings',
    ];

    protected $casts = [
        'allows_multiple_campuses' => 'boolean',
        'module_settings' => 'array',
    ];

    public function getDatabaseName(): string
    {
        return 'tenant_' . $this->name;
    }

    // public function getConnectionName(): string
    // {
    //     return 'tenant';
    // }

    /**
     * Get modules for this tenant
     * Note: tenant_id is stored as string, not foreign key
     */
    public function tenantModules()
    {
        return TenantModule::where('tenant_id', $this->id);
    }

    /**
     * Get enabled modules for this tenant
     */
    public function enabledModules()
    {
        return TenantModule::where('tenant_id', $this->id)->where('is_enabled', true);
    }

    /**
     * Get campuses for this tenant
     */
    public function campuses()
    {
        return Campus::forTenant($this->id);
    }

    /**
     * Check if tenant can have multiple campuses
     */
    public function canHaveMultipleCampuses(): bool
    {
        return $this->allows_multiple_campuses || $this->setup_type === 'private_setup';
    }
}