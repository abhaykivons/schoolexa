<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationFlow extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'description',
        'trigger_event',
        'recipients',
        'custom_emails',
        'send_email',
        'send_in_app',
        'send_sms',
        'email_template_id',
        'send_timing',
        'delay_minutes',
        'schedule_time',
        'conditions',
        'is_active',
        'priority',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'recipients' => 'array',
        'custom_emails' => 'array',
        'conditions' => 'array',
        'send_email' => 'boolean',
        'send_in_app' => 'boolean',
        'send_sms' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Boot the model
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new CompanyScope);

        static::creating(function ($flow) {
            if (empty($flow->company_id)) {
                $flow->company_id = auth()->user()?->company_id;
            }
            $flow->created_by = auth()->id();
        });

        static::updating(function ($flow) {
            $flow->updated_by = auth()->id();
        });
    }

    /**
     * Available trigger events with descriptions
     */
    public static function getTriggerEvents(): array
    {
        return [
            // ==================== STUDENT/ENROLLMENT EVENTS ====================
            'student_enrolled' => [
                'label' => 'Student Enrolled Successfully',
                'category' => 'enrollment',
                'description' => 'When a student is successfully enrolled in a class',
                'recipients' => ['parent', 'student'],
                'variables' => ['student_name', 'student_id', 'parent_name', 'grade', 'class', 'roll_number', 'academic_year', 'school_name'],
            ],
            'student_promoted' => [
                'label' => 'Student Promoted',
                'category' => 'enrollment',
                'description' => 'When a student is promoted to next grade',
                'recipients' => ['parent', 'student'],
                'variables' => ['student_name', 'student_id', 'parent_name', 'previous_grade', 'new_grade', 'new_class', 'academic_year', 'school_name'],
            ],
            
            // ==================== ADMISSION EVENTS ====================
            'admission_form_submitted' => [
                'label' => 'Admission Form Submitted',
                'category' => 'admission',
                'description' => 'When parent submits an admission form',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'student_name', 'application_id', 'grade_applied', 'submission_date', 'school_name'],
            ],
            'admission_approved' => [
                'label' => 'Admission Approved',
                'category' => 'admission',
                'description' => 'When student admission is approved',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'student_name', 'grade', 'class', 'academic_year', 'next_steps', 'school_name'],
            ],
            'admission_rejected' => [
                'label' => 'Admission Rejected',
                'category' => 'admission',
                'description' => 'When student admission is rejected',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'student_name', 'reason', 'school_name', 'support_email'],
            ],
            'admission_waitlisted' => [
                'label' => 'Admission Waitlisted',
                'category' => 'admission',
                'description' => 'When student is placed on waitlist',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'student_name', 'waitlist_position', 'expected_update', 'school_name'],
            ],
            'document_approved' => [
                'label' => 'Document Approved',
                'category' => 'admission',
                'description' => 'When a submitted document is approved',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'student_name', 'document_name', 'school_name'],
            ],
            'document_rejected' => [
                'label' => 'Document Rejected',
                'category' => 'admission',
                'description' => 'When a submitted document is rejected',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'student_name', 'document_name', 'reason', 'resubmit_link', 'deadline', 'school_name'],
            ],
            'document_request' => [
                'label' => 'Additional Documents Required',
                'category' => 'admission',
                'description' => 'When additional documents are requested',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'student_name', 'documents_needed', 'deadline', 'upload_link', 'school_name'],
            ],
            
            // ==================== PARENT EVENTS ====================
            'parent_registered' => [
                'label' => 'Parent Registered',
                'category' => 'parent',
                'description' => 'When a new parent account is created',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'parent_email', 'login_url', 'school_name', 'support_email'],
            ],
            'parent_password_reset' => [
                'label' => 'Parent Password Reset',
                'category' => 'parent',
                'description' => 'When parent requests password reset',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'reset_link', 'expiry_time', 'school_name'],
            ],
            'parent_email_verification' => [
                'label' => 'Parent Email Verification',
                'category' => 'parent',
                'description' => 'Email verification for new parent',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'verification_link', 'school_name'],
            ],
            
            // ==================== STAFF EVENTS ====================
            'staff_account_created' => [
                'label' => 'Staff Account Created',
                'category' => 'staff',
                'description' => 'When a new staff account is created',
                'recipients' => ['staff'],
                'variables' => ['staff_name', 'email', 'password', 'department', 'designation', 'login_url', 'school_name'],
            ],
            'staff_enrollment_submitted' => [
                'label' => 'Staff Enrollment Submitted',
                'category' => 'staff',
                'description' => 'When staff submits enrollment application',
                'recipients' => ['staff', 'admin'],
                'variables' => ['staff_name', 'email', 'application_id', 'position_applied', 'submission_date', 'school_name'],
            ],
            'staff_enrollment_approved' => [
                'label' => 'Staff Enrollment Approved',
                'category' => 'staff',
                'description' => 'When staff enrollment application is approved',
                'recipients' => ['staff'],
                'variables' => ['staff_name', 'email', 'department', 'designation', 'joining_date', 'login_url', 'school_name'],
            ],
            'staff_enrollment_rejected' => [
                'label' => 'Staff Enrollment Rejected',
                'category' => 'staff',
                'description' => 'When staff enrollment application is rejected',
                'recipients' => ['staff'],
                'variables' => ['staff_name', 'email', 'reason', 'school_name', 'support_email'],
            ],
            'staff_onboarding' => [
                'label' => 'Staff Onboarding',
                'category' => 'staff',
                'description' => 'Onboarding details for new staff',
                'recipients' => ['staff'],
                'variables' => ['staff_name', 'department', 'designation', 'joining_date', 'reporting_to', 'orientation_date', 'checklist_items', 'school_name'],
            ],
            'staff_password_reset' => [
                'label' => 'Staff Password Reset',
                'category' => 'staff',
                'description' => 'When staff requests password reset',
                'recipients' => ['staff'],
                'variables' => ['staff_name', 'reset_link', 'expiry_time', 'school_name'],
            ],
            
            // ==================== APPROVAL EVENTS ====================
            'approval_required' => [
                'label' => 'Approval Required',
                'category' => 'approval',
                'description' => 'When a request needs approval',
                'recipients' => ['approver'],
                'variables' => ['approver_name', 'request_type', 'requester_name', 'details', 'approval_link', 'school_name'],
            ],
            'request_approved' => [
                'label' => 'Request Approved',
                'category' => 'approval',
                'description' => 'When a request is approved',
                'recipients' => ['requester'],
                'variables' => ['requester_name', 'request_type', 'approved_by', 'approval_date', 'comments', 'school_name'],
            ],
            'request_rejected' => [
                'label' => 'Request Rejected',
                'category' => 'approval',
                'description' => 'When a request is rejected',
                'recipients' => ['requester'],
                'variables' => ['requester_name', 'request_type', 'rejected_by', 'rejection_date', 'reason', 'school_name'],
            ],
            
            // ==================== FEE & PAYMENT EVENTS ====================
            'fee_payment_reminder' => [
                'label' => 'Fee Payment Reminder',
                'category' => 'fee',
                'description' => 'Reminder for upcoming fee payment',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'student_name', 'fee_type', 'amount', 'due_date', 'payment_link', 'school_name'],
            ],
            'fee_payment_received' => [
                'label' => 'Fee Payment Received',
                'category' => 'fee',
                'description' => 'Confirmation of fee payment',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'student_name', 'fee_type', 'amount', 'payment_date', 'receipt_number', 'school_name'],
            ],
            'fee_overdue' => [
                'label' => 'Fee Overdue Notice',
                'category' => 'fee',
                'description' => 'Notice for overdue fee payment',
                'recipients' => ['parent'],
                'variables' => ['parent_name', 'student_name', 'fee_type', 'amount', 'days_overdue', 'late_fee', 'payment_link', 'school_name'],
            ],
            
            // ==================== GENERAL EVENTS ====================
            'announcement' => [
                'label' => 'General Announcement',
                'category' => 'general',
                'description' => 'Manual announcements to users',
                'recipients' => ['all', 'parent', 'student', 'staff'],
                'variables' => ['recipient_name', 'announcement_title', 'announcement_body', 'date', 'school_name'],
            ],
            'reminder' => [
                'label' => 'Reminder',
                'category' => 'general',
                'description' => 'Reminder notifications',
                'recipients' => ['parent', 'student', 'staff'],
                'variables' => ['recipient_name', 'reminder_title', 'reminder_body', 'due_date', 'school_name'],
            ],
            'event_invitation' => [
                'label' => 'Event Invitation',
                'category' => 'general',
                'description' => 'Invitation to school event',
                'recipients' => ['parent', 'student', 'staff'],
                'variables' => ['recipient_name', 'event_name', 'event_date', 'event_time', 'event_location', 'event_description', 'rsvp_link', 'school_name'],
            ],
            'event_reminder' => [
                'label' => 'Event Reminder',
                'category' => 'general',
                'description' => 'Reminder for upcoming event',
                'recipients' => ['parent', 'student', 'staff'],
                'variables' => ['recipient_name', 'event_name', 'event_date', 'event_time', 'event_location', 'school_name'],
            ],
        ];
    }

    /**
     * Get event categories
     */
    public static function getEventCategories(): array
    {
        return [
            'enrollment' => 'Enrollment Events',
            'admission' => 'Admission Events',
            'parent' => 'Parent Events',
            'staff' => 'Staff Events',
            'approval' => 'Approval Events',
            'fee' => 'Fee & Payment Events',
            'general' => 'General Events',
        ];
    }

    /**
     * Get recipient types
     */
    public static function getRecipientTypes(): array
    {
        return [
            'parent' => 'Parent/Guardian',
            'student' => 'Student',
            'staff' => 'Staff Member',
            'approver' => 'Approver',
            'requester' => 'Requester',
            'admin' => 'Administrator',
            'custom' => 'Custom Emails',
        ];
    }

    /**
     * Relationships
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function emailTemplate()
    {
        return $this->belongsTo(EmailTemplate::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function logs()
    {
        return $this->hasMany(NotificationLog::class);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForEvent($query, string $event)
    {
        return $query->where('trigger_event', $event);
    }

    /**
     * Get active flows for an event
     */
    public static function getFlowsForEvent(string $event): \Illuminate\Database\Eloquent\Collection
    {
        return static::active()
            ->forEvent($event)
            ->orderBy('priority', 'desc')
            ->get();
    }

    /**
     * Get default notification flows
     */
    public static function getDefaultFlows(): array
    {
        return [
            // ==================== ENROLLMENT FLOWS ====================
            [
                'name' => 'Student Enrollment Success',
                'description' => 'Notify parents when their child is successfully enrolled in a class',
                'trigger_event' => 'student_enrolled',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Student Promotion Notification',
                'description' => 'Notify parents when their child is promoted to the next grade',
                'trigger_event' => 'student_promoted',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],

            // ==================== ADMISSION FLOWS ====================
            [
                'name' => 'Admission Form Received',
                'description' => 'Acknowledge receipt of admission application',
                'trigger_event' => 'admission_form_submitted',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 5,
            ],
            [
                'name' => 'Admission Approved',
                'description' => 'Congratulate parents on successful admission',
                'trigger_event' => 'admission_approved',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Admission Rejected',
                'description' => 'Notify parents about admission rejection with reason',
                'trigger_event' => 'admission_rejected',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Admission Waitlisted',
                'description' => 'Notify parents when placed on waitlist',
                'trigger_event' => 'admission_waitlisted',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Document Approved',
                'description' => 'Notify parents when their submitted document is approved',
                'trigger_event' => 'document_approved',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 5,
            ],
            [
                'name' => 'Document Rejected - Resubmit Required',
                'description' => 'Alert parents to resubmit rejected documents',
                'trigger_event' => 'document_rejected',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Additional Documents Required',
                'description' => 'Request additional documents from parents',
                'trigger_event' => 'document_request',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],

            // ==================== PARENT FLOWS ====================
            [
                'name' => 'Parent Welcome Email',
                'description' => 'Welcome new parents with login information',
                'trigger_event' => 'parent_registered',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Parent Password Reset',
                'description' => 'Send password reset link to parents',
                'trigger_event' => 'parent_password_reset',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Parent Email Verification',
                'description' => 'Send email verification link to parents',
                'trigger_event' => 'parent_email_verification',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],

            // ==================== STAFF FLOWS ====================
            [
                'name' => 'Staff Account Created',
                'description' => 'Welcome new staff with login credentials',
                'trigger_event' => 'staff_account_created',
                'recipients' => ['staff'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Staff Enrollment Application Received',
                'description' => 'Acknowledge receipt of staff enrollment application',
                'trigger_event' => 'staff_enrollment_submitted',
                'recipients' => ['staff'],
                'send_email' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 5,
            ],
            [
                'name' => 'Staff Enrollment Approved',
                'description' => 'Notify staff when their enrollment is approved',
                'trigger_event' => 'staff_enrollment_approved',
                'recipients' => ['staff'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Staff Enrollment Rejected',
                'description' => 'Notify staff when their enrollment is rejected',
                'trigger_event' => 'staff_enrollment_rejected',
                'recipients' => ['staff'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Staff Onboarding Information',
                'description' => 'Send onboarding details to newly approved staff',
                'trigger_event' => 'staff_onboarding',
                'recipients' => ['staff'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Staff Password Reset',
                'description' => 'Send password reset link to staff',
                'trigger_event' => 'staff_password_reset',
                'recipients' => ['staff'],
                'send_email' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],

            // ==================== APPROVAL FLOWS ====================
            [
                'name' => 'Approval Request',
                'description' => 'Notify approvers when a new request needs their attention',
                'trigger_event' => 'approval_required',
                'recipients' => ['approver'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Request Approved',
                'description' => 'Notify requesters when their request is approved',
                'trigger_event' => 'request_approved',
                'recipients' => ['requester'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 5,
            ],
            [
                'name' => 'Request Rejected',
                'description' => 'Notify requesters when their request is rejected with reason',
                'trigger_event' => 'request_rejected',
                'recipients' => ['requester'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 5,
            ],

            // ==================== FEE & PAYMENT FLOWS ====================
            [
                'name' => 'Fee Payment Reminder',
                'description' => 'Remind parents about upcoming fee payment',
                'trigger_event' => 'fee_payment_reminder',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 5,
            ],
            [
                'name' => 'Fee Payment Confirmation',
                'description' => 'Confirm fee payment receipt to parents',
                'trigger_event' => 'fee_payment_received',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 5,
            ],
            [
                'name' => 'Fee Overdue Notice',
                'description' => 'Alert parents about overdue fee payment',
                'trigger_event' => 'fee_overdue',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],

            // ==================== GENERAL EVENT FLOWS ====================
            [
                'name' => 'Event Invitation',
                'description' => 'Send event invitations to school community',
                'trigger_event' => 'event_invitation',
                'recipients' => ['parent', 'student', 'staff'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 5,
            ],
            [
                'name' => 'Event Reminder',
                'description' => 'Send reminders for upcoming events',
                'trigger_event' => 'event_reminder',
                'recipients' => ['parent', 'student', 'staff'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 5,
            ],
        ];
    }
}

