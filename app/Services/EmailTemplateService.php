<?php

namespace App\Services;

use App\Models\EmailTemplate;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\HtmlString;

class EmailTemplateService
{
    /**
     * Send an email using a template
     *
     * @param string $eventType The event type (e.g., 'parent_welcome', 'student_enrollment_complete')
     * @param string|array $to Recipient email(s)
     * @param array $variables Variables to replace in the template
     * @param array $options Additional options (cc, bcc, attachments, etc.)
     * @return bool
     */
    public static function send(
        string $eventType,
        string|array $to,
        array $variables = [],
        array $options = []
    ): bool {
        $template = EmailTemplate::getActiveTemplate($eventType);

        if (!$template) {
            // Log warning or throw exception
            \Log::warning("No active email template found for event type: {$eventType}");
            return false;
        }

        return self::sendWithTemplate($template, $to, $variables, $options);
    }

    /**
     * Send an email using a specific template instance
     */
    public static function sendWithTemplate(
        EmailTemplate $template,
        string|array $to,
        array $variables = [],
        array $options = []
    ): bool {
        try {
            $subject = $template->parseSubject($variables);
            $body = $template->parse($variables);

            $mailable = new TemplateMailable(
                subject: $subject,
                body: $body,
                fromName: $template->from_name ?? config('mail.from.name'),
                fromEmail: $template->from_email ?? config('mail.from.address'),
                replyTo: $template->reply_to,
            );

            // Add CC
            if (!empty($template->cc) || !empty($options['cc'])) {
                $cc = array_merge(
                    self::parseEmails($template->cc ?? ''),
                    self::parseEmails($options['cc'] ?? '')
                );
                if (!empty($cc)) {
                    $mailable->cc($cc);
                }
            }

            // Add BCC
            if (!empty($template->bcc) || !empty($options['bcc'])) {
                $bcc = array_merge(
                    self::parseEmails($template->bcc ?? ''),
                    self::parseEmails($options['bcc'] ?? '')
                );
                if (!empty($bcc)) {
                    $mailable->bcc($bcc);
                }
            }

            // Add attachments
            if (!empty($options['attachments'])) {
                foreach ($options['attachments'] as $attachment) {
                    if (is_string($attachment)) {
                        $mailable->attach($attachment);
                    } elseif (is_array($attachment)) {
                        $mailable->attach(
                            $attachment['path'] ?? $attachment[0],
                            $attachment['options'] ?? $attachment[1] ?? []
                        );
                    }
                }
            }

            Mail::to($to)->send($mailable);

            return true;
        } catch (\Exception $e) {
            \Log::error("Failed to send email template: {$e->getMessage()}", [
                'event_type' => $template->event_type,
                'to' => $to,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Preview a template with sample data
     */
    public static function preview(string $eventType): ?array
    {
        $template = EmailTemplate::getActiveTemplate($eventType);

        if (!$template) {
            return null;
        }

        $sampleData = self::generateSampleData($template->available_variables ?? []);

        return [
            'subject' => $template->parseSubject($sampleData),
            'body' => $template->parse($sampleData),
            'variables' => $sampleData,
        ];
    }

    /**
     * Check if a template exists and is active for an event type
     */
    public static function hasTemplate(string $eventType): bool
    {
        return EmailTemplate::where('event_type', $eventType)
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Get all available event types
     */
    public static function getEventTypes(): array
    {
        return EmailTemplate::getEventTypes();
    }

    /**
     * Parse comma-separated emails into array
     */
    private static function parseEmails(string $emails): array
    {
        if (empty($emails)) {
            return [];
        }

        return array_filter(
            array_map('trim', explode(',', $emails)),
            fn($email) => filter_var($email, FILTER_VALIDATE_EMAIL)
        );
    }

    /**
     * Generate sample data for preview
     */
    private static function generateSampleData(array $variables): array
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
            'department' => 'Science',
            'designation' => 'Teacher',
            'application_id' => 'APP-' . date('Y') . '-0042',
            'grade_applied' => 'Grade 5',
            'submission_date' => date('F j, Y'),
            'joining_date' => date('F j, Y'),
            'reporting_to' => 'Principal',
            'documents_needed' => 'Birth Certificate, Previous Report Card',
            'deadline' => date('F j, Y', strtotime('+7 days')),
            'upload_link' => config('app.url') . '/upload',
            'next_steps' => 'Please complete the fee payment and submit remaining documents.',
            'reason' => 'All seats for the requested grade are currently filled.',
            'waitlist_position' => '3',
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
            'verification_link' => config('app.url') . '/verify-email/token',
        ];

        $result = [];
        foreach ($variables as $variable) {
            $result[$variable] = $sampleValues[$variable] ?? "{{$variable}}";
        }

        return $result;
    }
}

/**
 * Simple Mailable for template-based emails
 */
class TemplateMailable extends Mailable
{
    public function __construct(
        private string $subject,
        private string $body,
        private ?string $fromName = null,
        private ?string $fromEmail = null,
        private ?string $replyTo = null,
    ) {}

    public function build(): self
    {
        $mail = $this->subject($this->subject)
            ->html($this->body);

        if ($this->fromName && $this->fromEmail) {
            $mail->from($this->fromEmail, $this->fromName);
        }

        if ($this->replyTo) {
            $mail->replyTo($this->replyTo);
        }

        return $mail;
    }
}

