<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserType
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $userType): Response
    {
        if (!Auth::check()) {
            abort(403, 'Unauthorized action.');
        }

        $user = Auth::user();

        // Prevent developers from accessing tenant routes (it_admin can access tenant portals)
        if ($user->type === 'developer' && $userType !== 'developer') {
            abort(403, 'Developers should access the developer portal from the central domain.');
        }

        // Check if user type matches the required userType parameter
        if ($user->type === $userType) {
            return $next($request);
        }

        if ($userType === 'school' && in_array($user->type, ['staff', 'admin', 'it_admin'])) {
            return $next($request);
        }

        // and explicitly deny parent and student users
        if ($userType === 'school' && in_array($user->type, ['parent', 'student'])) {
            abort(403, 'Unauthorized action.');
        }

        abort(403, 'Unauthorized action.');
        
    }
}
