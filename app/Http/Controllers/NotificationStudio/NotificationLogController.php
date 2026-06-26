<?php

namespace App\Http\Controllers\NotificationStudio;

use App\Http\Controllers\Controller;
use App\Models\NotificationFlow;
use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class NotificationLogController extends Controller
{
    /**
     * Ensure notification_logs table exists
     */
    private function ensureTablesExist(): void
    {
        if (!Schema::hasTable('notification_logs')) {
            Schema::create('notification_logs', function ($table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->onDelete('cascade');
                $table->foreignId('notification_flow_id')->nullable();
                $table->foreignId('email_template_id')->nullable();
                $table->string('trigger_event');
                $table->string('trigger_entity_type')->nullable();
                $table->unsignedBigInteger('trigger_entity_id')->nullable();
                $table->string('recipient_type');
                $table->string('recipient_email');
                $table->string('recipient_name')->nullable();
                $table->unsignedBigInteger('recipient_user_id')->nullable();
                $table->boolean('email_sent')->default(false);
                $table->boolean('in_app_sent')->default(false);
                $table->boolean('sms_sent')->default(false);
                $table->string('subject')->nullable();
                $table->longText('body')->nullable();
                $table->enum('status', ['pending', 'sent', 'failed', 'queued'])->default('pending');
                $table->text('error_message')->nullable();
                $table->timestamp('scheduled_at')->nullable();
                $table->timestamp('sent_at')->nullable();
                $table->json('variables')->nullable();
                $table->timestamps();
                $table->index(['company_id', 'status']);
                $table->index(['company_id', 'trigger_event']);
                $table->index(['company_id', 'created_at']);
                $table->index(['recipient_email']);
            });
        }
    }

    /**
     * Display a listing of notification logs
     */
    public function index(Request $request)
    {
        $this->ensureTablesExist();
        $query = NotificationLog::with(['notificationFlow', 'emailTemplate']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by event
        if ($request->filled('event')) {
            $query->where('trigger_event', $request->event);
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Filter by search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('recipient_email', 'like', "%{$search}%")
                    ->orWhere('recipient_name', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        $logs = $query->latest()
            ->paginate(20)
            ->withQueryString();

        // Get stats
        $stats = [
            'total' => NotificationLog::count(),
            'sent' => NotificationLog::sent()->count(),
            'failed' => NotificationLog::failed()->count(),
            'pending' => NotificationLog::pending()->count(),
        ];

        return Inertia::render('modules/notification-studio/logs/index', [
            'logs' => $logs,
            'stats' => $stats,
            'triggerEvents' => NotificationFlow::getTriggerEvents(),
            'statusLabels' => NotificationLog::getStatusLabels(),
            'filters' => $request->only(['status', 'event', 'from_date', 'to_date', 'search']),
        ]);
    }

    /**
     * Display a specific log entry
     */
    public function show(NotificationLog $log)
    {
        $log->load(['notificationFlow', 'emailTemplate']);

        return Inertia::render('modules/notification-studio/logs/show', [
            'log' => $log,
            'triggerEvents' => NotificationFlow::getTriggerEvents(),
        ]);
    }

    /**
     * Retry a failed notification
     */
    public function retry(NotificationLog $log)
    {
        if ($log->status !== 'failed') {
            return redirect()->back()->with('error', 'Only failed notifications can be retried.');
        }

        try {
            // Reset status to pending
            $log->update(['status' => 'pending', 'error_message' => null]);

            // Trigger the notification service to resend
            $service = app(\App\Services\NotificationService::class);
            $service->processLog($log);

            return redirect()->back()->with('success', 'Notification retry initiated.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Retry failed: ' . $e->getMessage());
        }
    }

    /**
     * Delete old logs
     */
    public function cleanup(Request $request)
    {
        $request->validate([
            'days' => ['required', 'integer', 'min:7', 'max:365'],
        ]);

        $deleted = NotificationLog::where('created_at', '<', now()->subDays($request->days))
            ->delete();

        return redirect()->back()->with('success', "{$deleted} old log entries deleted.");
    }

    /**
     * Export logs
     */
    public function export(Request $request)
    {
        $query = NotificationLog::with(['notificationFlow', 'emailTemplate']);

        // Apply same filters as index
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('event')) {
            $query->where('trigger_event', $request->event);
        }
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $logs = $query->latest()->get();

        $filename = 'notification_logs_' . date('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');
            
            // Header row
            fputcsv($file, [
                'ID',
                'Date',
                'Event',
                'Recipient',
                'Email',
                'Subject',
                'Status',
                'Sent At',
                'Error',
            ]);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->trigger_event,
                    $log->recipient_name,
                    $log->recipient_email,
                    $log->subject,
                    $log->status,
                    $log->sent_at?->format('Y-m-d H:i:s'),
                    $log->error_message,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

