<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ModuleVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'version',
        'release_name',
        'changelog',
        'migration_files',
        'routes',
        'permissions',
        'is_stable',
        'is_active',
        'released_at',
    ];

    protected $casts = [
        'migration_files' => 'array',
        'routes' => 'array',
        'permissions' => 'array',
        'is_stable' => 'boolean',
        'is_active' => 'boolean',
        'released_at' => 'datetime',
    ];

    /**
     * Get the module this version belongs to
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    /**
     * Get tenants using this specific version
     */
    public function tenantModules(): HasMany
    {
        return $this->hasMany(TenantModule::class, 'module_version_id');
    }

    /**
     * Check if this version is newer than another version
     */
    public function isNewerThan(ModuleVersion $version): bool
    {
        return version_compare($this->version, $version->version, '>');
    }
}
