<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class DatabaseController extends Controller
{
    /**
     * Display the developer settings page.
     */
    public function index()
    {
        // Only allow in local/development environment
        $isLocalEnv = app()->environment('local', 'development', 'testing');
        
        return Inertia::render('settings/developer', [
            'isLocalEnv' => $isLocalEnv,
        ]);
    }

    /**
     * Run migrate:fresh --seed command.
     */
    public function resetDatabase(Request $request)
    {
        // Only allow in local/development environment
        if (!app()->environment('local', 'development', 'testing')) {
            return back()->with('error', 'Database reset is only allowed in local/development environment.');
        }

        try {
            // Run migrate:fresh --seed
            Artisan::call('migrate:fresh', [
                '--seed' => true,
                '--force' => true,
            ]);

            $output = Artisan::output();

            return redirect()->route('developer.index')->with('success', 'Database has been reset and seeded successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to reset database: ' . $e->getMessage());
        }
    }

    /**
     * Clear application cache (config, cache, routes).
     */
    public function clearCache(Request $request)
    {
        // Only allow in local/development environment
        if (!app()->environment('local', 'development', 'testing')) {
            return back()->with('error', 'Cache clearing is only allowed in local/development environment.');
        }

        try {
            // Clear config cache
            Artisan::call('config:clear');
            
            // Clear application cache
            Artisan::call('cache:clear');
            
            // Clear route cache
            Artisan::call('route:clear');

            Artisan::call('view:clear');

            Artisan::call('optimize:clear');


            return redirect()->route('developer.index')->with('success', 'All caches have been cleared successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to clear cache: ' . $e->getMessage());
        }
    }
}


