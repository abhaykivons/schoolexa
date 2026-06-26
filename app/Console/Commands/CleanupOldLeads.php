<?php

namespace App\Console\Commands;

use App\Models\Lead;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupOldLeads extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leads:cleanup 
                            {--days=90 : Delete leads older than this many days}
                            {--status=lost : Only delete leads with this status}
                            {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old leads to save database space';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $status = $this->option('status');
        $dryRun = $this->option('dry-run');

        $this->info("Cleaning up leads older than {$days} days with status '{$status}'...");

        $query = Lead::where('created_at', '<', now()->subDays($days));

        // Only delete specific status if provided
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $count = $query->count();

        if ($count === 0) {
            $this->info('No leads to clean up.');
            return Command::SUCCESS;
        }

        if ($dryRun) {
            $this->info("Would delete {$count} leads (dry run).");
            
            // Show sample of what would be deleted
            $samples = $query->take(5)->get(['id', 'name', 'email', 'type', 'status', 'created_at']);
            $this->table(
                ['ID', 'Name', 'Email', 'Type', 'Status', 'Created'],
                $samples->map(fn($l) => [$l->id, $l->name, $l->email, $l->type, $l->status, $l->created_at->format('Y-m-d')])
            );
            
            return Command::SUCCESS;
        }

        // Confirm before deletion
        if (!$this->confirm("This will delete {$count} leads. Continue?")) {
            $this->info('Cleanup cancelled.');
            return Command::SUCCESS;
        }

        // Delete in chunks to avoid memory issues
        $deleted = 0;
        $query->chunkById(100, function ($leads) use (&$deleted) {
            foreach ($leads as $lead) {
                $lead->delete();
                $deleted++;
            }
        });

        $this->info("Successfully deleted {$deleted} old leads.");
        Log::info("Leads cleanup: Deleted {$deleted} leads older than {$days} days with status '{$status}'.");

        return Command::SUCCESS;
    }
}
