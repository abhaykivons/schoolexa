<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Downtime;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the developer dashboard.
     */
    public function index()
    {
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('data->active', true)->count(),
            'ongoing_downtime' => Downtime::where('status', 'ongoing')->count(),
            'recent_errors' => $this->getRecentErrorCount(),
            'total_leads' => Lead::count(),
            'new_leads' => Lead::where('status', 'new')->count(),
            'converted_leads' => Lead::where('status', 'converted')->count(),
        ];

        $recentTenants = Tenant::with('domains')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentDowntime = Downtime::with('tenant')
            ->orderBy('started_at', 'desc')
            ->limit(5)
            ->get();

        $recentLeads = Lead::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('developer/dashboard', [
            'stats' => $stats,
            'recentTenants' => $recentTenants,
            'recentDowntime' => $recentDowntime,
            'recentLeads' => $recentLeads,
        ]);
    }

    /**
     * Get count of recent errors from log file.
     */
    private function getRecentErrorCount()
    {
        $logFile = storage_path('logs/laravel.log');
        
        if (!file_exists($logFile)) {
            return 0;
        }

        $content = file_get_contents($logFile);
        $errorPattern = '/\.(ERROR|CRITICAL|ALERT|EMERGENCY):/';
        
        return preg_match_all($errorPattern, $content);
    }
}
