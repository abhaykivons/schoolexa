<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class ErrorLogController extends Controller
{
    /**
     * Display a listing of error logs.
     */
    public function index(Request $request)
    {
        $logFile = storage_path('logs/laravel.log');
        $logs = [];
        $filters = [
            'level' => $request->get('level', 'all'),
            'tenant' => $request->get('tenant', 'all'),
            'date' => $request->get('date', 'today'),
        ];

        if (File::exists($logFile)) {
            $logs = $this->parseLogFile($logFile, $filters);
        }

        return Inertia::render('developer/logs/index', [
            'logs' => $logs,
            'filters' => $filters,
        ]);
    }

    /**
     * Display a specific error log entry.
     */
    public function show($id)
    {
        $logFile = storage_path('logs/laravel.log');
        $log = null;

        if (File::exists($logFile)) {
            $allLogs = $this->parseLogFile($logFile);
            $log = collect($allLogs)->firstWhere('id', $id);
        }

        if (!$log) {
            abort(404, 'Log entry not found.');
        }

        return Inertia::render('developer/logs/show', [
            'log' => $log,
        ]);
    }

    /**
     * Clear all error logs.
     */
    public function clear()
    {
        $logFile = storage_path('logs/laravel.log');
        
        if (File::exists($logFile)) {
            File::put($logFile, '');
        }

        return redirect()->route('developer.logs.index')
            ->with('success', 'Error logs cleared successfully.');
    }

    /**
     * Parse log file and extract entries.
     */
    private function parseLogFile($logFile, $filters = [])
    {
        $content = File::get($logFile);
        $logs = [];
        $entries = preg_split('/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $content, -1, PREG_SPLIT_DELIM_CAPTURE);
        
        $entryId = 0;
        for ($i = 1; $i < count($entries); $i += 2) {
            if (!isset($entries[$i + 1])) {
                continue;
            }

            $timestamp = $entries[$i];
            $logContent = $entries[$i + 1];
            
            // Extract log level
            $level = 'info';
            if (preg_match('/\.(ERROR|CRITICAL|ALERT|EMERGENCY|WARNING|INFO|DEBUG):/', $logContent, $matches)) {
                $level = strtolower($matches[1]);
            }

            // Apply filters
            if (isset($filters['level']) && $filters['level'] !== 'all' && $level !== $filters['level']) {
                continue;
            }

            // Extract tenant information if available
            $tenant = null;
            if (preg_match('/tenant[_\s]*id[:\s]*([a-zA-Z0-9\-]+)/i', $logContent, $matches)) {
                $tenant = $matches[1];
            }

            // Apply tenant filter
            if (isset($filters['tenant']) && $filters['tenant'] !== 'all' && $tenant !== $filters['tenant']) {
                continue;
            }

            $logs[] = [
                'id' => $entryId++,
                'timestamp' => $timestamp,
                'level' => $level,
                'content' => trim($logContent),
                'tenant' => $tenant,
            ];
        }

        // Reverse to show newest first
        return array_reverse($logs);
    }
}
