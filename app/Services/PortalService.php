<?php

namespace App\Services;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Support\Facades\Cache;

class PortalService
{
    /**
     * Get portal configuration for a user
     */
    public function getPortalConfig(User $user): array
    {
        $portalType = $user->portal_type ?? 'staff';
        
        return [
            'portal_type' => $portalType,
            'allowed_routes' => $this->getAllowedRoutes($portalType),
            'modules' => $this->getUserModules($user),
            'permissions' => $this->getUserPermissions($user),
        ];
    }

    /**
     * Get allowed routes for a portal type
     */
    protected function getAllowedRoutes(string $portalType): array
    {
        $routes = [
            'developer' => [
                'developer.*',
                'api.*',
            ],
            'it_admin' => [
                'dashboard',
                'settings.*',
                'it-admin.*',
                'staff.*', // IT Admin can access staff portal to help staff
                'api.*',
            ],
            'admin' => [
                'dashboard',
                'admin.*',
                'reports.*',
                'settings.*',
                'api.*',
            ],
            'staff' => [
                'dashboard',
                'staff.*',
                'api.*',
            ],
            'parent' => [
                'parent.*',
                'api.*',
            ],
            'student' => [
                'student.*',
                'api.*',
            ],
        ];

        return $routes[$portalType] ?? [];
    }

    /**
     * Get modules available to user based on tenant
     */
    protected function getUserModules(User $user): array
    {
        if (!$user->company_id) {
            return [];
        }

        // For now, return all enabled modules for the tenant
        // In future, this can be filtered based on user role/permissions
        $cacheKey = "user_modules_{$user->id}";
        
        return Cache::remember($cacheKey, 3600, function () use ($user) {
            // This would need tenant context
            // For now, return empty array
            return [];
        });
    }

    /**
     * Get permissions for user
     */
    protected function getUserPermissions(User $user): array
    {
        $permissions = $user->getAllPermissions()->pluck('name')->toArray();
        
        // Add portal-specific permissions
        if ($user->portal_permissions) {
            $permissions = array_merge($permissions, $user->portal_permissions);
        }

        return array_unique($permissions);
    }

    /**
     * Check if user can access a route
     */
    public function canAccessRoute(User $user, string $routeName): bool
    {
        $config = $this->getPortalConfig($user);
        $allowedRoutes = $config['allowed_routes'];

        foreach ($allowedRoutes as $pattern) {
            if (fnmatch($pattern, $routeName)) {
                return true;
            }
        }

        return false;
    }
}
