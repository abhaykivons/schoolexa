<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Designation;
use App\Models\Moduler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DesignationController extends Controller
{
    public function index()
    {
        $designations = Role::whereNotIn('name', ['Student', 'Parent'])->orderBy('hierarchy_level')->get();

        return Inertia::render('modules/settings/designations', [
            'designations' => $designations,
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();
        
        // Find the role and ensure it belongs to the user's company
        $role = Role::findOrFail($id);
        
        // Use loose comparison to handle type mismatches (string vs integer) and null values
        if ($role->company_id != $user->company_id) {
            abort(403, 'Unauthorized action.');
        }
        
        // Set the team context for permissions BEFORE loading them
        setPermissionsTeamId($role->company_id);
        
        // Reload the role with permissions after setting team context
        // This ensures permissions are loaded with the correct team context
        $role = Role::with('permissions')->findOrFail($id);
        
        $modules = Moduler::where('company_id', $role->company_id)->where('status', 1)->get();
        $permissions = Permission::whereIn('moduler_id', $modules->pluck('id'))->get();
        
        return Inertia::render('modules/settings/designation-permissions', [
            'permissions' => $permissions,
            'role' => $role,
            'modules' => $modules,
        ]);
    }

    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
            'hierarchy_level' => 'required|integer|min:1|unique:roles,hierarchy_level',
            'type' => 'nullable|string|max:255',
            'is_visible' => 'nullable|boolean',
            'description' => 'nullable|string',
        ])->validate();

        $validated['company_id'] = Auth::user()->company_id;

        Role::create($validated);

        return redirect()->back()->with('success', 'Designation created successfully.');
    }

    public function update(Request $request, $id)
    {
        $role = Role::find($id);
        $validated = $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('roles', 'name')->ignore($role->id),
            ],
            'hierarchy_level' => [
                'required', 'integer', 'min:1',
                Rule::unique('roles', 'hierarchy_level')->ignore($role->id),
            ],
            'type' => 'nullable|string|max:255',
            'is_visible' => 'nullable|boolean',
            'description' => 'nullable|string',
        ]);

        $validated['company_id'] = Auth::user()->company_id;

        $role->update($validated);

        return redirect()->back()->with('success', 'Designation updated successfully.');
    }

    public function destroy($id)
    {
        $role = Role::find($id);
        // Check if the designation is being used before deleting
        if ($role->users()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete designation as it is assigned to users.');
        }else{
            $role->delete();
            return redirect()->back()->with('success', 'Designation deleted successfully.');
        }        
    }

    public function updatePermissions(Request $request, $role)
    {
        $user = Auth::user();
        
        // Find the role and ensure it belongs to the user's company
        $role = Role::findOrFail($role);
        
        // Use loose comparison to handle type mismatches (string vs integer) and null values
        // This will properly handle cases where company_id might be stored as string or integer
        if ($role->company_id != $user->company_id) {
            abort(403, 'Unauthorized action.');
        }
        
        // Get valid permission IDs for this company to validate against
        $modules = Moduler::where('company_id', $role->company_id)->where('status', 1)->pluck('id');
        $validPermissionIds = Permission::whereIn('moduler_id', $modules)->pluck('id')->toArray();
        
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) use ($validPermissionIds) {
                    if (!in_array((int)$value, $validPermissionIds)) {
                        $fail('The selected permission is invalid or does not belong to your company.');
                    }
                },
            ],
        ]);

        // Set the team context for permissions
        setPermissionsTeamId($role->company_id);

        // Sync permissions for the role (empty array is allowed to remove all permissions)
        $role->syncPermissions($validated['permissions']);

        return redirect()->back()->with('success', 'Permissions updated successfully.');
    }
}