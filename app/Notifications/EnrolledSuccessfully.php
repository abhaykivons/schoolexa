<?php

namespace App\Notifications;

use App\Models\Student;
use App\Models\StudentEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EnrolledSuccessfully extends Notification
{
    use Queueable;

    protected $student;
    protected $enrollment;
    protected $password;

    /**
     * Create a new notification instance.
     */
    public function __construct(Student $student, StudentEnrollment $enrollment, ?string $password = null)
    {
        $this->student = $student;
        $this->enrollment = $enrollment;
        $this->password = $password;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
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
        $message = (new MailMessage)
            ->subject('Student Enrollment Successful - ' . $this->student->full_name)
            ->greeting('Dear Parent,')
            ->line('We are pleased to inform you that your child has been successfully enrolled.')
            ->line('**Student Details:**')
            ->line('- **Name:** ' . $this->student->full_name)
            ->line('- **Student ID:** ' . $this->student->student_id)
            ->line('- **Grade:** ' . $this->enrollment->grade?->name)
            ->line('- **Class:** ' . $this->enrollment->schoolClass?->name)
            ->line('- **Roll Number:** ' . $this->enrollment->roll_number)
            ->line('- **Academic Year:** ' . $this->enrollment->academicYear?->name);

        if ($this->password) {
            $message->line('')
                ->line('**Student Login Credentials:**')
                ->line('- **Email:** ' . $this->student->user?->email)
                ->line('- **Temporary Password:** ' . $this->password)
                ->line('')
                ->line('Please ask your child to change the password upon first login.');
        }

        $message->line('')
            ->line('We look forward to a successful academic year!')
            ->salutation('Best regards,')
            ->salutation('The School Administration');

        return $message;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'student_id' => $this->student->id,
            'student_name' => $this->student->full_name,
            'enrollment_id' => $this->enrollment->id,
        ];
    }
}
