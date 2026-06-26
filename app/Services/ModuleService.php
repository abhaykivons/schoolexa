<?php

namespace App\Services;

use App\Models\Module;
use App\Models\ModuleVersion;
use App\Models\Tenant;
use App\Models\TenantModule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ModuleService
{
    /**
     * Get all available modules
     */
    public function getAllModules()
    {
        return Module::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get modules for a specific tenant
     */
    public function getTenantModules(string $tenantId)
    {
        return TenantModule::where('tenant_id', $tenantId)
            ->with(['module', 'moduleVersion'])
            ->get();
    }

    /**
     * Enable a module for a tenant
     */
    public function enableModuleForTenant(string $tenantId, int $moduleId, ?int $versionId = null): TenantModule
    {
        $module = Module::findOrFail($moduleId);
        
        // Check dependencies
        $this->checkDependencies($tenantId, $module);

        // Get version to use
        if (!$versionId) {
            $version = $module->latestStableVersion();
            if (!$version) {
                throw new \Exception("No stable version available for module: {$module->name}");
            }
            $versionId = $version->id;
        }

        $tenantModule = TenantModule::updateOrCreate(
            [
                'tenant_id' => $tenantId,
                'module_id' => $moduleId,
            ],
            [
                'module_version_id' => $versionId,
                'is_enabled' => true,
            ]
        );

        return $tenantModule;
    }

    /**
     * Disable a module for a tenant
     */
    public function disableModuleForTenant(string $tenantId, int $moduleId): bool
    {
        $module = Module::findOrFail($moduleId);
        
        // Don't allow disabling core modules
        if ($module->is_core) {
            throw new \Exception("Cannot disable core module: {$module->name}");
        }

        // Check if other modules depend on this one
        $this->checkDependents($tenantId, $moduleId);

        return TenantModule::where('tenant_id', $tenantId)
            ->where('module_id', $moduleId)
            ->update(['is_enabled' => false]);
    }

    /**
     * Update module version for a tenant
     */
    public function updateModuleVersion(string $tenantId, int $moduleId, int $versionId): TenantModule
    {
        $tenantModule = TenantModule::where('tenant_id', $tenantId)
            ->where('module_id', $moduleId)
            ->firstOrFail();

        $newVersion = ModuleVersion::findOrFail($versionId);
        
        // Verify version belongs to the module
        if ($newVersion->module_id !== $moduleId) {
            throw new \Exception("Version does not belong to this module");
        }

        $tenantModule->update([
            'module_version_id' => $versionId,
            'last_updated_at' => now(),
        ]);

        return $tenantModule->fresh();
    }

    /**
     * Get available updates for tenant modules
     */
    public function getAvailableUpdates(string $tenantId)
    {
        $tenantModules = TenantModule::where('tenant_id', $tenantId)
            ->where('is_enabled', true)
            ->where('auto_update', true)
            ->with(['module', 'moduleVersion'])
            ->get();

        $updates = [];

        foreach ($tenantModules as $tenantModule) {
            $update = $tenantModule->getAvailableUpdates();
            if ($update) {
                $updates[] = [
                    'module' => $tenantModule->module,
                    'current_version' => $tenantModule->moduleVersion,
                    'available_version' => $update,
                ];
            }
        }

        return $updates;
    }

    /**
     * Check if module dependencies are met
     */
    protected function checkDependencies(string $tenantId, Module $module): void
    {
        if (!$module->dependencies) {
            return;
        }

        $enabledModules = TenantModule::where('tenant_id', $tenantId)
            ->where('is_enabled', true)
            ->pluck('module_id')
            ->toArray();

        $requiredModules = Module::whereIn('code', $module->dependencies)
            ->pluck('id')
            ->toArray();

        $missing = array_diff($requiredModules, $enabledModules);

        if (!empty($missing)) {
            $missingNames = Module::whereIn('id', $missing)->pluck('name')->toArray();
            throw new \Exception("Missing required modules: " . implode(', ', $missingNames));
        }
    }

    /**
     * Check if other modules depend on this module
     */
    protected function checkDependents(string $tenantId, int $moduleId): void
    {
        $module = Module::findOrFail($moduleId);
        $moduleCode = $module->code;

        $dependentModules = Module::where('is_active', true)
            ->whereJsonContains('dependencies', $moduleCode)
            ->pluck('id')
            ->toArray();

        if (empty($dependentModules)) {
            return;
        }

        $enabledDependents = TenantModule::where('tenant_id', $tenantId)
            ->whereIn('module_id', $dependentModules)
            ->where('is_enabled', true)
            ->exists();

        if ($enabledDependents) {
            $dependentNames = Module::whereIn('id', $dependentModules)->pluck('name')->toArray();
            throw new \Exception("Cannot disable module. Other enabled modules depend on it: " . implode(', ', $dependentNames));
        }
    }

    /**
     * Install default modules for a new tenant
     */
    public function installDefaultModules(string $tenantId): void
    {
        $coreModules = Module::where('is_core', true)
            ->where('is_active', true)
            ->get();

        foreach ($coreModules as $module) {
            try {
                $this->enableModuleForTenant($tenantId, $module->id);
            } catch (\Exception $e) {
                Log::error("Failed to install core module {$module->name} for tenant {$tenantId}: " . $e->getMessage());
            }
        }
    }
}
