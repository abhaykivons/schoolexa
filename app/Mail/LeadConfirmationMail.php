<?php

namespace App\Mail;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeadConfirmationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Lead $lead;
    public string $leadType;

    /**
     * Create a new message instance.
     */
    public function __construct(Lead $lead)
    {
        $this->lead = $lead;
        $this->leadType = $lead->type;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subjects = [
            'free_trial' => 'Welcome to SchoolExa! Your Free Trial is Ready',
            'demo' => 'Your SchoolExa Demo Request Received',
            'partner' => 'Thank You for Your Partner Application - SchoolExa',
            'contact_sales' => 'Thank You for Contacting SchoolExa Sales',
            'contact' => 'We Received Your Message - SchoolExa',
            'waitlist' => 'You\'re on the SchoolExa Waitlist!',
        ];

        return new Envelope(
            subject: $subjects[$this->leadType] ?? 'Thank You for Contacting SchoolExa',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.lead-confirmation',
            with: [
                'lead' => $this->lead,
                'leadType' => $this->leadType,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
