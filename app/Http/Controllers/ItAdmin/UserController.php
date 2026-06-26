<?php

namespace App\Http\Controllers\ItAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users for the IT Admin's school.
     */
    public function index(Request $request)
    {
        $itAdmin = Auth::user();
        
        // IT Admin can only see users from their own school (company)
        $users = User::where('company_id', $itAdmin->company_id)
            ->where('id', '!=', $itAdmin->id) // Exclude IT Admin themselves
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('user_id', 'like', "%{$search}%");
                });
            })
            ->when($request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('it-admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        return Inertia::render('it-admin/users/create');
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $itAdmin = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'type' => ['required', Rule::in(['admin', 'staff', 'parent', 'student'])],
            'portal_type' => ['required', Rule::in(['admin', 'staff', 'parent', 'student'])],
            'status' => 'boolean',
            'is_login' => 'boolean',
        ]);

        // Ensure user belongs to IT Admin's school
        $validated['company_id'] = $itAdmin->company_id;
        $validated['created_by'] = $itAdmin->id;
        $validated['status'] = $validated['status'] ?? true;
        $validated['is_login'] = $validated['is_login'] ?? false;

        User::create($validated);

        return redirect()->route('it-admin.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $itAdmin = Auth::user();

        // Ensure user belongs to IT Admin's school
        if ($user->company_id !== $itAdmin->company_id) {
            abort(403, 'You can only view users from your school.');
        }

        return Inertia::render('it-admin/users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        $itAdmin = Auth::user();

        // Ensure user belongs to IT Admin's school
        if ($user->company_id !== $itAdmin->company_id) {
            abort(403, 'You can only edit users from your school.');
        }

        return Inertia::render('it-admin/users/edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $itAdmin = Auth::user();

        // Ensure user belongs to IT Admin's school
        if ($user->company_id !== $itAdmin->company_id) {
            abort(403, 'You can only update users from your school.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'type' => ['required', Rule::in(['admin', 'staff', 'parent', 'student'])],
            'portal_type' => ['required', Rule::in(['admin', 'staff', 'parent', 'student'])],
            'status' => 'boolean',
            'is_login' => 'boolean',
        ]);

        $user->update($validated);

        return redirect()->route('it-admin.users.show', $user)
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        $itAdmin = Auth::user();

        // Ensure user belongs to IT Admin's school
        if ($user->company_id !== $itAdmin->company_id) {
            abort(403, 'You can only delete users from your school.');
        }

        // Prevent deleting yourself
        if ($user->id === $itAdmin->id) {
            abort(403, 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('it-admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
