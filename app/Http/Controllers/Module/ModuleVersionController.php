<?php

namespace App\Http\Controllers\Module;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ModuleVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuleVersionController extends Controller
{
    /**
     * Show the form for creating a new version
     */
    public function create(Module $module)
    {
        return Inertia::render('modules/versions/Create', [
            'module' => $module,
        ]);
    }

    /**
     * Store a newly created version
     */
    public function store(Request $request, Module $module)
    {
        $validated = $request->validate([
            'version' => 'required|string|max:50|unique:module_versions,version,NULL,id,module_id,' . $module->id,
            'release_name' => 'nullable|string|max:255',
            'changelog' => 'nullable|string',
            'migration_files' => 'nullable|array',
            'routes' => 'nullable|array',
            'permissions' => 'nullable|array',
            'is_stable' => 'boolean',
            'released_at' => 'nullable|date',
        ]);

        $validated['module_id'] = $module->id;
        $validated['is_active'] = true;

        $version = ModuleVersion::create($validated);

        return redirect()->route('modules.show', $module)
            ->with('success', 'Module version created successfully.');
    }

    /**
     * Display the specified version
     */
    public function show(Module $module, ModuleVersion $version)
    {
        return Inertia::render('modules/versions/Show', [
            'module' => $module,
            'version' => $version,
        ]);
    }

    /**
     * Show the form for editing the specified version
     */
    public function edit(Module $module, ModuleVersion $version)
    {
        return Inertia::render('modules/versions/Edit', [
            'module' => $module,
            'version' => $version,
        ]);
    }

    /**
     * Update the specified version
     */
    public function update(Request $request, Module $module, ModuleVersion $version)
    {
        $validated = $request->validate([
            'version' => 'required|string|max:50|unique:module_versions,version,' . $version->id . ',id,module_id,' . $module->id,
            'release_name' => 'nullable|string|max:255',
            'changelog' => 'nullable|string',
            'migration_files' => 'nullable|array',
            'routes' => 'nullable|array',
            'permissions' => 'nullable|array',
            'is_stable' => 'boolean',
            'is_active' => 'boolean',
            'released_at' => 'nullable|date',
        ]);

        $version->update($validated);

        return redirect()->route('modules.show', $module)
            ->with('success', 'Module version updated successfully.');
    }

    /**
     * Remove the specified version
     */
    public function destroy(Module $module, ModuleVersion $version)
    {
        // Check if any tenants are using this version
        if ($version->tenantModules()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete version that is in use by tenants.']);
        }

        $version->delete();

        return redirect()->route('modules.show', $module)
            ->with('success', 'Module version deleted successfully.');
    }
}
