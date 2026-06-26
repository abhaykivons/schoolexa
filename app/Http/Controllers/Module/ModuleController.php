<?php

namespace App\Http\Controllers\Module;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\ModuleVersion;
use App\Services\ModuleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuleController extends Controller
{
    protected $moduleService;

    public function __construct(ModuleService $moduleService)
    {
        $this->moduleService = $moduleService;
    }

    /**
     * Display a listing of modules
     */
    public function index()
    {
        $modules = $this->moduleService->getAllModules();
        
        return Inertia::render('modules/Index', [
            'modules' => $modules,
        ]);
    }

    /**
     * Show the form for creating a new module
     */
    public function create()
    {
        return Inertia::render('modules/Create');
    }

    /**
     * Store a newly created module
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:modules,code',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'is_core' => 'boolean',
            'dependencies' => 'nullable|array',
            'config_schema' => 'nullable|array',
        ]);

        $module = Module::create($validated);

        return redirect()->route('modules.show', $module)
            ->with('success', 'Module created successfully.');
    }

    /**
     * Display the specified module
     */
    public function show(Module $module)
    {
        $module->load(['versions' => function ($query) {
            $query->orderBy('released_at', 'desc');
        }]);

        return Inertia::render('modules/Show', [
            'module' => $module,
        ]);
    }

    /**
     * Show the form for editing the specified module
     */
    public function edit(Module $module)
    {
        return Inertia::render('modules/Edit', [
            'module' => $module,
        ]);
    }

    /**
     * Update the specified module
     */
    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:modules,code,' . $module->id,
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'is_core' => 'boolean',
            'is_active' => 'boolean',
            'dependencies' => 'nullable|array',
            'config_schema' => 'nullable|array',
        ]);

        $module->update($validated);

        return redirect()->route('modules.show', $module)
            ->with('success', 'Module updated successfully.');
    }

    /**
     * Remove the specified module
     */
    public function destroy(Module $module)
    {
        if ($module->is_core) {
            return back()->withErrors(['error' => 'Cannot delete core modules.']);
        }

        $module->delete();

        return redirect()->route('modules.index')
            ->with('success', 'Module deleted successfully.');
    }
}
