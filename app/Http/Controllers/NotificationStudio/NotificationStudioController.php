<?php

namespace App\Http\Controllers\NotificationStudio;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\NotificationFlow;
use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationStudioController extends Controller
{
    /**
     * Display the notification studio dashboard
     */
    public function index(Request $request)
    {
        $tab = $request->get('tab', 'flows');

        // Get stats
        $stats = [
            'total_templates' => EmailTemplate::count(),
            'active_templates' => EmailTemplate::active()->count(),
            'total_flows' => NotificationFlow::count(),
            'active_flows' => NotificationFlow::active()->count(),
            'notifications_sent' => NotificationLog::sent()->count(),
            'notifications_failed' => NotificationLog::failed()->count(),
            'notifications_today' => NotificationLog::whereDate('created_at', today())->count(),
            'notifications_this_week' => NotificationLog::recent(7)->count(),
        ];

        return Inertia::render('modules/notification-studio/index', [
            'stats' => $stats,
            'tab' => $tab,
            'categories' => EmailTemplate::getCategories(),
            'eventCategories' => NotificationFlow::getEventCategories(),
            'triggerEvents' => NotificationFlow::getTriggerEvents(),
            'recipientTypes' => NotificationFlow::getRecipientTypes(),
        ]);
    }

    /**
     * Get dashboard data for AJAX requests
     */
    public function dashboardData()
    {
        $recentLogs = NotificationLog::with(['notificationFlow', 'emailTemplate'])
            ->latest()
            ->take(10)
            ->get();

        $eventStats = NotificationLog::selectRaw('trigger_event, count(*) as count, status')
            ->groupBy('trigger_event', 'status')
            ->get()
            ->groupBy('trigger_event');

        return response()->json([
            'recent_logs' => $recentLogs,
            'event_stats' => $eventStats,
        ]);
    }
}
