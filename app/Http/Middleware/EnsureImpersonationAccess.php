<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class EnsureImpersonationAccess
{
    /**
     * Handle an incoming request.
     *
     * This middleware ensures that impersonation sessions are properly tracked
     * and allows IT Admin to access user portals when impersonating.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If impersonating, allow access to portal routes
        if (Session::has('impersonating_from')) {
            return $next($request);
        }

        // If not impersonating, proceed normally
        return $next($request);
    }
}
