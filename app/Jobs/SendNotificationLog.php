<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Sends a single notification log entry off the request thread.
 *
 * Delivery (SMTP/in-app) previously ran synchronously inside the HTTP request;
 * this job moves it to the queue so requests return immediately and failed
 * sends get retried. With QUEUE_CONNECTION=sync it still runs inline.
 */
class SendNotificationLog implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Seconds to wait before retrying a failed attempt.
     */
    public int $backoff = 30;

    public function __construct(public NotificationLog $log) {}

    public function handle(NotificationService $service): void
    {
        $service->processLog($this->log);
    }
}
