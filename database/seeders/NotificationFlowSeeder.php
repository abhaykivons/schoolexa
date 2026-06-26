<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use App\Models\NotificationFlow;
use Illuminate\Database\Seeder;

class NotificationFlowSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $flows = [
            // ==================== ENROLLMENT FLOWS ====================
            [
                'name' => 'Student Enrollment Notification',
                'description' => 'Automatically notify parents when their child is successfully enrolled',
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
                'name' => 'Admission Form Submitted',
                'description' => 'Acknowledgment email when parent submits an admission form',
                'trigger_event' => 'admission_form_submitted',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 5,
            ],
            [
                'name' => 'Admission Approved Notification',
                'description' => 'Notify parents when their child\'s admission is approved',
                'trigger_event' => 'admission_approved',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Admission Rejected Notification',
                'description' => 'Notify parents when their child\'s admission is rejected',
                'trigger_event' => 'admission_rejected',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => true,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Admission Waitlisted Notification',
                'description' => 'Notify parents when their child is placed on the waitlist',
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
                'name' => 'Document Rejected',
                'description' => 'Notify parents when their submitted document is rejected and needs resubmission',
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
                'description' => 'Request additional documents from parents for admission',
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
                'name' => 'Parent Registration Welcome',
                'description' => 'Welcome email sent to new parents after registration',
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
                'send_in_app' => false,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Parent Email Verification',
                'description' => 'Send email verification link to new parents',
                'trigger_event' => 'parent_email_verification',
                'recipients' => ['parent'],
                'send_email' => true,
                'send_in_app' => false,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],

            // ==================== STAFF FLOWS ====================
            [
                'name' => 'Staff Account Created',
                'description' => 'Welcome email with login credentials for new staff members',
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
                'send_in_app' => false,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 5,
            ],
            [
                'name' => 'Staff Enrollment Approved',
                'description' => 'Notify staff when their enrollment application is approved',
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
                'description' => 'Notify staff when their enrollment application is rejected',
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
                'description' => 'Send onboarding details and checklist to new staff',
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
                'description' => 'Send password reset link to staff members',
                'trigger_event' => 'staff_password_reset',
                'recipients' => ['staff'],
                'send_email' => true,
                'send_in_app' => false,
                'send_timing' => 'immediate',
                'is_active' => true,
                'priority' => 10,
            ],

            // ==================== APPROVAL FLOWS ====================
            [
                'name' => 'Approval Required',
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
                'description' => 'Notify requesters when their request is rejected',
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
                'description' => 'Remind parents about upcoming fee payment deadlines',
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
                'description' => 'Alert parents about overdue fee payments',
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
                'description' => 'Send event invitations to school community members',
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

        foreach ($flows as $flowData) {
            // Try to find a matching email template based on event type
            $eventType = $flowData['trigger_event'];
            
            // Map trigger events to email template event types
            $templateEventType = $this->mapTriggerToTemplate($eventType);
            $template = EmailTemplate::where('event_type', $templateEventType)->first();

            NotificationFlow::firstOrCreate(
                [
                    'trigger_event' => $flowData['trigger_event'],
                ],
                [
                    ...$flowData,
                    'email_template_id' => $template?->id,
                ]
            );
        }
    }

    /**
     * Map trigger event to email template event type
     */
    private function mapTriggerToTemplate(string $triggerEvent): string
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
}

