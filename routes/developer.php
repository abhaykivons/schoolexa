<?php

use App\Http\Controllers\Developer\DashboardController;
use App\Http\Controllers\Developer\TenantController;
use App\Http\Controllers\Developer\ErrorLogController;
use App\Http\Controllers\Developer\DowntimeController;
use App\Http\Controllers\Developer\SupportController;
use App\Http\Controllers\Developer\LeadController;
use App\Http\Controllers\Module\ModuleController;
use App\Http\Controllers\Module\ModuleVersionController;
use App\Http\Controllers\Tenant\TenantModuleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Developer Portal Routes
|--------------------------------------------------------------------------
|
| These routes are for the developer portal that manages all tenants.
| Only accessible from central domain by users with 'developer' or 'it_admin' type.
|
*/

Route::middleware(['auth', 'developer'])->prefix('developer')->name('developer.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // Tenant Management
    Route::resource('tenants', TenantController::class);
    Route::post('tenants/{tenant}/domains', [TenantController::class, 'addDomain'])->name('tenants.add-domain');
    Route::delete('tenants/{tenant}/domains/{domain}', [TenantController::class, 'removeDomain'])->name('tenants.remove-domain');

    // Error Logs
    Route::prefix('logs')->name('logs.')->group(function () {
        Route::get('/', [ErrorLogController::class, 'index'])->name('index');
        Route::get('/{id}', [ErrorLogController::class, 'show'])->name('show');
        Route::post('/clear', [ErrorLogController::class, 'clear'])->name('clear');
    });

    // Downtime Management
    Route::resource('downtime', DowntimeController::class)->except(['show']);
    Route::get('downtime/{downtime}', [DowntimeController::class, 'show'])->name('downtime.show');

    // Support Tickets
    Route::prefix('support')->name('support.')->group(function () {
        Route::get('/', [SupportController::class, 'index'])->name('index');
        Route::get('/{ticket}', [SupportController::class, 'show'])->name('show');
        Route::put('/{ticket}', [SupportController::class, 'update'])->name('update');
        Route::post('/{ticket}/note', [SupportController::class, 'addNote'])->name('add-note');
    });

    // Module Management
    Route::prefix('modules')->name('modules.')->group(function () {
        Route::resource('modules', ModuleController::class);
        Route::resource('modules.versions', ModuleVersionController::class)->shallow();
    });

    // Tenant Module Management
    Route::prefix('tenants/{tenant}/modules')->name('tenants.modules.')->group(function () {
        Route::get('/', [TenantModuleController::class, 'index'])->name('index');
        Route::post('/enable', [TenantModuleController::class, 'enable'])->name('enable');
        Route::post('/disable', [TenantModuleController::class, 'disable'])->name('disable');
        Route::post('/update-version', [TenantModuleController::class, 'updateVersion'])->name('update-version');
        Route::get('/available-updates', [TenantModuleController::class, 'availableUpdates'])->name('available-updates');
    });

    // Leads Management (Developer Portal Only)
    Route::prefix('leads')->name('leads.')->group(function () {
        Route::get('/', [LeadController::class, 'index'])->name('index');
        Route::get('/statistics', [LeadController::class, 'statistics'])->name('statistics');
        Route::get('/export', [LeadController::class, 'export'])->name('export');
        Route::get('/{lead}', [LeadController::class, 'show'])->name('show');
        Route::put('/{lead}', [LeadController::class, 'update'])->name('update');
        Route::patch('/{lead}/status', [LeadController::class, 'updateStatus'])->name('update-status');
        Route::delete('/{lead}', [LeadController::class, 'destroy'])->name('destroy');
        Route::post('/bulk-update-status', [LeadController::class, 'bulkUpdateStatus'])->name('bulk-update-status');
        Route::post('/bulk-delete', [LeadController::class, 'bulkDelete'])->name('bulk-delete');
    });
});
