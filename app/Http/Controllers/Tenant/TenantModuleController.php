<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\ModuleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantModuleController extends Controller
{
    protected $moduleService;

    public function __construct(ModuleService $moduleService)
    {
        $this->moduleService = $moduleService;
    }

    /**
     * Display modules for a tenant
     */
    public function index(Tenant $tenant)
    {
        $modules = $this->moduleService->getTenantModules($tenant->id);
        $availableModules = $this->moduleService->getAllModules();
        $availableUpdates = $this->moduleService->getAvailableUpdates($tenant->id);

        return Inertia::render('tenants/modules/Index', [
            'tenant' => $tenant,
            'modules' => $modules,
            'availableModules' => $availableModules,
            'availableUpdates' => $availableUpdates,
        ]);
    }

    /**
     * Enable a module for tenant
     */
    public function enable(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'version_id' => 'nullable|exists:module_versions,id',
        ]);

        try {
            $tenantModule = $this->moduleService->enableModuleForTenant(
                $tenant->id,
                $validated['module_id'],
                $validated['version_id'] ?? null
            );

            return back()->with('success', 'Module enabled successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Disable a module for tenant
     */
    public function disable(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
        ]);

        try {
            $this->moduleService->disableModuleForTenant($tenant->id, $validated['module_id']);

            return back()->with('success', 'Module disabled successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Update module version for tenant
     */
    public function updateVersion(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'version_id' => 'required|exists:module_versions,id',
        ]);

        try {
            $this->moduleService->updateModuleVersion(
                $tenant->id,
                $validated['module_id'],
                $validated['version_id']
            );

            return back()->with('success', 'Module version updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Get available updates for tenant
     */
    public function availableUpdates(Tenant $tenant)
    {
        $updates = $this->moduleService->getAvailableUpdates($tenant->id);

        return response()->json($updates);
    }
}
