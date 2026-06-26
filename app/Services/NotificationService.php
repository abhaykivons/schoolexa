<?php

namespace App\Services;

use App\Models\AdmissionDocument;
use App\Models\AdmissionForm;
use App\Models\EmailTemplate;
use App\Models\InAppNotification;
use App\Models\NotificationFlow;
use App\Models\NotificationLog;
use App\Models\StaffEnrollment;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class NotificationService
{
    /**
     * Trigger notifications for an event
     *
     * @param string $event The trigger event name
     * @param array $context Context data including the entity and variables
     * @return int Number of notifications queued/sent
     */
    public function trigger(string $event, array $context = []): int
    {
        $flows = NotificationFlow::getFlowsForEvent($event);
        $count = 0;

        foreach ($flows as $flow) {
            // Check conditions if any
            if (!$this->checkConditions($flow, $context)) {
                continue;
            }

            // Get recipients
            $recipients = $this->resolveRecipients($flow, $context);

            foreach ($recipients as $recipient) {
                $this->createAndSendNotification($flow, $recipient, $context);
                $count++;
            }
        }

        return $count;
    }

    /**
     * Check if flow conditions are met
     */
    protected function checkConditions(NotificationFlow $flow, array $context): bool
    {
        if (empty($flow->conditions)) {
            return true;
        }

        foreach ($flow->conditions as $field => $expectedValue) {
            $actualValue = data_get($context, $field) ?? data_get($context['entity'] ?? [], $field);
            
            if ($actualValue != $expectedValue) {
                return false;
            }
        }

        return true;
    }

    /**
     * Resolve recipients based on flow configuration
     */
    protected function resolveRecipients(NotificationFlow $flow, array $context): array
    {
        $recipients = [];

        foreach ($flow->recipients as $recipientType) {
            switch ($recipientType) {
                case 'parent':
                    $parentData = $this->resolveParent($context);
                    if ($parentData) {
                        $recipients[] = [
                            'type' => 'parent',
                            'email' => $parentData['email'],
                            'name' => $parentData['name'],
                            'user_id' => $parentData['user_id'] ?? null,
                        ];
                    }
                    break;

                case 'student':
                    $student = $this->resolveStudent($context);
                    if ($student && $student['email']) {
                        $recipients[] = [
                            'type' => 'student',
                            'email' => $student['email'],
                            'name' => $student['name'],
                            'user_id' => $student['user_id'] ?? null,
                        ];
                    }
                    break;

                case 'staff':
                    $staff = $this->resolveStaff($context);
                    if ($staff) {
                        $recipients[] = [
                            'type' => 'staff',
                            'email' => $staff['email'],
                            'name' => $staff['name'],
                            'user_id' => $staff['user_id'] ?? null,
                        ];
                    }
                    break;

                case 'approver':
                    $approver = $context['approver'] ?? null;
                    if ($approver) {
                        $recipients[] = [
                            'type' => 'approver',
                            'email' => $approver['email'],
                            'name' => $approver['name'],
                            'user_id' => $approver['user_id'] ?? null,
                        ];
                    }
                    break;

                case 'requester':
                    $requester = $context['requester'] ?? null;
                    if ($requester) {
                        $recipients[] = [
                            'type' => 'requester',
                            'email' => $requester['email'],
                            'name' => $requester['name'],
                            'user_id' => $requester['user_id'] ?? null,
                        ];
                    }
                    break;

                case 'admin':
                    // Get all admin users
                    $admins = User::where('type', 'admin')
                        ->where('company_id', auth()->user()?->company_id)
                        ->get();
                    foreach ($admins as $admin) {
                        $recipients[] = [
                            'type' => 'admin',
                            'email' => $admin->email,
                            'name' => $admin->name,
                            'user_id' => $admin->id,
                        ];
                    }
                    break;

                case 'custom':
                    // Add custom emails
                    if (!empty($flow->custom_emails)) {
                        foreach ($flow->custom_emails as $email) {
                            $recipients[] = [
                                'type' => 'custom',
                                'email' => $email,
                                'name' => null,
                                'user_id' => null,
                            ];
                        }
                    }
                    break;
            }
        }

        return $recipients;
    }

    /**
     * Resolve parent from context
     */
    protected function resolveParent(array $context): ?array
    {
        // Direct parent in context
        if (isset($context['parent'])) {
            return $context['parent'];
        }

        // From student
        if (isset($context['student'])) {
            $student = $context['student'];
            if ($student instanceof Student) {
                $parentUser = $student->parent;
                if ($parentUser) {
                    return [
                        'email' => $parentUser->email,
                        'name' => $parentUser->name,
                        'user_id' => $parentUser->id,
                    ];
                }
            }
        }

        // From enrollment
        if (isset($context['enrollment'])) {
            $enrollment = $context['enrollment'];
            if ($enrollment instanceof StudentEnrollment) {
                $student = $enrollment->student;
                if ($student && $student->parent) {
                    return [
                        'email' => $student->parent->email,
                        'name' => $student->parent->name,
                        'user_id' => $student->parent->id,
                    ];
                }
            }
        }

        return null;
    }

    /**
     * Resolve student from context
     */
    protected function resolveStudent(array $context): ?array
    {
        if (isset($context['student'])) {
            $student = $context['student'];
            if ($student instanceof Student) {
                return [
                    'email' => $student->user?->email,
                    'name' => $student->full_name,
                    'user_id' => $student->user_id,
                ];
            }
            return $student;
        }

        if (isset($context['enrollment'])) {
            $enrollment = $context['enrollment'];
            if ($enrollment instanceof StudentEnrollment) {
                $student = $enrollment->student;
                return [
                    'email' => $student->user?->email,
                    'name' => $student->full_name,
                    'user_id' => $student->user_id,
                ];
            }
        }

        return null;
    }

    /**
     * Resolve staff from context
     */
    protected function resolveStaff(array $context): ?array
    {
        if (isset($context['staff'])) {
            return $context['staff'];
        }

        return null;
    }

    /**
     * Create and send a notification
     */
    protected function createAndSendNotification(
        NotificationFlow $flow,
        array $recipient,
        array $context
    ): NotificationLog {
        // Prepare variables
        $variables = $this->prepareVariables($flow, $recipient, $context);

        // Get template - first try flow's assigned template, then fallback to find by event type
        $template = $flow->emailTemplate;
        
        if (!$template) {
            // Try to find a template that matches the trigger event
            $templateEventType = $this->mapTriggerEventToTemplate($flow->trigger_event);
            $template = EmailTemplate::where('event_type', $templateEventType)
                ->where('is_active', true)
                ->first();
        }

        // Parse content
        $subject = $template ? $template->parseSubject($variables) : '';
        $body = $template ? $template->parse($variables) : '';

        // Create log entry
        $log = NotificationLog::create([
            'company_id' => $flow->company_id,
            'notification_flow_id' => $flow->id,
            'email_template_id' => $template?->id,
            'trigger_event' => $flow->trigger_event,
            'trigger_entity_type' => $context['entity_type'] ?? null,
            'trigger_entity_id' => $context['entity_id'] ?? null,
            'recipient_type' => $recipient['type'],
            'recipient_email' => $recipient['email'],
            'recipient_name' => $recipient['name'],
            'recipient_user_id' => $recipient['user_id'],
            'email_sent' => false,
            'in_app_sent' => false,
            'sms_sent' => false,
            'subject' => $subject,
            'body' => $body,
            'status' => 'pending',
            'variables' => $variables,
            'scheduled_at' => $this->calculateScheduledTime($flow),
        ]);

        // Process based on timing
        if ($flow->send_timing === 'immediate') {
            $this->processLog($log);
        }

        return $log;
    }

    /**
     * Prepare variables for template
     */
    protected function prepareVariables(
        NotificationFlow $flow,
        array $recipient,
        array $context
    ): array {
        $variables = $context['variables'] ?? [];

        // Add common variables
        $variables['school_name'] = $variables['school_name'] ?? config('app.name');
        $variables['support_email'] = $variables['support_email'] ?? config('mail.from.address');
        $variables['login_url'] = $variables['login_url'] ?? config('app.url') . '/login';
        $variables['date'] = $variables['date'] ?? now()->format('F j, Y');

        // Add recipient-specific variables
        if ($recipient['type'] === 'parent') {
            $variables['parent_name'] = $recipient['name'] ?? $variables['parent_name'] ?? 'Parent';
            $variables['parent_email'] = $recipient['email'];
        }

        if ($recipient['type'] === 'student') {
            $variables['student_name'] = $recipient['name'] ?? $variables['student_name'] ?? 'Student';
        }

        if ($recipient['type'] === 'staff') {
            $variables['staff_name'] = $recipient['name'] ?? $variables['staff_name'] ?? 'Staff';
        }

        $variables['recipient_name'] = $recipient['name'] ?? 'User';

        return $variables;
    }

    /**
     * Calculate scheduled time for delayed/scheduled notifications
     */
    protected function calculateScheduledTime(NotificationFlow $flow): ?\DateTime
    {
        if ($flow->send_timing === 'immediate') {
            return null;
        }

        if ($flow->send_timing === 'delayed' && $flow->delay_minutes) {
            return now()->addMinutes($flow->delay_minutes);
        }

        if ($flow->send_timing === 'scheduled' && $flow->schedule_time) {
            $time = \Carbon\Carbon::parse($flow->schedule_time);
            if ($time->isPast()) {
                $time->addDay();
            }
            return $time;
        }

        return null;
    }

    /**
     * Process a notification log entry (send the actual notification)
     */
    public function processLog(NotificationLog $log): void
    {
        try {
            $flow = $log->notificationFlow;

            // Send email
            if ($flow && $flow->send_email && $log->body) {
                Mail::html($log->body, function ($message) use ($log, $flow) {
                    $message->to($log->recipient_email, $log->recipient_name)
                        ->subject($log->subject);

                    // Set from if specified in template
                    $template = $log->emailTemplate;
                    if ($template && $template->from_email) {
                        $message->from($template->from_email, $template->from_name);
                    }

                    // Add CC/BCC from template
                    if ($template && $template->cc) {
                        $message->cc(array_filter(array_map('trim', explode(',', $template->cc))));
                    }
                    if ($template && $template->bcc) {
                        $message->bcc(array_filter(array_map('trim', explode(',', $template->bcc))));
                    }
                });

                $log->update(['email_sent' => true]);
            }

            // Send in-app notification
            if ($flow && $flow->send_in_app && $log->recipient_user_id) {
                $this->createInAppNotification($log);
                $log->update(['in_app_sent' => true]);
            }

            // Mark as sent
            $log->markAsSent();

            Log::info('Notification sent', [
                'log_id' => $log->id,
                'event' => $log->trigger_event,
                'recipient' => $log->recipient_email,
            ]);

        } catch (\Exception $e) {
            $log->markAsFailed($e->getMessage());

            Log::error('Notification failed', [
                'log_id' => $log->id,
                'event' => $log->trigger_event,
                'recipient' => $log->recipient_email,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create in-app notification from log
     */
    protected function createInAppNotification(NotificationLog $log): void
    {
        // Ensure table exists
        if (!Schema::hasTable('in_app_notifications')) {
            return;
        }

        // Get event info for better display
        $triggerEvents = NotificationFlow::getTriggerEvents();
        $eventInfo = $triggerEvents[$log->trigger_event] ?? null;

        // Determine notification type based on event
        $type = 'info';
        if (str_contains($log->trigger_event, 'approved') || str_contains($log->trigger_event, 'success')) {
            $type = 'success';
        } elseif (str_contains($log->trigger_event, 'rejected') || str_contains($log->trigger_event, 'failed')) {
            $type = 'error';
        } elseif (str_contains($log->trigger_event, 'pending') || str_contains($log->trigger_event, 'required')) {
            $type = 'warning';
        }

        InAppNotification::create([
            'company_id' => $log->company_id,
            'user_id' => $log->recipient_user_id,
            'title' => $log->subject ?: ($eventInfo['label'] ?? 'New Notification'),
            'message' => strip_tags($log->body ?? ($eventInfo['description'] ?? 'You have a new notification')),
            'type' => $type,
            'notification_log_id' => $log->id,
            'trigger_event' => $log->trigger_event,
            'notifiable_type' => $log->trigger_entity_type,
            'notifiable_id' => $log->trigger_entity_id,
        ]);
    }

    /**
     * Process pending scheduled notifications
     */
    public function processScheduledNotifications(): int
    {
        $logs = NotificationLog::pending()
            ->where('scheduled_at', '<=', now())
            ->get();

        foreach ($logs as $log) {
            $this->processLog($log);
        }

        return $logs->count();
    }

    /**
     * Helper: Trigger student enrolled notification
     */
    public static function studentEnrolled(Student $student, StudentEnrollment $enrollment, ?string $password = null): int
    {
        $service = app(self::class);

        // Send direct in-app notification to parent
        $parentUser = $student->parent;
        if ($parentUser) {
            $message = "{$student->full_name} has been successfully enrolled in {$enrollment->grade?->name} - {$enrollment->schoolClass?->name}.";
            if ($enrollment->roll_number) {
                $message .= " Roll Number: {$enrollment->roll_number}.";
            }

            $service->sendInAppNotification(
                $parentUser->id,
                'Student Enrolled Successfully!',
                $message,
                'success',
                [
                    'trigger_event' => 'student_enrolled',
                    'notifiable_type' => StudentEnrollment::class,
                    'notifiable_id' => $enrollment->id,
                ]
            );
        }

        return $service->trigger('student_enrolled', [
            'student' => $student,
            'enrollment' => $enrollment,
            'parent' => $parentUser ? [
                'email' => $parentUser->email,
                'name' => $parentUser->name,
                'user_id' => $parentUser->id,
            ] : null,
            'entity_type' => StudentEnrollment::class,
            'entity_id' => $enrollment->id,
            'variables' => [
                'student_name' => $student->full_name,
                'student_id' => $student->student_id,
                'parent_name' => $parentUser?->name ?? 'Parent',
                'grade' => $enrollment->grade?->name,
                'class' => $enrollment->schoolClass?->name,
                'roll_number' => $enrollment->roll_number,
                'academic_year' => $enrollment->academicYear?->name,
                'password' => $password,
            ],
        ]);
    }

    /**
     * Helper: Trigger admission approved notification
     */
    public static function admissionApproved(Student $student, array $additionalVars = []): int
    {
        $service = app(self::class);

        // Send direct in-app notification to parent
        $parentUser = $student->parent;
        if ($parentUser) {
            $service->sendInAppNotification(
                $parentUser->id,
                'Admission Approved!',
                "Great news! The admission for {$student->full_name} has been approved. Please proceed with the enrollment process.",
                'success',
                [
                    'trigger_event' => 'admission_approved',
                    'notifiable_type' => Student::class,
                    'notifiable_id' => $student->id,
                ]
            );
        }

        return $service->trigger('admission_approved', [
            'student' => $student,
            'parent' => $parentUser ? [
                'email' => $parentUser->email,
                'name' => $parentUser->name,
                'user_id' => $parentUser->id,
            ] : null,
            'entity_type' => Student::class,
            'entity_id' => $student->id,
            'variables' => array_merge([
                'student_name' => $student->full_name,
                'parent_name' => $parentUser?->name ?? 'Parent',
            ], $additionalVars),
        ]);
    }

    /**
     * Helper: Trigger admission rejected notification
     */
    public static function admissionRejected(Student $student, string $reason): int
    {
        $service = app(self::class);

        // Send direct in-app notification to parent
        $parentUser = $student->parent;
        if ($parentUser) {
            $service->sendInAppNotification(
                $parentUser->id,
                'Admission Status Update',
                "The admission for {$student->full_name} was not approved. Reason: {$reason}",
                'error',
                [
                    'trigger_event' => 'admission_rejected',
                    'notifiable_type' => Student::class,
                    'notifiable_id' => $student->id,
                ]
            );
        }

        return $service->trigger('admission_rejected', [
            'student' => $student,
            'parent' => $parentUser ? [
                'email' => $parentUser->email,
                'name' => $parentUser->name,
                'user_id' => $parentUser->id,
            ] : null,
            'entity_type' => Student::class,
            'entity_id' => $student->id,
            'variables' => [
                'student_name' => $student->full_name,
                'parent_name' => $parentUser?->name ?? 'Parent',
                'reason' => $reason,
            ],
        ]);
    }

    /**
     * Helper: Trigger parent registered notification
     */
    public static function parentRegistered(User $parent): int
    {
        $service = app(self::class);

        // Always send an in-app notification for parent registration
        $service->sendInAppNotification(
            $parent->id,
            'Welcome to ' . config('app.name', 'School'),
            'Your account has been successfully created. You can now access all features.',
            'success',
            ['trigger_event' => 'parent_registered']
        );

        return $service->trigger('parent_registered', [
            'parent' => [
                'email' => $parent->email,
                'name' => $parent->name,
                'user_id' => $parent->id,
            ],
            'entity_type' => User::class,
            'entity_id' => $parent->id,
            'variables' => [
                'parent_name' => $parent->name,
                'parent_email' => $parent->email,
            ],
        ]);
    }

    /**
     * Send a direct in-app notification to a user
     */
    public function sendInAppNotification(
        int $userId,
        string $title,
        string $message,
        string $type = 'info',
        array $options = []
    ): ?InAppNotification {
        // Ensure table exists
        if (!Schema::hasTable('in_app_notifications')) {
            return null;
        }

        $user = User::find($userId);
        if (!$user) {
            return null;
        }

        return InAppNotification::create([
            'company_id' => $user->company_id,
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'icon' => $options['icon'] ?? null,
            'action_url' => $options['action_url'] ?? null,
            'action_text' => $options['action_text'] ?? null,
            'notifiable_type' => $options['notifiable_type'] ?? null,
            'notifiable_id' => $options['notifiable_id'] ?? null,
            'trigger_event' => $options['trigger_event'] ?? null,
        ]);
    }

    /**
     * Helper: Send notification to user
     */
    public static function notifyUser(
        int $userId,
        string $title,
        string $message,
        string $type = 'info',
        array $options = []
    ): ?InAppNotification {
        $service = app(self::class);
        return $service->sendInAppNotification($userId, $title, $message, $type, $options);
    }

    /**
     * Helper: Trigger student promoted notification
     */
    public static function studentPromoted(
        Student $student,
        StudentEnrollment $newEnrollment,
        ?StudentEnrollment $previousEnrollment = null
    ): int {
        $service = app(self::class);

        // Send in-app notification to parent
        $parentUser = $student->parent;
        if ($parentUser) {
            $service->sendInAppNotification(
                $parentUser->id,
                'Student Promoted!',
                "{$student->full_name} has been promoted to {$newEnrollment->grade?->name}.",
                'success',
                ['trigger_event' => 'student_promoted']
            );
        }

        return $service->trigger('student_promoted', [
            'student' => $student,
            'enrollment' => $newEnrollment,
            'parent' => $parentUser ? [
                'email' => $parentUser->email,
                'name' => $parentUser->name,
                'user_id' => $parentUser->id,
            ] : null,
            'entity_type' => StudentEnrollment::class,
            'entity_id' => $newEnrollment->id,
            'variables' => [
                'student_name' => $student->full_name,
                'parent_name' => $parentUser?->name ?? 'Parent',
                'previous_grade' => $previousEnrollment?->grade?->name ?? 'N/A',
                'new_grade' => $newEnrollment->grade?->name,
                'new_class' => $newEnrollment->schoolClass?->name,
                'academic_year' => $newEnrollment->academicYear?->name,
            ],
        ]);
    }

    /**
     * Helper: Trigger admission form submitted notification
     */
    public static function admissionFormSubmitted(AdmissionForm $form): int
    {
        $service = app(self::class);
        $student = $form->student;
        $parent = $student?->parent;

        // Send in-app notification to parent
        if ($parent) {
            $service->sendInAppNotification(
                $parent->id,
                'Admission Form Submitted',
                "Your admission form for {$student->full_name} has been received and is under review.",
                'info',
                ['trigger_event' => 'admission_form_submitted']
            );
        }

        return $service->trigger('admission_form_submitted', [
            'student' => $student,
            'parent' => $parent ? [
                'email' => $parent->email,
                'name' => $parent->name,
                'user_id' => $parent->id,
            ] : null,
            'entity_type' => AdmissionForm::class,
            'entity_id' => $form->id,
            'variables' => [
                'student_name' => $student?->full_name ?? 'Student',
                'parent_name' => $parent?->name ?? 'Parent',
                'application_id' => 'APP-' . date('Y') . '-' . str_pad($form->id, 4, '0', STR_PAD_LEFT),
                'grade_applied' => $student?->grade?->name ?? 'N/A',
                'submission_date' => $form->created_at?->format('F j, Y'),
            ],
        ]);
    }

    /**
     * Helper: Trigger document approved notification
     */
    public static function documentApproved(AdmissionDocument $document): int
    {
        $service = app(self::class);
        $student = $document->student;
        $parent = $student?->parent;

        // Send in-app notification to parent
        if ($parent) {
            $service->sendInAppNotification(
                $parent->id,
                'Document Approved',
                "Your submitted document '{$document->document_type}' for {$student->full_name} has been approved.",
                'success',
                ['trigger_event' => 'document_approved']
            );
        }

        return $service->trigger('document_approved', [
            'student' => $student,
            'parent' => $parent ? [
                'email' => $parent->email,
                'name' => $parent->name,
                'user_id' => $parent->id,
            ] : null,
            'entity_type' => AdmissionDocument::class,
            'entity_id' => $document->id,
            'variables' => [
                'student_name' => $student?->full_name ?? 'Student',
                'parent_name' => $parent?->name ?? 'Parent',
                'document_name' => $document->document_type ?? 'Document',
            ],
        ]);
    }

    /**
     * Helper: Trigger document rejected notification
     */
    public static function documentRejected(AdmissionDocument $document, string $reason): int
    {
        $service = app(self::class);
        $student = $document->student;
        $parent = $student?->parent;

        // Send in-app notification to parent
        if ($parent) {
            $service->sendInAppNotification(
                $parent->id,
                'Document Rejected',
                "Your document '{$document->document_type}' needs to be resubmitted. Reason: {$reason}",
                'error',
                ['trigger_event' => 'document_rejected']
            );
        }

        return $service->trigger('document_rejected', [
            'student' => $student,
            'parent' => $parent ? [
                'email' => $parent->email,
                'name' => $parent->name,
                'user_id' => $parent->id,
            ] : null,
            'entity_type' => AdmissionDocument::class,
            'entity_id' => $document->id,
            'variables' => [
                'student_name' => $student?->full_name ?? 'Student',
                'parent_name' => $parent?->name ?? 'Parent',
                'document_name' => $document->document_type ?? 'Document',
                'reason' => $reason,
                'resubmit_link' => config('app.url') . '/parent/admission',
            ],
        ]);
    }

    /**
     * Helper: Trigger staff account created notification
     */
    public static function staffAccountCreated(User $staffUser, ?string $password = null): int
    {
        $service = app(self::class);

        // Try to get additional info from Staff/Enrollment records
        $staffRecord = \App\Models\Staff::where('user_id', $staffUser->id)->first();
        $enrollment = $staffRecord?->enrollment;
        $department = $staffRecord?->department?->name ?? $enrollment?->department ?? 'N/A';
        $designation = $staffRecord?->designation?->name ?? $enrollment?->position_title ?? 'N/A';

        // Send in-app notification to staff
        $service->sendInAppNotification(
            $staffUser->id,
            'Welcome to ' . config('app.name', 'School') . '!',
            'Your staff account has been successfully created. You can now log in and access all features.',
            'success',
            [
                'trigger_event' => 'staff_account_created',
                'action_url' => config('app.url') . '/login',
                'action_text' => 'Login Now',
            ]
        );

        return $service->trigger('staff_account_created', [
            'staff' => [
                'email' => $staffUser->email,
                'name' => $staffUser->name,
                'user_id' => $staffUser->id,
            ],
            'entity_type' => User::class,
            'entity_id' => $staffUser->id,
            'variables' => [
                'staff_name' => $staffUser->name,
                'email' => $staffUser->email,
                'password' => $password ?? '********',
                'login_url' => config('app.url') . '/login',
                'department' => $department,
                'designation' => $designation,
            ],
        ]);
    }

    /**
     * Helper: Trigger staff enrollment approved notification
     */
    public static function staffEnrollmentApproved(StaffEnrollment $enrollment): int
    {
        $service = app(self::class);

        // Get staff info from enrollment
        $staffEmail = $enrollment->email_address ?? $enrollment->personal_email;
        $staffName = $enrollment->full_legal_name ?? ($enrollment->first_name . ' ' . $enrollment->last_name);

        // Check if there's already a Staff record with a User (account created)
        $staff = \App\Models\Staff::where('enrollment_id', $enrollment->id)->first();
        $userId = $staff?->user_id;

        // Send in-app notification if user account exists
        if ($userId) {
            $service->sendInAppNotification(
                $userId,
                'Enrollment Approved!',
                'Congratulations! Your staff enrollment application has been approved.',
                'success',
                [
                    'trigger_event' => 'staff_enrollment_approved',
                    'notifiable_type' => StaffEnrollment::class,
                    'notifiable_id' => $enrollment->id,
                ]
            );
        }

        return $service->trigger('staff_enrollment_approved', [
            'staff' => [
                'email' => $staffEmail,
                'name' => $staffName,
                'user_id' => $userId,
            ],
            'entity_type' => StaffEnrollment::class,
            'entity_id' => $enrollment->id,
            'variables' => [
                'staff_name' => $staffName,
                'email' => $staffEmail,
                'department' => $enrollment->department ?? 'N/A',
                'designation' => $enrollment->designation ?? $enrollment->position_title ?? 'N/A',
                'joining_date' => $enrollment->enrollment_date ?? date('F j, Y'),
            ],
        ]);
    }

    /**
     * Helper: Trigger staff enrollment rejected notification
     */
    public static function staffEnrollmentRejected(StaffEnrollment $enrollment, ?string $reason = null): int
    {
        $service = app(self::class);

        // Get staff info from enrollment
        $staffEmail = $enrollment->email_address ?? $enrollment->personal_email;
        $staffName = $enrollment->full_legal_name ?? ($enrollment->first_name . ' ' . $enrollment->last_name);

        // Check if there's already a Staff record with a User
        $staff = \App\Models\Staff::where('enrollment_id', $enrollment->id)->first();
        $userId = $staff?->user_id;

        // Send in-app notification if user account exists
        if ($userId) {
            $service->sendInAppNotification(
                $userId,
                'Enrollment Status Update',
                'Your staff enrollment application was not approved. ' . ($reason ?? 'Please contact administration for details.'),
                'error',
                [
                    'trigger_event' => 'staff_enrollment_rejected',
                    'notifiable_type' => StaffEnrollment::class,
                    'notifiable_id' => $enrollment->id,
                ]
            );
        }

        return $service->trigger('staff_enrollment_rejected', [
            'staff' => [
                'email' => $staffEmail,
                'name' => $staffName,
                'user_id' => $userId,
            ],
            'entity_type' => StaffEnrollment::class,
            'entity_id' => $enrollment->id,
            'variables' => [
                'staff_name' => $staffName,
                'email' => $staffEmail,
                'reason' => $reason ?? 'Please contact administration for more details.',
            ],
        ]);
    }

    /**
     * Helper: Trigger approval required notification
     */
    public static function approvalRequired(
        User $approver,
        string $requestType,
        string $details,
        ?string $approvalLink = null
    ): int {
        $service = app(self::class);

        // Send in-app notification to approver
        $service->sendInAppNotification(
            $approver->id,
            'Approval Required',
            "A new {$requestType} requires your approval.",
            'warning',
            [
                'trigger_event' => 'approval_required',
                'action_url' => $approvalLink,
            ]
        );

        return $service->trigger('approval_required', [
            'approver' => [
                'email' => $approver->email,
                'name' => $approver->name,
                'user_id' => $approver->id,
            ],
            'entity_type' => User::class,
            'entity_id' => $approver->id,
            'variables' => [
                'approver_name' => $approver->name,
                'request_type' => $requestType,
                'details' => $details,
                'approval_link' => $approvalLink ?? config('app.url') . '/dashboard',
            ],
        ]);
    }

    /**
     * Helper: Trigger request approved notification
     */
    public static function requestApproved(
        User $requester,
        string $requestType,
        string $approvedBy,
        ?string $comments = null
    ): int {
        $service = app(self::class);

        // Send in-app notification to requester
        $service->sendInAppNotification(
            $requester->id,
            'Request Approved',
            "Your {$requestType} has been approved by {$approvedBy}.",
            'success',
            ['trigger_event' => 'request_approved']
        );

        return $service->trigger('request_approved', [
            'requester' => [
                'email' => $requester->email,
                'name' => $requester->name,
                'user_id' => $requester->id,
            ],
            'entity_type' => User::class,
            'entity_id' => $requester->id,
            'variables' => [
                'requester_name' => $requester->name,
                'request_type' => $requestType,
                'approved_by' => $approvedBy,
                'approval_date' => now()->format('F j, Y'),
                'comments' => $comments ?? '',
            ],
        ]);
    }

    /**
     * Helper: Trigger request rejected notification
     */
    public static function requestRejected(
        User $requester,
        string $requestType,
        string $rejectedBy,
        string $reason
    ): int {
        $service = app(self::class);

        // Send in-app notification to requester
        $service->sendInAppNotification(
            $requester->id,
            'Request Rejected',
            "Your {$requestType} has been rejected. Reason: {$reason}",
            'error',
            ['trigger_event' => 'request_rejected']
        );

        return $service->trigger('request_rejected', [
            'requester' => [
                'email' => $requester->email,
                'name' => $requester->name,
                'user_id' => $requester->id,
            ],
            'entity_type' => User::class,
            'entity_id' => $requester->id,
            'variables' => [
                'requester_name' => $requester->name,
                'request_type' => $requestType,
                'rejected_by' => $rejectedBy,
                'rejection_date' => now()->format('F j, Y'),
                'reason' => $reason,
            ],
        ]);
    }

    /**
     * Helper: Trigger staff enrollment submitted notification
     */
    public static function staffEnrollmentSubmitted(StaffEnrollment $enrollment): int
    {
        $service = app(self::class);

        $staffEmail = $enrollment->email_address ?? $enrollment->personal_email;
        $staffName = $enrollment->full_legal_name ?? ($enrollment->first_name . ' ' . $enrollment->last_name);
        $applicationId = 'STAFF-' . date('Y') . '-' . str_pad($enrollment->id, 4, '0', STR_PAD_LEFT);

        return $service->trigger('staff_enrollment_submitted', [
            'staff' => [
                'email' => $staffEmail,
                'name' => $staffName,
                'user_id' => null,
            ],
            'entity_type' => StaffEnrollment::class,
            'entity_id' => $enrollment->id,
            'variables' => [
                'staff_name' => $staffName,
                'email' => $staffEmail,
                'application_id' => $applicationId,
                'position_applied' => $enrollment->position_title ?? $enrollment->designation ?? 'N/A',
                'submission_date' => $enrollment->created_at?->format('F j, Y') ?? date('F j, Y'),
            ],
        ]);
    }

    /**
     * Helper: Trigger staff onboarding notification
     */
    public static function staffOnboarding(
        User $staffUser,
        array $onboardingDetails = []
    ): int {
        $service = app(self::class);

        // Get staff details
        $staffRecord = \App\Models\Staff::where('user_id', $staffUser->id)->first();
        $enrollment = $staffRecord?->enrollment;

        $department = $staffRecord?->department?->name ?? $enrollment?->department ?? 'N/A';
        $designation = $staffRecord?->designation?->name ?? $enrollment?->position_title ?? 'N/A';
        $joiningDate = $enrollment?->enrollment_date ?? date('F j, Y');
        $reportingTo = $onboardingDetails['reporting_to'] ?? 'HR Department';
        $orientationDate = $onboardingDetails['orientation_date'] ?? 'TBD';
        
        $checklistItems = $onboardingDetails['checklist_items'] ?? '<ul>
<li>Complete HR documentation</li>
<li>Set up your workstation</li>
<li>Complete IT setup (email, systems access)</li>
<li>Review employee handbook</li>
<li>Complete mandatory training modules</li>
</ul>';

        // Send in-app notification
        $service->sendInAppNotification(
            $staffUser->id,
            'Welcome! Complete Your Onboarding',
            'Please review your onboarding checklist and complete all required tasks.',
            'info',
            [
                'trigger_event' => 'staff_onboarding',
                'action_url' => config('app.url') . '/dashboard',
                'action_text' => 'View Checklist',
            ]
        );

        return $service->trigger('staff_onboarding', [
            'staff' => [
                'email' => $staffUser->email,
                'name' => $staffUser->name,
                'user_id' => $staffUser->id,
            ],
            'entity_type' => User::class,
            'entity_id' => $staffUser->id,
            'variables' => [
                'staff_name' => $staffUser->name,
                'department' => $department,
                'designation' => $designation,
                'joining_date' => $joiningDate,
                'reporting_to' => $reportingTo,
                'orientation_date' => $orientationDate,
                'checklist_items' => $checklistItems,
            ],
        ]);
    }

    /**
     * Helper: Trigger admission waitlisted notification
     */
    public static function admissionWaitlisted(
        Student $student,
        int $waitlistPosition,
        ?string $expectedUpdate = null
    ): int {
        $service = app(self::class);
        $parentUser = $student->parent;

        // Send in-app notification to parent
        if ($parentUser) {
            $service->sendInAppNotification(
                $parentUser->id,
                'Admission Status: Waitlisted',
                "{$student->full_name} has been placed on our waitlist (Position #{$waitlistPosition}). We will notify you when a seat becomes available.",
                'warning',
                [
                    'trigger_event' => 'admission_waitlisted',
                    'notifiable_type' => Student::class,
                    'notifiable_id' => $student->id,
                ]
            );
        }

        return $service->trigger('admission_waitlisted', [
            'student' => $student,
            'parent' => $parentUser ? [
                'email' => $parentUser->email,
                'name' => $parentUser->name,
                'user_id' => $parentUser->id,
            ] : null,
            'entity_type' => Student::class,
            'entity_id' => $student->id,
            'variables' => [
                'student_name' => $student->full_name,
                'parent_name' => $parentUser?->name ?? 'Parent',
                'waitlist_position' => $waitlistPosition,
                'expected_update' => $expectedUpdate ?? 'within 2-4 weeks',
            ],
        ]);
    }

    /**
     * Helper: Trigger fee payment reminder notification
     */
    public static function feePaymentReminder(
        Student $student,
        string $feeType,
        string $amount,
        string $dueDate,
        ?string $paymentLink = null
    ): int {
        $service = app(self::class);
        $parentUser = $student->parent;

        // Send in-app notification to parent
        if ($parentUser) {
            $service->sendInAppNotification(
                $parentUser->id,
                'Fee Payment Reminder',
                "Reminder: {$feeType} payment of {$amount} for {$student->full_name} is due on {$dueDate}.",
                'warning',
                [
                    'trigger_event' => 'fee_payment_reminder',
                    'action_url' => $paymentLink,
                    'action_text' => 'Pay Now',
                ]
            );
        }

        return $service->trigger('fee_payment_reminder', [
            'student' => $student,
            'parent' => $parentUser ? [
                'email' => $parentUser->email,
                'name' => $parentUser->name,
                'user_id' => $parentUser->id,
            ] : null,
            'entity_type' => Student::class,
            'entity_id' => $student->id,
            'variables' => [
                'student_name' => $student->full_name,
                'parent_name' => $parentUser?->name ?? 'Parent',
                'fee_type' => $feeType,
                'amount' => $amount,
                'due_date' => $dueDate,
                'payment_link' => $paymentLink ?? config('app.url') . '/parent/fees',
            ],
        ]);
    }

    /**
     * Helper: Trigger fee payment received notification
     */
    public static function feePaymentReceived(
        Student $student,
        string $feeType,
        string $amount,
        string $receiptNumber
    ): int {
        $service = app(self::class);
        $parentUser = $student->parent;

        // Send in-app notification to parent
        if ($parentUser) {
            $service->sendInAppNotification(
                $parentUser->id,
                'Payment Received',
                "Thank you! Payment of {$amount} for {$feeType} has been received. Receipt: {$receiptNumber}",
                'success',
                ['trigger_event' => 'fee_payment_received']
            );
        }

        return $service->trigger('fee_payment_received', [
            'student' => $student,
            'parent' => $parentUser ? [
                'email' => $parentUser->email,
                'name' => $parentUser->name,
                'user_id' => $parentUser->id,
            ] : null,
            'entity_type' => Student::class,
            'entity_id' => $student->id,
            'variables' => [
                'student_name' => $student->full_name,
                'parent_name' => $parentUser?->name ?? 'Parent',
                'fee_type' => $feeType,
                'amount' => $amount,
                'payment_date' => now()->format('F j, Y'),
                'receipt_number' => $receiptNumber,
            ],
        ]);
    }

    /**
     * Helper: Trigger fee overdue notification
     */
    public static function feeOverdue(
        Student $student,
        string $feeType,
        string $amount,
        int $daysOverdue,
        string $lateFee = '0',
        ?string $paymentLink = null
    ): int {
        $service = app(self::class);
        $parentUser = $student->parent;

        // Send in-app notification to parent
        if ($parentUser) {
            $service->sendInAppNotification(
                $parentUser->id,
                'OVERDUE: Fee Payment Required',
                "Important: {$feeType} payment of {$amount} for {$student->full_name} is {$daysOverdue} days overdue.",
                'error',
                [
                    'trigger_event' => 'fee_overdue',
                    'action_url' => $paymentLink,
                    'action_text' => 'Pay Now',
                ]
            );
        }

        return $service->trigger('fee_overdue', [
            'student' => $student,
            'parent' => $parentUser ? [
                'email' => $parentUser->email,
                'name' => $parentUser->name,
                'user_id' => $parentUser->id,
            ] : null,
            'entity_type' => Student::class,
            'entity_id' => $student->id,
            'variables' => [
                'student_name' => $student->full_name,
                'parent_name' => $parentUser?->name ?? 'Parent',
                'fee_type' => $feeType,
                'amount' => $amount,
                'days_overdue' => $daysOverdue,
                'late_fee' => $lateFee,
                'payment_link' => $paymentLink ?? config('app.url') . '/parent/fees',
            ],
        ]);
    }

    /**
     * Helper: Trigger event invitation notification
     */
    public static function eventInvitation(
        array $recipients,
        string $eventName,
        string $eventDate,
        string $eventTime,
        string $eventLocation,
        string $eventDescription,
        ?string $rsvpLink = null
    ): int {
        $service = app(self::class);
        $count = 0;

        foreach ($recipients as $recipient) {
            if (isset($recipient['user_id'])) {
                $service->sendInAppNotification(
                    $recipient['user_id'],
                    "You're Invited: {$eventName}",
                    "Join us on {$eventDate} at {$eventTime}. Location: {$eventLocation}",
                    'info',
                    [
                        'trigger_event' => 'event_invitation',
                        'action_url' => $rsvpLink,
                        'action_text' => 'RSVP',
                    ]
                );
            }

            $count += $service->trigger('event_invitation', [
                'parent' => $recipient['type'] === 'parent' ? $recipient : null,
                'staff' => $recipient['type'] === 'staff' ? $recipient : null,
                'entity_type' => 'Event',
                'variables' => [
                    'recipient_name' => $recipient['name'] ?? 'User',
                    'event_name' => $eventName,
                    'event_date' => $eventDate,
                    'event_time' => $eventTime,
                    'event_location' => $eventLocation,
                    'event_description' => $eventDescription,
                    'rsvp_link' => $rsvpLink ?? config('app.url') . '/events',
                ],
            ]);
        }

        return $count;
    }

    /**
     * Helper: Trigger event reminder notification
     */
    public static function eventReminder(
        array $recipients,
        string $eventName,
        string $eventDate,
        string $eventTime,
        string $eventLocation
    ): int {
        $service = app(self::class);
        $count = 0;

        foreach ($recipients as $recipient) {
            if (isset($recipient['user_id'])) {
                $service->sendInAppNotification(
                    $recipient['user_id'],
                    "Reminder: {$eventName}",
                    "Don't forget! {$eventName} is happening on {$eventDate} at {$eventTime}.",
                    'info',
                    ['trigger_event' => 'event_reminder']
                );
            }

            $count += $service->trigger('event_reminder', [
                'parent' => $recipient['type'] === 'parent' ? $recipient : null,
                'staff' => $recipient['type'] === 'staff' ? $recipient : null,
                'entity_type' => 'Event',
                'variables' => [
                    'recipient_name' => $recipient['name'] ?? 'User',
                    'event_name' => $eventName,
                    'event_date' => $eventDate,
                    'event_time' => $eventTime,
                    'event_location' => $eventLocation,
                ],
            ]);
        }

        return $count;
    }

    /**
     * Map trigger event to email template event type
     */
    protected function mapTriggerEventToTemplate(string $triggerEvent): string
    {
        $mapping = [
            'student_enrolled' => 'student_enrollment_complete',
            'student_promoted' => 'student_promoted',
            'admission_form_submitted' => 'admission_form_submitted',
            'admission_approved' => 'admission_approved',
            'admission_rejected' => 'admission_rejected',
            'admission_waitlisted' => 'admission_waitlisted',
            'document_approved' => 'document_approved',
            'document_rejected' => 'document_rejected',
            'document_request' => 'enrollment_document_request',
            'parent_registered' => 'parent_welcome',
            'parent_password_reset' => 'parent_password_reset',
            'parent_email_verification' => 'parent_email_verification',
            'staff_account_created' => 'staff_welcome',
            'staff_enrollment_submitted' => 'staff_enrollment_submitted',
            'staff_enrollment_approved' => 'staff_enrollment_approved',
            'staff_enrollment_rejected' => 'staff_enrollment_rejected',
            'staff_onboarding' => 'staff_onboarding',
            'staff_password_reset' => 'staff_password_reset',
            'approval_required' => 'approval_pending',
            'request_approved' => 'approval_approved',
            'request_rejected' => 'approval_rejected',
            'fee_payment_reminder' => 'fee_payment_reminder',
            'fee_payment_received' => 'fee_payment_confirmation',
            'fee_overdue' => 'fee_overdue_notice',
            'event_invitation' => 'event_invitation',
            'event_reminder' => 'event_reminder',
            'announcement' => 'general_announcement',
            'reminder' => 'reminder',
        ];

        return $mapping[$triggerEvent] ?? $triggerEvent;
    }

    /**
     * Helper: Trigger document request notification
     */
    public static function documentRequest(
        Student $student,
        string $documentsNeeded,
        string $deadline,
        ?string $uploadLink = null
    ): int {
        $service = app(self::class);
        $parentUser = $student->parent;

        // Send in-app notification to parent
        if ($parentUser) {
            $service->sendInAppNotification(
                $parentUser->id,
                'Additional Documents Required',
                "Please submit the required documents for {$student->full_name} by {$deadline}.",
                'warning',
                [
                    'trigger_event' => 'document_request',
                    'action_url' => $uploadLink,
                    'action_text' => 'Upload Documents',
                ]
            );
        }

        return $service->trigger('document_request', [
            'student' => $student,
            'parent' => $parentUser ? [
                'email' => $parentUser->email,
                'name' => $parentUser->name,
                'user_id' => $parentUser->id,
            ] : null,
            'entity_type' => Student::class,
            'entity_id' => $student->id,
            'variables' => [
                'student_name' => $student->full_name,
                'parent_name' => $parentUser?->name ?? 'Parent',
                'documents_needed' => $documentsNeeded,
                'deadline' => $deadline,
                'upload_link' => $uploadLink ?? config('app.url') . '/parent/admission',
            ],
        ]);
    }
}

