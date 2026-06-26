<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')
            ->whereDoesntHave('roles', function ($query) {
                $query->whereIn('name', ['Student', 'Parent']);
            })
            ->paginate(10);

        $roles = Role::whereNotIn('name', ['Student', 'Parent'])->get();

        return Inertia::render('modules/settings/users', [
            'users' => $users,
            'roles' => $roles
        ]);
    }

    public function toggleStatus(Request $request, User $user)
    {
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
        
        
        $request->validate([
            'name' => 'required|string|max:255',
            'role_id' => 'required|exists:roles,id',
            'status' => 'required|boolean'
        ]);

        $user->update([
            'name' => $request->name,
            'status' => $request->status
        ]);

        $role = Role::find($request->role_id);
        setPermissionsTeamId($role->company_id);
        if (!$user->hasRole($role->name)) {
            $user->assignRole($role);
        }

        return redirect()->back()->with('success', 'User updated successfully.');
    }
}
