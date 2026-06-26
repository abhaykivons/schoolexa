<?php

namespace App\Notifications;

use App\Models\EmailTemplate;
use App\Models\NotificationFlow;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class CustomResetPassword extends Notification
{
    use Queueable;

    /**
     * The password reset token.
     */
    public string $token;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        // Determine user type and get appropriate template
        $userType = $notifiable->type ?? 'user';
        $eventType = match($userType) {
            'parent' => 'parent_password_reset',
            'school' => 'staff_password_reset',
            default => 'parent_password_reset',
        };

        // Try to get custom template
        $template = EmailTemplate::where('event_type', $eventType)
            ->where('is_active', true)
            ->first();

        if ($template) {
            $variables = [
                'parent_name' => $notifiable->name,
                'staff_name' => $notifiable->name,
                'reset_link' => $resetUrl,
                'expiry_time' => config('auth.passwords.users.expire', 60) . ' minutes',
                'school_name' => config('app.name'),
            ];

            $subject = $template->parseSubject($variables);
            $body = $template->parse($variables);

            return (new MailMessage)
                ->subject($subject)
                ->view('mail.custom-html', ['body' => $body]);
        }

        // Fallback to default
        return (new MailMessage)
            ->subject(Lang::get('Reset Password Notification'))
            ->line(Lang::get('You are receiving this email because we received a password reset request for your account.'))
            ->action(Lang::get('Reset Password'), $resetUrl)
            ->line(Lang::get('This password reset link will expire in :count minutes.', ['count' => config('auth.passwords.users.expire', 60)]))
            ->line(Lang::get('If you did not request a password reset, no further action is required.'));
    }
}

