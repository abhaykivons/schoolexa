<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'category',
        'is_core',
        'is_active',
        'sort_order',
        'dependencies',
        'config_schema',
    ];

    protected $casts = [
        'is_core' => 'boolean',
        'is_active' => 'boolean',
        'dependencies' => 'array',
        'config_schema' => 'array',
    ];

    /**
     * Get all versions of this module
     */
    public function versions(): HasMany
    {
        return $this->hasMany(ModuleVersion::class);
    }

    /**
     * Get the latest stable version
     */
    public function latestStableVersion()
    {
        return $this->versions()
            ->where('is_stable', true)
            ->where('is_active', true)
            ->orderBy('released_at', 'desc')
            ->first();
    }

    /**
     * Get the latest version (including beta/alpha)
     */
    public function latestVersion()
    {
        return $this->versions()
            ->where('is_active', true)
            ->orderBy('released_at', 'desc')
            ->first();
    }

    /**
     * Get tenants using this module
     */
    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(
            Tenant::class,
            'tenant_modules',
            'module_id',
            'tenant_id',
            'id',
            'id'
        )->withPivot(['module_version_id', 'is_enabled', 'custom_config', 'auto_update'])
          ->withTimestamps();
    }
}
