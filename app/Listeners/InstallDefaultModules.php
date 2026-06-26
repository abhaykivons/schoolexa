<?php

namespace App\Listeners;

use App\Services\ModuleService;
use Stancl\Tenancy\Events\TenantCreated;
use Illuminate\Support\Facades\Log;

class InstallDefaultModules
{
    protected $moduleService;

    public function __construct(ModuleService $moduleService)
    {
        $this->moduleService = $moduleService;
    }

    /**
     * Handle the event.
     */
    public function handle(TenantCreated $event): void
    {
        try {
            $this->moduleService->installDefaultModules($event->tenant->id);
        } catch (\Exception $e) {
            Log::error("Failed to install default modules for tenant {$event->tenant->id}: " . $e->getMessage());
        }
    }
}
