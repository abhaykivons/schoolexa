<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDeveloperAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        if (!$user->isDeveloper()) {
            abort(403, 'Only developers can access this portal.');
        }

        // Ensure we're on central domain
        $centralDomains = config('tenancy.central_domains', []);
        $currentDomain = $request->getHost();
        
        if (!in_array($currentDomain, $centralDomains)) {
            abort(403, 'Developer portal is only accessible from central domain.');
        }

        return $next($request);
    }
}
