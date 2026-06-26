<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EmailTemplateController extends Controller
{
    /**
     * Display a listing of email templates
     */
    public function index(Request $request)
    {
        $query = EmailTemplate::query();

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('event_type', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $templates = $query->orderBy('category')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('modules/notification-studio/templates/index', [
            'templates' => $templates,
            'categories' => EmailTemplate::getCategories(),
            'eventTypes' => EmailTemplate::getEventTypes(),
            'filters' => $request->only(['category', 'search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new template
     */
    public function create(Request $request)
    {
        $eventType = $request->get('event_type');
        $defaultTemplate = $eventType ? EmailTemplate::getDefaultTemplate($eventType) : null;
        $eventTypes = EmailTemplate::getEventTypes();

        return Inertia::render('modules/notification-studio/templates/form', [
            'template' => null,
            'categories' => EmailTemplate::getCategories(),
            'eventTypes' => $eventTypes,
            'defaultTemplate' => $defaultTemplate,
            'selectedEventType' => $eventType,
        ]);
    }

    /**
     * Store a newly created template
     */
    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'category' => ['required', 'string', Rule::in(array_keys(EmailTemplate::getCategories()))],
            'event_type' => ['required', 'string'],
            'subject' => ['required', 'string', 'max:500'],
            'body' => ['required', 'string'],
            'from_name' => ['nullable', 'string', 'max:255'],
            'from_email' => ['nullable', 'email', 'max:255'],
            'reply_to' => ['nullable', 'email', 'max:255'],
            'cc' => ['nullable', 'string', 'max:500'],
            'bcc' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ])->validate();

        // Get available variables for this event type
        $eventTypes = EmailTemplate::getEventTypes();
        $availableVariables = $eventTypes[$validated['event_type']]['variables'] ?? [];

        $template = EmailTemplate::create([
            ...$validated,
            'slug' => Str::slug($validated['name']) . '-' . Str::random(6),
            'available_variables' => $availableVariables,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()
            ->route('notification-studio.templates.index')
            ->with('success', 'Email template created successfully.');
    }

    /**
     * Display the specified template
     */
    public function show(EmailTemplate $emailTemplate)
    {
        return Inertia::render('modules/notification-studio/templates/show', [
            'template' => $emailTemplate,
            'categories' => EmailTemplate::getCategories(),
            'eventTypes' => EmailTemplate::getEventTypes(),
        ]);
    }

    /**
     * Show the form for editing the template
     */
    public function edit(EmailTemplate $emailTemplate)
    {
        return Inertia::render('modules/notification-studio/templates/form', [
            'template' => $emailTemplate,
            'categories' => EmailTemplate::getCategories(),
            'eventTypes' => EmailTemplate::getEventTypes(),
            'defaultTemplate' => null,
            'selectedEventType' => $emailTemplate->event_type,
        ]);
    }

    /**
     * Update the specified template
     */
    public function update(Request $request, EmailTemplate $emailTemplate)
    {
        $validated = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'category' => ['required', 'string', Rule::in(array_keys(EmailTemplate::getCategories()))],
            'event_type' => ['required', 'string'],
            'subject' => ['required', 'string', 'max:500'],
            'body' => ['required', 'string'],
            'from_name' => ['nullable', 'string', 'max:255'],
            'from_email' => ['nullable', 'email', 'max:255'],
            'reply_to' => ['nullable', 'email', 'max:255'],
            'cc' => ['nullable', 'string', 'max:500'],
            'bcc' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ])->validate();

        // Get available variables for this event type
        $eventTypes = EmailTemplate::getEventTypes();
        $availableVariables = $eventTypes[$validated['event_type']]['variables'] ?? [];

        $emailTemplate->update([
            ...$validated,
            'available_variables' => $availableVariables,
        ]);

        return redirect()
            ->route('notification-studio.templates.index')
            ->with('success', 'Email template updated successfully.');
    }

    /**
     * Remove the specified template
     */
    public function destroy(EmailTemplate $emailTemplate)
    {
        if ($emailTemplate->is_default) {
            return redirect()
                ->back()
                ->with('error', 'Cannot delete a default template.');
        }

        $emailTemplate->delete();

        return redirect()
            ->route('notification-studio.templates.index')
            ->with('success', 'Email template deleted successfully.');
    }

    /**
     * Toggle template active status
     */
    public function toggleStatus(EmailTemplate $emailTemplate)
    {
        $emailTemplate->update([
            'is_active' => !$emailTemplate->is_active,
        ]);

        return redirect()
            ->back()
            ->with('success', 'Template status updated successfully.');
    }

    /**
     * Duplicate a template
     */
    public function duplicate(EmailTemplate $emailTemplate)
    {
        $newTemplate = $emailTemplate->replicate();
        $newTemplate->name = $emailTemplate->name . ' (Copy)';
        $newTemplate->slug = Str::slug($newTemplate->name) . '-' . Str::random(6);
        $newTemplate->is_default = false;
        $newTemplate->save();

        return redirect()
            ->route('notification-studio.templates.edit', $newTemplate)
            ->with('success', 'Template duplicated successfully.');
    }

    /**
     * Preview template with sample data
     */
    public function preview(Request $request, EmailTemplate $emailTemplate)
    {
        // Generate sample data based on available variables
        $sampleData = $this->generateSampleData($emailTemplate->available_variables ?? []);

        $parsedSubject = $emailTemplate->parseSubject($sampleData);
        $parsedBody = $emailTemplate->parse($sampleData);

        return response()->json([
            'subject' => $parsedSubject,
            'body' => $parsedBody,
            'sample_data' => $sampleData,
        ]);
    }

    /**
     * Get default template for an event type
     */
    public function getDefaultTemplate(Request $request)
    {
        $eventType = $request->get('event_type');
        
        if (!$eventType) {
            return response()->json(['error' => 'Event type is required'], 400);
        }

        $defaultTemplate = EmailTemplate::getDefaultTemplate($eventType);
        $eventTypes = EmailTemplate::getEventTypes();
        $eventInfo = $eventTypes[$eventType] ?? null;

        return response()->json([
            'template' => $defaultTemplate,
            'event_info' => $eventInfo,
        ]);
    }

    /**
     * Seed default templates for the company
     */
    public function seedDefaults()
    {
        $eventTypes = EmailTemplate::getEventTypes();
        $created = 0;

        foreach ($eventTypes as $eventType => $info) {
            $exists = EmailTemplate::where('event_type', $eventType)->exists();
            
            if (!$exists) {
                $defaultContent = EmailTemplate::getDefaultTemplate($eventType);
                
                if ($defaultContent) {
                    EmailTemplate::create([
                        'name' => $info['label'],
                        'slug' => Str::slug($info['label']) . '-' . Str::random(6),
                        'description' => $info['description'],
                        'category' => $info['category'],
                        'event_type' => $eventType,
                        'subject' => $defaultContent['subject'],
                        'body' => $defaultContent['body'],
                        'available_variables' => $info['variables'],
                        'is_active' => true,
                        'is_default' => true,
                    ]);
                    $created++;
                }
            }
        }

        return redirect()
            ->route('notification-studio.templates.index')
            ->with('success', "{$created} default templates created successfully.");
    }

    /**
     * Generate sample data for preview
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
            'school_name' => 'ABC International School',
            'login_url' => 'https://school.example.com/login',
            'support_email' => 'support@school.example.com',
            'grade' => 'Grade 5',
            'class' => '5-A',
            'roll_number' => '25',
            'academic_year' => '2024-2025',
            'department' => 'Science',
            'designation' => 'Teacher',
            'application_id' => 'APP-2024-0042',
            'grade_applied' => 'Grade 5',
            'submission_date' => date('F j, Y'),
            'joining_date' => date('F j, Y'),
            'reporting_to' => 'Principal John',
            'documents_needed' => 'Birth Certificate, Previous Report Card',
            'deadline' => date('F j, Y', strtotime('+7 days')),
            'upload_link' => 'https://school.example.com/upload',
            'next_steps' => 'Please complete the fee payment and submit remaining documents.',
            'reason' => 'All seats for the requested grade are currently filled.',
            'waitlist_position' => '3',
            'approver_name' => 'Administrator',
            'requester_name' => 'Staff Member',
            'request_type' => 'Leave Request',
            'details' => 'Requesting 3 days leave for personal reasons.',
            'approval_link' => 'https://school.example.com/approve/123',
            'approved_by' => 'Principal',
            'approval_date' => date('F j, Y'),
            'rejected_by' => 'Administrator',
            'rejection_date' => date('F j, Y'),
            'comments' => 'Approved. Please ensure handover is complete.',
            'recipient_name' => 'User',
            'announcement_title' => 'Important Announcement',
            'announcement_body' => 'This is a sample announcement content.',
            'reminder_title' => 'Reminder',
            'reminder_body' => 'This is a sample reminder content.',
            'due_date' => date('F j, Y', strtotime('+3 days')),
            'date' => date('F j, Y'),
            'reset_link' => 'https://school.example.com/reset-password/token123',
            'expiry_time' => '24 hours',
            'verification_link' => 'https://school.example.com/verify-email/token123',
        ];

        $result = [];
        foreach ($variables as $variable) {
            $result[$variable] = $sampleValues[$variable] ?? "{{$variable}}";
        }

        return $result;
    }
}

