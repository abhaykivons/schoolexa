<?php

namespace App\Http\Controllers\NotificationStudio;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\NotificationFlow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class NotificationFlowController extends Controller
{
    /**
     * Ensure required tables exist
     */
    private function ensureTablesExist(): void
    {
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
     * Display a listing of notification flows
     */
    public function index(Request $request)
    {
        $this->ensureTablesExist();
        
        $query = NotificationFlow::with('emailTemplate');

        // Filter by event category
        if ($request->filled('category')) {
            $events = collect(NotificationFlow::getTriggerEvents())
                ->filter(fn($event) => $event['category'] === $request->category)
                ->keys()
                ->toArray();
            $query->whereIn('trigger_event', $events);
        }

        // Filter by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('trigger_event', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $flows = $query->orderBy('priority', 'desc')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('modules/notification-studio/flows/index', [
            'flows' => $flows,
            'eventCategories' => NotificationFlow::getEventCategories(),
            'triggerEvents' => NotificationFlow::getTriggerEvents(),
            'recipientTypes' => NotificationFlow::getRecipientTypes(),
            'filters' => $request->only(['category', 'search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new flow
     */
    public function create()
    {
        $this->ensureTablesExist();
        
        $templates = EmailTemplate::active()->orderBy('name')->get();

        return Inertia::render('modules/notification-studio/flows/form', [
            'flow' => null,
            'templates' => $templates,
            'eventCategories' => NotificationFlow::getEventCategories(),
            'triggerEvents' => NotificationFlow::getTriggerEvents(),
            'recipientTypes' => NotificationFlow::getRecipientTypes(),
        ]);
    }

    /**
     * Store a newly created flow
     */
    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'trigger_event' => ['required', 'string'],
            'recipients' => ['required', 'array', 'min:1'],
            'custom_emails' => ['nullable', 'array'],
            'custom_emails.*' => ['email'],
            'send_email' => ['boolean'],
            'send_in_app' => ['boolean'],
            'send_sms' => ['boolean'],
            'email_template_id' => ['nullable', 'exists:email_templates,id'],
            'send_timing' => ['required', 'in:immediate,delayed,scheduled'],
            'delay_minutes' => ['nullable', 'integer', 'min:1'],
            'schedule_time' => ['nullable', 'string'],
            'conditions' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'priority' => ['integer', 'min:0', 'max:100'],
        ])->validate();

        NotificationFlow::create([
            ...$validated,
            'is_active' => $validated['is_active'] ?? true,
            'priority' => $validated['priority'] ?? 0,
        ]);

        return redirect()
            ->route('notification-studio.flows.index')
            ->with('success', 'Notification flow created successfully.');
    }

    /**
     * Show the form for editing a flow
     */
    public function edit(NotificationFlow $flow)
    {
        $templates = EmailTemplate::active()->orderBy('name')->get();

        return Inertia::render('modules/notification-studio/flows/form', [
            'flow' => $flow->load('emailTemplate'),
            'templates' => $templates,
            'eventCategories' => NotificationFlow::getEventCategories(),
            'triggerEvents' => NotificationFlow::getTriggerEvents(),
            'recipientTypes' => NotificationFlow::getRecipientTypes(),
        ]);
    }

    /**
     * Update the specified flow
     */
    public function update(Request $request, NotificationFlow $flow)
    {
        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'trigger_event' => ['required', 'string'],
            'recipients' => ['required', 'array', 'min:1'],
            'custom_emails' => ['nullable', 'array'],
            'custom_emails.*' => ['email'],
            'send_email' => ['boolean'],
            'send_in_app' => ['boolean'],
            'send_sms' => ['boolean'],
            'email_template_id' => ['nullable', 'exists:email_templates,id'],
            'send_timing' => ['required', 'in:immediate,delayed,scheduled'],
            'delay_minutes' => ['nullable', 'integer', 'min:1'],
            'schedule_time' => ['nullable', 'string'],
            'conditions' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'priority' => ['integer', 'min:0', 'max:100'],
        ])->validate();

        $flow->update($validated);

        return redirect()
            ->route('notification-studio.flows.index')
            ->with('success', 'Notification flow updated successfully.');
    }

    /**
     * Remove the specified flow
     */
    public function destroy(NotificationFlow $flow)
    {
        $flow->delete();

        return redirect()
            ->route('notification-studio.flows.index')
            ->with('success', 'Notification flow deleted successfully.');
    }

    /**
     * Toggle flow active status
     */
    public function toggleStatus(NotificationFlow $flow)
    {
        $flow->update([
            'is_active' => !$flow->is_active,
        ]);

        return redirect()
            ->back()
            ->with('success', 'Flow status updated successfully.');
    }

    /**
     * Duplicate a flow
     */
    public function duplicate(NotificationFlow $flow)
    {
        $newFlow = $flow->replicate();
        $newFlow->name = $flow->name . ' (Copy)';
        $newFlow->save();

        return redirect()
            ->route('notification-studio.flows.edit', $newFlow)
            ->with('success', 'Flow duplicated successfully.');
    }

    /**
     * Test a flow with sample data
     */
    public function test(Request $request, NotificationFlow $flow)
    {
        $request->validate([
            'test_email' => ['required', 'email'],
        ]);

        // Get sample variables for this event
        $triggerEvents = NotificationFlow::getTriggerEvents();
        $eventInfo = $triggerEvents[$flow->trigger_event] ?? null;

        if (!$eventInfo) {
            return response()->json(['error' => 'Invalid trigger event'], 400);
        }

        // Generate sample data
        $variables = $this->generateSampleData($eventInfo['variables']);

        // Get email template
        $template = $flow->emailTemplate;
        if (!$template && $flow->send_email) {
            return response()->json(['error' => 'No email template assigned'], 400);
        }

        try {
            if ($template) {
                $subject = $template->parseSubject($variables);
                $body = $template->parse($variables);

                // Send test email
                \Mail::html($body, function ($message) use ($request, $subject) {
                    $message->to($request->test_email)
                        ->subject('[TEST] ' . $subject);
                });
            }

            return response()->json([
                'success' => true,
                'message' => 'Test notification sent to ' . $request->test_email,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send test: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate sample data for testing
     */
    private function generateSampleData(array $variables): array
    {
        $sampleValues = [
            'parent_name' => 'John Doe',
            'parent_email' => 'john.doe@example.com',
            'student_name' => 'Jane Doe',
            'student_id' => 'STU-2024-001',
            'staff_name' => 'Mr. Smith',
            'email' => 'user@example.com',
            'password' => '********',
            'school_name' => config('app.name', 'School'),
            'login_url' => config('app.url') . '/login',
            'support_email' => config('mail.from.address', 'support@school.com'),
            'grade' => 'Grade 5',
            'class' => '5-A',
            'roll_number' => '25',
            'academic_year' => date('Y') . '-' . (date('Y') + 1),
            'previous_grade' => 'Grade 4',
            'new_grade' => 'Grade 5',
            'new_class' => '5-A',
            'department' => 'Science',
            'designation' => 'Teacher',
            'application_id' => 'APP-' . date('Y') . '-0042',
            'grade_applied' => 'Grade 5',
            'submission_date' => date('F j, Y'),
            'joining_date' => date('F j, Y'),
            'document_name' => 'Birth Certificate',
            'resubmit_link' => config('app.url') . '/resubmit',
            'next_steps' => 'Please complete the fee payment and submit remaining documents.',
            'reason' => 'Document is not clearly visible.',
            'approver_name' => 'Administrator',
            'requester_name' => 'Staff Member',
            'request_type' => 'Leave Request',
            'details' => 'Sample request details.',
            'approval_link' => config('app.url') . '/approve/123',
            'approved_by' => 'Principal',
            'approval_date' => date('F j, Y'),
            'rejected_by' => 'Administrator',
            'rejection_date' => date('F j, Y'),
            'comments' => 'Sample comments.',
            'recipient_name' => 'User',
            'announcement_title' => 'Sample Announcement',
            'announcement_body' => 'This is a sample announcement.',
            'reminder_title' => 'Sample Reminder',
            'reminder_body' => 'This is a sample reminder.',
            'due_date' => date('F j, Y', strtotime('+3 days')),
            'date' => date('F j, Y'),
            'reset_link' => config('app.url') . '/reset-password/token',
            'expiry_time' => '24 hours',
        ];

        $result = [];
        foreach ($variables as $variable) {
            $result[$variable] = $sampleValues[$variable] ?? "{{$variable}}";
        }

        return $result;
    }

    /**
     * Seed default notification flows
     */
    public function seedDefaults()
    {
        $this->ensureTablesExist();

        $defaultFlows = NotificationFlow::getDefaultFlows();
        $created = 0;

        foreach ($defaultFlows as $flowData) {
            // Check if flow with same trigger_event already exists
            $exists = NotificationFlow::where('trigger_event', $flowData['trigger_event'])->exists();
            
            if (!$exists) {
                // Try to find matching email template
                $template = EmailTemplate::where('event_type', $flowData['trigger_event'])->first();

                NotificationFlow::create([
                    ...$flowData,
                    'email_template_id' => $template?->id,
                    'send_in_app' => false,
                    'send_sms' => false,
                ]);
                $created++;
            }
        }

        $message = $created > 0 
            ? "{$created} default notification flows created successfully."
            : "All default notification flows already exist.";

        return redirect()
            ->back()
            ->with('success', $message);
    }

    /**
     * Get default flows data for frontend
     */
    public function getDefaults()
    {
        return response()->json(NotificationFlow::getDefaultFlows());
    }
}

