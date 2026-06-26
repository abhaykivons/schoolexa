<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;

class ProcessScheduledNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:process-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process pending scheduled notifications that are due';

    /**
     * Execute the console command.
     */
    public function handle(NotificationService $notificationService): int
    {
        $this->info('Processing scheduled notifications...');

        $count = $notificationService->processScheduledNotifications();

        $this->info("Processed {$count} scheduled notifications.");

        return Command::SUCCESS;
    }
}

