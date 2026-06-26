<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        if(Auth::user()->is_login == 0){
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'Your account is not activated yet. Please contact administrator.',
            ]);
        }

        // Redirect based on user type and domain
        if(Auth::user()->type === 'developer'){
            return redirect()->intended(route('developer.dashboard', absolute: false));
        }elseif(Auth::user()->type === 'it_admin'){
            // IT Admin can only access IT admin portal on tenant domain (not developer portal)
            // Check if we're on tenant domain
            if(tenant()){
                return redirect()->intended(route('it-admin.dashboard', absolute: false));
            } else {
                // IT Admin should not access central domain - redirect to login with error
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                throw ValidationException::withMessages([
                    'email' => 'IT Admin portal is only accessible from your school domain.',
                ]);
            }
        }elseif(Auth::user()->type == 'student'){
            return redirect()->intended(route('student.dashboard', absolute: false));
        }elseif(Auth::user()->type == 'parent'){
            return redirect()->intended(route('parent.students.index', absolute: false));
        }else{
            return redirect()->intended(route('dashboard', absolute: false));
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        // If impersonating, return to IT Admin instead of logging out
        if ($request->session()->has('impersonating_from')) {
            $originalItAdminId = $request->session()->get('impersonating_from');
            $originalItAdmin = \App\Models\User::find($originalItAdminId);
            
            if ($originalItAdmin && $originalItAdmin->isItAdmin()) {
                Auth::guard('web')->logout();
                Auth::login($originalItAdmin);
                
                $request->session()->forget(['impersonating_from', 'impersonating_name', 'impersonating_email']);
                
                return redirect()->route('it-admin.dashboard')
                    ->with('success', 'Returned to IT Admin account.');
            }
        }
    
        Auth::guard('web')->logout();
    
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Redirect developers and it_admin to home, others to school login
        if ($user && !in_array($user->type, ['developer', 'it_admin']) && $user->company) {
            return redirect()->route('school-login.index', [
                'uuid' => $user->company->uuid
            ]);
        }
    
        return redirect('/');
    }
}
