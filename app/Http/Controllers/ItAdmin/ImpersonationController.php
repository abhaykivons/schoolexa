<?php

namespace App\Http\Controllers\ItAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class ImpersonationController extends Controller
{
    /**
     * Store the original IT Admin session and login as the target user.
     */
    public function loginAs(Request $request, User $user)
    {
        $itAdmin = Auth::user();

        // Ensure IT Admin is authenticated
        if (!$itAdmin->isItAdmin()) {
            abort(403, 'Only IT Administrators can use safe login.');
        }

        // Ensure user belongs to IT Admin's school
        if ($user->company_id !== $itAdmin->company_id) {
            abort(403, 'You can only login as users from your school.');
        }

        // Prevent impersonating yourself
        if ($user->id === $itAdmin->id) {
            abort(403, 'You cannot login as yourself.');
        }

        // Prevent impersonating other IT Admins
        if ($user->isItAdmin()) {
            abort(403, 'You cannot login as another IT Administrator.');
        }

        // Store original IT Admin ID in session
        Session::put('impersonating_from', $itAdmin->id);
        Session::put('impersonating_name', $itAdmin->name);
        Session::put('impersonating_email', $itAdmin->email);

        // Logout current user and login as target user
        Auth::logout();
        Auth::login($user);

        // Determine redirect based on user portal type
        $redirectRoute = match($user->portal_type) {
            'admin' => 'admin.dashboard',
            'staff' => 'staff.dashboard',
            'parent' => 'parent.students.index',
            'student' => 'student.dashboard',
            default => 'dashboard',
        };

        return redirect()->route($redirectRoute)
            ->with('info', "You are now logged in as {$user->name}. Use 'Return to IT Admin' to switch back.");
    }

    /**
     * Return to the original IT Admin session.
     */
    public function returnToItAdmin(Request $request)
    {
        // Check if we're in an impersonation session
        if (!Session::has('impersonating_from')) {
            return redirect()->route('it-admin.dashboard')
                ->with('error', 'No active impersonation session found.');
        }

        $originalItAdminId = Session::get('impersonating_from');

        // Get the original IT Admin user
        $originalItAdmin = User::find($originalItAdminId);

        if (!$originalItAdmin || !$originalItAdmin->isItAdmin()) {
            // Clear session and redirect to login
            Session::forget(['impersonating_from', 'impersonating_name', 'impersonating_email']);
            Auth::logout();
            return redirect()->route('login')
                ->with('error', 'Original IT Admin account not found.');
        }

        // Logout current user and login as original IT Admin
        Auth::logout();
        Auth::login($originalItAdmin);

        // Clear impersonation session data
        Session::forget(['impersonating_from', 'impersonating_name', 'impersonating_email']);

        return redirect()->route('it-admin.dashboard')
            ->with('success', 'Returned to IT Admin account.');
    }

    /**
     * Check if currently impersonating a user.
     */
    public function isImpersonating(): bool
    {
        return Session::has('impersonating_from');
    }

    /**
     * Get impersonation info for display.
     */
    public function getImpersonationInfo(): ?array
    {
        if (!Session::has('impersonating_from')) {
            return null;
        }

        return [
            'original_id' => Session::get('impersonating_from'),
            'original_name' => Session::get('impersonating_name'),
            'original_email' => Session::get('impersonating_email'),
            'current_user' => Auth::user()->name,
        ];
    }
}
