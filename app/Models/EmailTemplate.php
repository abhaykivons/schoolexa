<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'description',
        'category',
        'event_type',
        'subject',
        'body',
        'from_name',
        'from_email',
        'reply_to',
        'cc',
        'bcc',
        'available_variables',
        'is_active',
        'is_default',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'available_variables' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    /**
     * Boot the model
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new CompanyScope);
        
        static::creating(function ($template) {
            if (empty($template->slug)) {
                $template->slug = Str::slug($template->name) . '-' . Str::random(6);
            }
            
            if (empty($template->company_id)) {
                $template->company_id = auth()->user()?->company_id;
            }
            
            $template->created_by = auth()->id();
        });
        
        static::updating(function ($template) {
            $template->updated_by = auth()->id();
        });
    }

    /**
     * Template categories with labels
     */
    public static function getCategories(): array
    {
        return [
            'parent' => 'Parent Communications',
            'student' => 'Student Communications',
            'staff' => 'Staff Communications',
            'enrollment' => 'Enrollment Process',
            'admission' => 'Admission Process',
            'approval' => 'Approval Notifications',
            'notification' => 'General Notifications',
            'general' => 'General Templates',
        ];
    }

    /**
     * Event types with their categories and default variables
     */
    public static function getEventTypes(): array
    {
        return [
            // ==================== PARENT EVENTS ====================
            'parent_welcome' => [
                'label' => 'Parent Welcome',
                'category' => 'parent',
                'description' => 'Sent when a new parent registers',
                'variables' => ['parent_name', 'parent_email', 'school_name', 'login_url', 'support_email'],
            ],
            'parent_password_reset' => [
                'label' => 'Parent Password Reset',
                'category' => 'parent',
                'description' => 'Sent when parent requests password reset',
                'variables' => ['parent_name', 'reset_link', 'expiry_time', 'school_name'],
            ],
            'parent_email_verification' => [
                'label' => 'Parent Email Verification',
                'category' => 'parent',
                'description' => 'Sent to verify parent email address',
                'variables' => ['parent_name', 'verification_link', 'school_name'],
            ],
            
            // ==================== STUDENT EVENTS ====================
            'student_welcome' => [
                'label' => 'Student Welcome',
                'category' => 'student',
                'description' => 'Sent when a student account is created',
                'variables' => ['student_name', 'student_id', 'email', 'password', 'school_name', 'login_url', 'grade', 'class'],
            ],
            'student_enrollment_complete' => [
                'label' => 'Student Enrollment Complete',
                'category' => 'student',
                'description' => 'Sent when student enrollment is finalized',
                'variables' => ['student_name', 'student_id', 'parent_name', 'grade', 'class', 'roll_number', 'academic_year', 'school_name'],
            ],
            'student_promoted' => [
                'label' => 'Student Promoted',
                'category' => 'student',
                'description' => 'Sent when student is promoted to next grade',
                'variables' => ['student_name', 'student_id', 'parent_name', 'previous_grade', 'new_grade', 'new_class', 'academic_year', 'school_name'],
            ],
            
            // ==================== STAFF EVENTS ====================
            'staff_welcome' => [
                'label' => 'Staff Welcome',
                'category' => 'staff',
                'description' => 'Sent when new staff account is created',
                'variables' => ['staff_name', 'email', 'password', 'department', 'designation', 'school_name', 'login_url'],
            ],
            'staff_enrollment_submitted' => [
                'label' => 'Staff Enrollment Submitted',
                'category' => 'staff',
                'description' => 'Acknowledgment when staff submits enrollment application',
                'variables' => ['staff_name', 'email', 'application_id', 'position_applied', 'submission_date', 'school_name'],
            ],
            'staff_enrollment_approved' => [
                'label' => 'Staff Enrollment Approved',
                'category' => 'staff',
                'description' => 'Sent when staff enrollment application is approved',
                'variables' => ['staff_name', 'email', 'department', 'designation', 'joining_date', 'school_name', 'login_url'],
            ],
            'staff_enrollment_rejected' => [
                'label' => 'Staff Enrollment Rejected',
                'category' => 'staff',
                'description' => 'Sent when staff enrollment application is rejected',
                'variables' => ['staff_name', 'email', 'reason', 'school_name', 'support_email'],
            ],
            'staff_onboarding' => [
                'label' => 'Staff Onboarding',
                'category' => 'staff',
                'description' => 'Onboarding information for new staff',
                'variables' => ['staff_name', 'department', 'designation', 'joining_date', 'reporting_to', 'school_name', 'orientation_date', 'checklist_items'],
            ],
            'staff_password_reset' => [
                'label' => 'Staff Password Reset',
                'category' => 'staff',
                'description' => 'Sent when staff requests password reset',
                'variables' => ['staff_name', 'reset_link', 'expiry_time', 'school_name'],
            ],
            
            // ==================== ENROLLMENT EVENTS ====================
            'enrollment_received' => [
                'label' => 'Enrollment Application Received',
                'category' => 'enrollment',
                'description' => 'Acknowledgment of enrollment application',
                'variables' => ['parent_name', 'student_name', 'application_id', 'grade_applied', 'submission_date', 'school_name'],
            ],
            'enrollment_in_review' => [
                'label' => 'Enrollment Under Review',
                'category' => 'enrollment',
                'description' => 'Application is being reviewed',
                'variables' => ['parent_name', 'student_name', 'application_id', 'school_name'],
            ],
            'enrollment_document_request' => [
                'label' => 'Additional Documents Required',
                'category' => 'enrollment',
                'description' => 'Request for additional documents',
                'variables' => ['parent_name', 'student_name', 'documents_needed', 'deadline', 'upload_link', 'school_name'],
            ],
            
            // ==================== ADMISSION EVENTS ====================
            'admission_form_submitted' => [
                'label' => 'Admission Form Submitted',
                'category' => 'admission',
                'description' => 'Acknowledgment when parent submits admission form',
                'variables' => ['parent_name', 'student_name', 'application_id', 'grade_applied', 'submission_date', 'school_name'],
            ],
            'admission_approved' => [
                'label' => 'Admission Approved',
                'category' => 'admission',
                'description' => 'Admission application approved',
                'variables' => ['parent_name', 'student_name', 'grade', 'class', 'academic_year', 'next_steps', 'school_name'],
            ],
            'admission_rejected' => [
                'label' => 'Admission Rejected',
                'category' => 'admission',
                'description' => 'Admission application rejected',
                'variables' => ['parent_name', 'student_name', 'reason', 'school_name', 'support_email'],
            ],
            'admission_waitlisted' => [
                'label' => 'Admission Waitlisted',
                'category' => 'admission',
                'description' => 'Placed on admission waitlist',
                'variables' => ['parent_name', 'student_name', 'waitlist_position', 'school_name', 'expected_update'],
            ],
            'document_approved' => [
                'label' => 'Document Approved',
                'category' => 'admission',
                'description' => 'Submitted document has been approved',
                'variables' => ['parent_name', 'student_name', 'document_name', 'school_name'],
            ],
            'document_rejected' => [
                'label' => 'Document Rejected',
                'category' => 'admission',
                'description' => 'Submitted document was rejected and needs resubmission',
                'variables' => ['parent_name', 'student_name', 'document_name', 'reason', 'resubmit_link', 'deadline', 'school_name'],
            ],
            
            // ==================== APPROVAL EVENTS ====================
            'approval_pending' => [
                'label' => 'Approval Pending',
                'category' => 'approval',
                'description' => 'Request awaiting approval',
                'variables' => ['approver_name', 'request_type', 'requester_name', 'details', 'approval_link', 'school_name'],
            ],
            'approval_approved' => [
                'label' => 'Request Approved',
                'category' => 'approval',
                'description' => 'Request has been approved',
                'variables' => ['requester_name', 'request_type', 'approved_by', 'approval_date', 'comments', 'school_name'],
            ],
            'approval_rejected' => [
                'label' => 'Request Rejected',
                'category' => 'approval',
                'description' => 'Request has been rejected',
                'variables' => ['requester_name', 'request_type', 'rejected_by', 'rejection_date', 'reason', 'school_name'],
            ],
            
            // ==================== FEE & PAYMENT EVENTS ====================
            'fee_payment_reminder' => [
                'label' => 'Fee Payment Reminder',
                'category' => 'notification',
                'description' => 'Reminder to pay pending fees',
                'variables' => ['parent_name', 'student_name', 'fee_type', 'amount', 'due_date', 'payment_link', 'school_name'],
            ],
            'fee_payment_confirmation' => [
                'label' => 'Fee Payment Confirmation',
                'category' => 'notification',
                'description' => 'Confirmation of fee payment received',
                'variables' => ['parent_name', 'student_name', 'fee_type', 'amount', 'payment_date', 'receipt_number', 'school_name'],
            ],
            'fee_overdue_notice' => [
                'label' => 'Fee Overdue Notice',
                'category' => 'notification',
                'description' => 'Notice for overdue fee payment',
                'variables' => ['parent_name', 'student_name', 'fee_type', 'amount', 'days_overdue', 'late_fee', 'payment_link', 'school_name'],
            ],
            
            // ==================== GENERAL NOTIFICATIONS ====================
            'general_announcement' => [
                'label' => 'General Announcement',
                'category' => 'notification',
                'description' => 'General school announcement',
                'variables' => ['recipient_name', 'announcement_title', 'announcement_body', 'school_name', 'date'],
            ],
            'reminder' => [
                'label' => 'Reminder',
                'category' => 'notification',
                'description' => 'General reminder notification',
                'variables' => ['recipient_name', 'reminder_title', 'reminder_body', 'due_date', 'school_name'],
            ],
            'event_invitation' => [
                'label' => 'Event Invitation',
                'category' => 'notification',
                'description' => 'Invitation to school event',
                'variables' => ['recipient_name', 'event_name', 'event_date', 'event_time', 'event_location', 'event_description', 'rsvp_link', 'school_name'],
            ],
            'event_reminder' => [
                'label' => 'Event Reminder',
                'category' => 'notification',
                'description' => 'Reminder for upcoming event',
                'variables' => ['recipient_name', 'event_name', 'event_date', 'event_time', 'event_location', 'school_name'],
            ],
        ];
    }

    /**
     * Get default template content for an event type
     */
    public static function getDefaultTemplate(string $eventType): ?array
    {
        $defaults = [
            // ==================== PARENT TEMPLATES ====================
            'parent_welcome' => [
                'subject' => 'Welcome to {{school_name}} - Your Account is Ready!',
                'body' => '<h2>Welcome to {{school_name}}!</h2>
<p>Dear {{parent_name}},</p>
<p>We are delighted to welcome you to our school community. Your parent account has been successfully created.</p>
<p><strong>Your Login Details:</strong></p>
<ul>
<li>Email: {{parent_email}}</li>
<li>Login URL: <a href="{{login_url}}">{{login_url}}</a></li>
</ul>
<p>Through your parent portal, you can:</p>
<ul>
<li>Track your child\'s enrollment status</li>
<li>Submit required documents</li>
<li>View important announcements</li>
<li>Communicate with school administration</li>
</ul>
<p>If you have any questions, please contact us at {{support_email}}.</p>
<p>Best regards,<br>{{school_name}} Administration</p>',
            ],
            
            'parent_password_reset' => [
                'subject' => 'Password Reset Request - {{school_name}}',
                'body' => '<h2>Password Reset Request</h2>
<p>Dear {{parent_name}},</p>
<p>We received a request to reset your password for your {{school_name}} parent account.</p>
<p>Click the button below to reset your password:</p>
<p style="text-align: center; margin: 30px 0;">
<a href="{{reset_link}}" style="display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
</p>
<p><strong>This link will expire in {{expiry_time}}.</strong></p>
<p>If you did not request a password reset, please ignore this email or contact us if you have concerns.</p>
<p>Best regards,<br>{{school_name}} Support Team</p>',
            ],

            'parent_email_verification' => [
                'subject' => 'Verify Your Email - {{school_name}}',
                'body' => '<h2>Email Verification</h2>
<p>Dear {{parent_name}},</p>
<p>Please verify your email address to complete your registration at {{school_name}}.</p>
<p style="text-align: center; margin: 30px 0;">
<a href="{{verification_link}}" style="display: inline-block; padding: 14px 28px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
</p>
<p>If you did not create an account, no further action is required.</p>
<p>Best regards,<br>{{school_name}} Administration</p>',
            ],

            // ==================== STUDENT TEMPLATES ====================
            'student_welcome' => [
                'subject' => 'Welcome to {{school_name}} - Student Account Created',
                'body' => '<h2>Welcome, {{student_name}}!</h2>
<p>Your student account at {{school_name}} has been created.</p>
<p><strong>Your Account Details:</strong></p>
<ul>
<li>Student ID: {{student_id}}</li>
<li>Email: {{email}}</li>
<li>Temporary Password: {{password}}</li>
<li>Grade: {{grade}}</li>
<li>Class: {{class}}</li>
</ul>
<p>Please log in at <a href="{{login_url}}">{{login_url}}</a> and change your password upon first login.</p>
<p>We look forward to a successful academic journey together!</p>
<p>Best regards,<br>{{school_name}} Administration</p>',
            ],
            
            'student_enrollment_complete' => [
                'subject' => 'Enrollment Confirmed - {{student_name}} at {{school_name}}',
                'body' => '<h2>Enrollment Confirmation</h2>
<p>Dear {{parent_name}},</p>
<p>We are pleased to confirm that <strong>{{student_name}}</strong> has been successfully enrolled at {{school_name}}.</p>
<p><strong>Enrollment Details:</strong></p>
<ul>
<li>Student ID: {{student_id}}</li>
<li>Grade: {{grade}}</li>
<li>Class: {{class}}</li>
<li>Roll Number: {{roll_number}}</li>
<li>Academic Year: {{academic_year}}</li>
</ul>
<p>We look forward to a successful academic year!</p>
<p>Best regards,<br>{{school_name}} Administration</p>',
            ],

            'student_promoted' => [
                'subject' => '🎓 Congratulations! {{student_name}} has been promoted - {{school_name}}',
                'body' => '<h2>Student Promotion</h2>
<p>Dear {{parent_name}},</p>
<p>We are delighted to inform you that <strong>{{student_name}}</strong> has been successfully promoted!</p>
<p><strong>Promotion Details:</strong></p>
<ul>
<li>Previous Grade: {{previous_grade}}</li>
<li>New Grade: {{new_grade}}</li>
<li>New Class: {{new_class}}</li>
<li>Academic Year: {{academic_year}}</li>
</ul>
<p>Congratulations on this achievement! We look forward to another successful academic year.</p>
<p>Best regards,<br>{{school_name}} Administration</p>',
            ],
            
            // ==================== STAFF TEMPLATES ====================
            'staff_welcome' => [
                'subject' => 'Welcome to {{school_name}} - Your Staff Account',
                'body' => '<h2>Welcome to the Team!</h2>
<p>Dear {{staff_name}},</p>
<p>Welcome to {{school_name}}! Your staff account has been created.</p>
<p><strong>Your Account Details:</strong></p>
<ul>
<li>Email: {{email}}</li>
<li>Temporary Password: {{password}}</li>
<li>Department: {{department}}</li>
<li>Designation: {{designation}}</li>
</ul>
<p>Please log in at <a href="{{login_url}}">{{login_url}}</a> and change your password upon first login.</p>
<p>We are excited to have you on board!</p>
<p>Best regards,<br>{{school_name}} Administration</p>',
            ],

            'staff_enrollment_submitted' => [
                'subject' => 'Application Received - {{school_name}} Staff Enrollment',
                'body' => '<h2>Application Received</h2>
<p>Dear {{staff_name}},</p>
<p>Thank you for submitting your staff enrollment application at {{school_name}}.</p>
<p><strong>Application Details:</strong></p>
<ul>
<li>Application ID: {{application_id}}</li>
<li>Position Applied: {{position_applied}}</li>
<li>Submission Date: {{submission_date}}</li>
</ul>
<p>Our HR team will review your application and contact you soon. Please ensure all required documents have been submitted.</p>
<p>Best regards,<br>{{school_name}} HR Department</p>',
            ],

            'staff_enrollment_approved' => [
                'subject' => '🎉 Congratulations! Your Application has been Approved - {{school_name}}',
                'body' => '<h2>Application Approved!</h2>
<p>Dear {{staff_name}},</p>
<p>We are pleased to inform you that your staff enrollment application at {{school_name}} has been <strong>approved</strong>!</p>
<p><strong>Position Details:</strong></p>
<ul>
<li>Department: {{department}}</li>
<li>Designation: {{designation}}</li>
<li>Joining Date: {{joining_date}}</li>
</ul>
<p><strong>Next Steps:</strong></p>
<ol>
<li>Complete the onboarding documentation</li>
<li>Log in to your staff account at <a href="{{login_url}}">{{login_url}}</a></li>
<li>Complete your profile information</li>
<li>Review the staff handbook and policies</li>
</ol>
<p>We are excited to have you join our team!</p>
<p>Best regards,<br>{{school_name}} HR Department</p>',
            ],

            'staff_enrollment_rejected' => [
                'subject' => 'Application Status Update - {{school_name}}',
                'body' => '<h2>Application Status Update</h2>
<p>Dear {{staff_name}},</p>
<p>Thank you for your interest in joining {{school_name}} and for submitting your staff enrollment application.</p>
<p>After careful review, we regret to inform you that we are unable to proceed with your application at this time.</p>
<p><strong>Reason:</strong> {{reason}}</p>
<p>We appreciate the time and effort you invested in your application and wish you all the best in your future endeavors.</p>
<p>If you have any questions, please contact us at {{support_email}}.</p>
<p>Best regards,<br>{{school_name}} HR Department</p>',
            ],

            'staff_onboarding' => [
                'subject' => 'Welcome Aboard! Your Onboarding Information - {{school_name}}',
                'body' => '<h2>Welcome to {{school_name}}!</h2>
<p>Dear {{staff_name}},</p>
<p>We are thrilled to have you join our team! Here is your onboarding information:</p>
<p><strong>Your Position:</strong></p>
<ul>
<li>Department: {{department}}</li>
<li>Designation: {{designation}}</li>
<li>Joining Date: {{joining_date}}</li>
<li>Reporting To: {{reporting_to}}</li>
</ul>
<p><strong>Orientation Schedule:</strong></p>
<p>Your orientation is scheduled for {{orientation_date}}. Please arrive 15 minutes early.</p>
<p><strong>Onboarding Checklist:</strong></p>
<p>{{checklist_items}}</p>
<p><strong>What to Bring:</strong></p>
<ul>
<li>Government-issued ID</li>
<li>Completed onboarding forms</li>
<li>Banking information for payroll</li>
<li>Emergency contact details</li>
</ul>
<p>If you have any questions before your first day, please don\'t hesitate to reach out to HR.</p>
<p>We look forward to working with you!</p>
<p>Best regards,<br>{{school_name}} HR Department</p>',
            ],

            'staff_password_reset' => [
                'subject' => 'Password Reset Request - {{school_name}} Staff Account',
                'body' => '<h2>Password Reset Request</h2>
<p>Dear {{staff_name}},</p>
<p>We received a request to reset your password for your {{school_name}} staff account.</p>
<p style="text-align: center; margin: 30px 0;">
<a href="{{reset_link}}" style="display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
</p>
<p><strong>This link will expire in {{expiry_time}}.</strong></p>
<p>If you did not request this reset, please contact IT support immediately.</p>
<p>Best regards,<br>{{school_name}} IT Support</p>',
            ],
            
            // ==================== ENROLLMENT TEMPLATES ====================
            'enrollment_received' => [
                'subject' => 'Application Received - {{student_name}} | {{school_name}}',
                'body' => '<h2>Application Received</h2>
<p>Dear {{parent_name}},</p>
<p>Thank you for submitting the enrollment application for <strong>{{student_name}}</strong> at {{school_name}}.</p>
<p><strong>Application Details:</strong></p>
<ul>
<li>Application ID: {{application_id}}</li>
<li>Grade Applied: {{grade_applied}}</li>
<li>Submission Date: {{submission_date}}</li>
</ul>
<p>Our admissions team will review the application and contact you soon. You can track the status through your parent portal.</p>
<p>Best regards,<br>{{school_name}} Admissions Team</p>',
            ],

            'enrollment_in_review' => [
                'subject' => 'Application Under Review - {{student_name}} | {{school_name}}',
                'body' => '<h2>Application Under Review</h2>
<p>Dear {{parent_name}},</p>
<p>We wanted to update you that the enrollment application for <strong>{{student_name}}</strong> is currently under review.</p>
<p><strong>Application ID:</strong> {{application_id}}</p>
<p>Our admissions team is carefully reviewing all submitted documents and information. We will notify you once a decision has been made.</p>
<p>Thank you for your patience.</p>
<p>Best regards,<br>{{school_name}} Admissions Team</p>',
            ],

            'enrollment_document_request' => [
                'subject' => 'Action Required: Additional Documents Needed - {{student_name}}',
                'body' => '<h2>Additional Documents Required</h2>
<p>Dear {{parent_name}},</p>
<p>To proceed with the enrollment application for <strong>{{student_name}}</strong>, we require the following additional documents:</p>
<p><strong>Documents Needed:</strong></p>
<p>{{documents_needed}}</p>
<p><strong>Deadline:</strong> {{deadline}}</p>
<p style="text-align: center; margin: 30px 0;">
<a href="{{upload_link}}" style="display: inline-block; padding: 14px 28px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Upload Documents</a>
</p>
<p>Please submit these documents as soon as possible to avoid delays in processing.</p>
<p>Best regards,<br>{{school_name}} Admissions Team</p>',
            ],

            // ==================== ADMISSION TEMPLATES ====================
            'admission_form_submitted' => [
                'subject' => 'Admission Form Received - {{student_name}} | {{school_name}}',
                'body' => '<h2>Admission Form Received</h2>
<p>Dear {{parent_name}},</p>
<p>Thank you for submitting the admission form for <strong>{{student_name}}</strong> at {{school_name}}.</p>
<p><strong>Application Details:</strong></p>
<ul>
<li>Application ID: {{application_id}}</li>
<li>Grade Applied: {{grade_applied}}</li>
<li>Submission Date: {{submission_date}}</li>
</ul>
<p><strong>What happens next?</strong></p>
<ol>
<li>Our team will review your application</li>
<li>You may be contacted for additional documents if needed</li>
<li>You will receive an admission decision via email</li>
</ol>
<p>You can track the status of your application through your parent portal.</p>
<p>Best regards,<br>{{school_name}} Admissions Team</p>',
            ],
            
            'admission_approved' => [
                'subject' => '🎉 Congratulations! Admission Approved - {{student_name}}',
                'body' => '<h2>Admission Approved!</h2>
<p>Dear {{parent_name}},</p>
<p>We are delighted to inform you that <strong>{{student_name}}</strong> has been accepted for admission at {{school_name}}!</p>
<p><strong>Admission Details:</strong></p>
<ul>
<li>Grade: {{grade}}</li>
<li>Class: {{class}}</li>
<li>Academic Year: {{academic_year}}</li>
</ul>
<p><strong>Next Steps:</strong></p>
<p>{{next_steps}}</p>
<p>We look forward to welcoming {{student_name}} to our school family!</p>
<p>Best regards,<br>{{school_name}} Admissions Team</p>',
            ],
            
            'admission_rejected' => [
                'subject' => 'Admission Update - {{student_name}} | {{school_name}}',
                'body' => '<h2>Admission Decision</h2>
<p>Dear {{parent_name}},</p>
<p>Thank you for your interest in {{school_name}} and for submitting an application for {{student_name}}.</p>
<p>After careful consideration, we regret to inform you that we are unable to offer admission at this time.</p>
<p><strong>Reason:</strong> {{reason}}</p>
<p>We appreciate your interest in our school and wish {{student_name}} all the best in their educational journey.</p>
<p>If you have any questions, please contact us at {{support_email}}.</p>
<p>Best regards,<br>{{school_name}} Admissions Team</p>',
            ],

            'admission_waitlisted' => [
                'subject' => 'Admission Status: Waitlisted - {{student_name}} | {{school_name}}',
                'body' => '<h2>Waitlist Notification</h2>
<p>Dear {{parent_name}},</p>
<p>Thank you for your interest in {{school_name}} and for submitting an application for <strong>{{student_name}}</strong>.</p>
<p>After reviewing all applications, we have placed {{student_name}} on our waitlist.</p>
<p><strong>Waitlist Position:</strong> {{waitlist_position}}</p>
<p><strong>What this means:</strong></p>
<ul>
<li>Your application is complete and under consideration</li>
<li>As seats become available, we will contact families in waitlist order</li>
<li>Expected update: {{expected_update}}</li>
</ul>
<p>We will notify you immediately if a seat becomes available. Thank you for your patience and continued interest in {{school_name}}.</p>
<p>Best regards,<br>{{school_name}} Admissions Team</p>',
            ],

            'document_approved' => [
                'subject' => '✓ Document Approved - {{student_name}} | {{school_name}}',
                'body' => '<h2>Document Approved</h2>
<p>Dear {{parent_name}},</p>
<p>We are pleased to inform you that the following document for <strong>{{student_name}}</strong> has been approved:</p>
<p><strong>Document:</strong> {{document_name}}</p>
<p>Your submission has been verified and added to {{student_name}}\'s file.</p>
<p>Best regards,<br>{{school_name}} Admissions Team</p>',
            ],

            'document_rejected' => [
                'subject' => '⚠️ Document Needs Resubmission - {{student_name}} | {{school_name}}',
                'body' => '<h2>Document Resubmission Required</h2>
<p>Dear {{parent_name}},</p>
<p>The following document submitted for <strong>{{student_name}}</strong> could not be accepted and needs to be resubmitted:</p>
<p><strong>Document:</strong> {{document_name}}</p>
<p><strong>Reason:</strong> {{reason}}</p>
<p><strong>Deadline:</strong> {{deadline}}</p>
<p style="text-align: center; margin: 30px 0;">
<a href="{{resubmit_link}}" style="display: inline-block; padding: 14px 28px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Resubmit Document</a>
</p>
<p>Please ensure the new submission meets all requirements to avoid further delays.</p>
<p>Best regards,<br>{{school_name}} Admissions Team</p>',
            ],

            // ==================== APPROVAL TEMPLATES ====================
            'approval_pending' => [
                'subject' => 'Action Required: {{request_type}} Awaiting Your Approval',
                'body' => '<h2>Approval Required</h2>
<p>Dear {{approver_name}},</p>
<p>A new {{request_type}} request requires your approval.</p>
<p><strong>Request Details:</strong></p>
<ul>
<li>Requested By: {{requester_name}}</li>
<li>Request Type: {{request_type}}</li>
<li>Details: {{details}}</li>
</ul>
<p style="text-align: center; margin: 30px 0;">
<a href="{{approval_link}}" style="display: inline-block; padding: 14px 28px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Review & Approve</a>
</p>
<p>Best regards,<br>{{school_name}} System</p>',
            ],

            'approval_approved' => [
                'subject' => '✓ Your {{request_type}} has been Approved',
                'body' => '<h2>Request Approved</h2>
<p>Dear {{requester_name}},</p>
<p>Your {{request_type}} has been <strong>approved</strong>.</p>
<p><strong>Approval Details:</strong></p>
<ul>
<li>Request Type: {{request_type}}</li>
<li>Approved By: {{approved_by}}</li>
<li>Approval Date: {{approval_date}}</li>
</ul>
<p><strong>Comments:</strong> {{comments}}</p>
<p>Best regards,<br>{{school_name}} Administration</p>',
            ],

            'approval_rejected' => [
                'subject' => 'Your {{request_type}} has been Declined',
                'body' => '<h2>Request Declined</h2>
<p>Dear {{requester_name}},</p>
<p>Your {{request_type}} has been <strong>declined</strong>.</p>
<p><strong>Details:</strong></p>
<ul>
<li>Request Type: {{request_type}}</li>
<li>Declined By: {{rejected_by}}</li>
<li>Date: {{rejection_date}}</li>
</ul>
<p><strong>Reason:</strong> {{reason}}</p>
<p>If you have questions about this decision, please contact the approver directly.</p>
<p>Best regards,<br>{{school_name}} Administration</p>',
            ],

            // ==================== FEE & PAYMENT TEMPLATES ====================
            'fee_payment_reminder' => [
                'subject' => '⏰ Fee Payment Reminder - {{student_name}} | {{school_name}}',
                'body' => '<h2>Fee Payment Reminder</h2>
<p>Dear {{parent_name}},</p>
<p>This is a friendly reminder that a fee payment for <strong>{{student_name}}</strong> is due soon.</p>
<p><strong>Payment Details:</strong></p>
<ul>
<li>Fee Type: {{fee_type}}</li>
<li>Amount: {{amount}}</li>
<li>Due Date: {{due_date}}</li>
</ul>
<p style="text-align: center; margin: 30px 0;">
<a href="{{payment_link}}" style="display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Pay Now</a>
</p>
<p>Please ensure timely payment to avoid any late fees.</p>
<p>Best regards,<br>{{school_name}} Finance Department</p>',
            ],

            'fee_payment_confirmation' => [
                'subject' => '✓ Payment Received - {{student_name}} | {{school_name}}',
                'body' => '<h2>Payment Confirmation</h2>
<p>Dear {{parent_name}},</p>
<p>Thank you! We have received your payment for <strong>{{student_name}}</strong>.</p>
<p><strong>Payment Details:</strong></p>
<ul>
<li>Fee Type: {{fee_type}}</li>
<li>Amount: {{amount}}</li>
<li>Payment Date: {{payment_date}}</li>
<li>Receipt Number: {{receipt_number}}</li>
</ul>
<p>A copy of the receipt has been added to your parent portal.</p>
<p>Thank you for your timely payment!</p>
<p>Best regards,<br>{{school_name}} Finance Department</p>',
            ],

            'fee_overdue_notice' => [
                'subject' => '⚠️ OVERDUE: Fee Payment Required - {{student_name}} | {{school_name}}',
                'body' => '<h2>Overdue Payment Notice</h2>
<p>Dear {{parent_name}},</p>
<p>This is an important notice regarding an overdue payment for <strong>{{student_name}}</strong>.</p>
<p><strong>Overdue Payment Details:</strong></p>
<ul>
<li>Fee Type: {{fee_type}}</li>
<li>Original Amount: {{amount}}</li>
<li>Days Overdue: {{days_overdue}}</li>
<li>Late Fee Applied: {{late_fee}}</li>
</ul>
<p style="text-align: center; margin: 30px 0;">
<a href="{{payment_link}}" style="display: inline-block; padding: 14px 28px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Pay Now to Avoid Further Late Fees</a>
</p>
<p>Please settle this payment immediately to avoid additional charges or service interruptions.</p>
<p>If you have already made this payment, please disregard this notice and contact our finance department.</p>
<p>Best regards,<br>{{school_name}} Finance Department</p>',
            ],

            // ==================== GENERAL NOTIFICATION TEMPLATES ====================
            'general_announcement' => [
                'subject' => '{{announcement_title}} - {{school_name}}',
                'body' => '<h2>{{announcement_title}}</h2>
<p>Dear {{recipient_name}},</p>
<p>{{announcement_body}}</p>
<p>Date: {{date}}</p>
<p>Best regards,<br>{{school_name}} Administration</p>',
            ],

            'reminder' => [
                'subject' => '⏰ Reminder: {{reminder_title}} - {{school_name}}',
                'body' => '<h2>{{reminder_title}}</h2>
<p>Dear {{recipient_name}},</p>
<p>{{reminder_body}}</p>
<p><strong>Due Date:</strong> {{due_date}}</p>
<p>Best regards,<br>{{school_name}} Administration</p>',
            ],

            'event_invitation' => [
                'subject' => '📅 You\'re Invited: {{event_name}} - {{school_name}}',
                'body' => '<h2>Event Invitation</h2>
<p>Dear {{recipient_name}},</p>
<p>You are cordially invited to attend the following event:</p>
<p><strong>Event:</strong> {{event_name}}</p>
<p><strong>Details:</strong></p>
<ul>
<li>Date: {{event_date}}</li>
<li>Time: {{event_time}}</li>
<li>Location: {{event_location}}</li>
</ul>
<p><strong>Description:</strong></p>
<p>{{event_description}}</p>
<p style="text-align: center; margin: 30px 0;">
<a href="{{rsvp_link}}" style="display: inline-block; padding: 14px 28px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">RSVP Now</a>
</p>
<p>We hope to see you there!</p>
<p>Best regards,<br>{{school_name}} Administration</p>',
            ],

            'event_reminder' => [
                'subject' => '⏰ Event Reminder: {{event_name}} - Tomorrow!',
                'body' => '<h2>Event Reminder</h2>
<p>Dear {{recipient_name}},</p>
<p>This is a friendly reminder about the upcoming event:</p>
<p><strong>Event:</strong> {{event_name}}</p>
<p><strong>Details:</strong></p>
<ul>
<li>Date: {{event_date}}</li>
<li>Time: {{event_time}}</li>
<li>Location: {{event_location}}</li>
</ul>
<p>We look forward to seeing you!</p>
<p>Best regards,<br>{{school_name}} Administration</p>',
            ],
        ];

        return $defaults[$eventType] ?? null;
    }

    /**
     * Parse template body with variables
     */
    public function parse(array $variables): string
    {
        $body = $this->body;
        
        foreach ($variables as $key => $value) {
            $body = str_replace('{{' . $key . '}}', $value, $body);
        }
        
        return $body;
    }

    /**
     * Parse subject with variables
     */
    public function parseSubject(array $variables): string
    {
        $subject = $this->subject;
        
        foreach ($variables as $key => $value) {
            $subject = str_replace('{{' . $key . '}}', $value, $subject);
        }
        
        return $subject;
    }

    /**
     * Relationships
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByEventType($query, string $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    /**
     * Get active template for an event type
     */
    public static function getActiveTemplate(string $eventType): ?self
    {
        return static::where('event_type', $eventType)
            ->where('is_active', true)
            ->first();
    }
}

