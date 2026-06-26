<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        // User has no global CompanyScope (login/impersonation query it across
        // the boundary), so scope the listing to the caller's company here.
        $companyId = auth()->user()->company_id;

        $users = User::with('roles')
            ->where('company_id', $companyId)
            ->whereDoesntHave('roles', function ($query) {
                $query->whereIn('name', ['Student', 'Parent']);
            })
            ->paginate(10);

        $roles = Role::where('company_id', $companyId)
            ->whereNotIn('name', ['Student', 'Parent'])
            ->get();

        return Inertia::render('modules/settings/users', [
            'users' => $users,
            'roles' => $roles
        ]);
    }

    public function toggleStatus(Request $request, User $user)
    {
        $this->authorizeSameCompany($user);

        $request->validate([
            'is_login' => 'required|boolean'
        ]);

        $user->update([
            'is_login' => $request->is_login
        ]);

        return redirect()->back()->with('success', 'User status updated successfully.');
    }

    public function update(Request $request, User $user)
    {
        $this->authorizeSameCompany($user);

        $companyId = auth()->user()->company_id;

        $request->validate([
            'name' => 'required|string|max:255',
            // role must belong to the caller's company, not just any company.
            'role_id' => ['required', Rule::exists('roles', 'id')->where('company_id', $companyId)],
            'status' => 'required|boolean'
        ]);

        $user->update([
            'name' => $request->name,
            'status' => $request->status
        ]);

        $role = Role::where('company_id', $companyId)->findOrFail($request->role_id);
        setPermissionsTeamId($companyId);
        if (!$user->hasRole($role->name)) {
            $user->assignRole($role);
        }

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Ensure the target user belongs to the authenticated user's company.
     * Prevents cross-company account edits / role assignment.
     */
    private function authorizeSameCompany(User $user): void
    {
        abort_unless((int) $user->company_id === (int) auth()->user()->company_id, 403);
    }
}
