<?php

namespace App\Http\Controllers\NotificationStudio;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\NotificationFlow;
use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class NotificationStudioController extends Controller
{
    /**
     * Ensure required tables exist
     */
    private function ensureTablesExist(): void
    {
        // Create notification_flows table if not exists
        if (!Schema::hasTable('notification_flows')) {
            Schema::create('notification_flows', function ($table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->onDelete('cascade');
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('trigger_event');
                $table->json('recipients');
                $table->json('custom_emails')->nullable();
                $table->boolean('send_email')->default(true);
                $table->boolean('send_in_app')->default(false);
                $table->boolean('send_sms')->default(false);
                $table->foreignId('email_template_id')->nullable()->constrained('email_templates')->nullOnDelete();
                $table->enum('send_timing', ['immediate', 'delayed', 'scheduled'])->default('immediate');
                $table->integer('delay_minutes')->nullable();
                $table->string('schedule_time')->nullable();
                $table->json('conditions')->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('priority')->default(0);
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                $table->index(['company_id', 'trigger_event']);
                $table->index(['company_id', 'is_active']);
            });
        }

        // Create notification_logs table if not exists
        if (!Schema::hasTable('notification_logs')) {
            Schema::create('notification_logs', function ($table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->onDelete('cascade');
                $table->foreignId('notification_flow_id')->nullable()->constrained('notification_flows')->nullOnDelete();
                $table->foreignId('email_template_id')->nullable()->constrained('email_templates')->nullOnDelete();
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
     * Display the notification studio dashboard
     */
    public function index(Request $request)
    {
        // Ensure tables exist for this tenant
        $this->ensureTablesExist();
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

