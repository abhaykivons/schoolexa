<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class EnsurePortalAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $portalType): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        // Allow access if user has portal access
        if ($user->hasPortalAccess($portalType)) {
            return $next($request);
        }

        // Allow access if IT Admin is impersonating (safe login)
        if (Session::has('impersonating_from') && $user->portal_type === $portalType) {
            return $next($request);
        }

        abort(403, 'You do not have access to this portal.');
    }
}
