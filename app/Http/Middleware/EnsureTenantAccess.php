<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantAccess
{
    /**
     * Handle an incoming request.
     * 
     * This middleware ensures:
     * 1. User is authenticated
     * 2. Request is on tenant domain (tenancy is initialized)
     * 3. User is NOT a developer (developers should use central portal)
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // Prevent developers from accessing tenant portals (it_admin can access tenant portals)
        if ($user->type === 'developer') {
            abort(403, 'Developers should access the developer portal from the central domain.');
        }

        // Ensure we're on tenant domain
        if (!tenant()) {
            abort(403, 'This portal is only accessible from tenant domains.');
        }

        return $next($request);
    }
}
