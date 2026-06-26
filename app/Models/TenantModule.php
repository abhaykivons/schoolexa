<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantModule extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'module_id',
        'module_version_id',
        'is_enabled',
        'custom_config',
        'custom_overrides',
        'auto_update',
        'last_updated_at',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'custom_config' => 'array',
        'custom_overrides' => 'array',
        'auto_update' => 'boolean',
        'last_updated_at' => 'datetime',
    ];

    /**
     * Get the module
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    /**
     * Get the module version
     */
    public function moduleVersion(): BelongsTo
    {
        return $this->belongsTo(ModuleVersion::class);
    }

    /**
     * Get available updates for this module
     */
    public function getAvailableUpdates()
    {
        if (!$this->moduleVersion) {
            return $this->module->latestStableVersion();
        }

        $latestVersion = $this->module->latestStableVersion();
        
        if ($latestVersion && $latestVersion->isNewerThan($this->moduleVersion)) {
            return $latestVersion;
        }

        return null;
    }
}
