<?php

use App\Http\Controllers\Admin\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Portal Routes (Dean/Principal/Admin)
|--------------------------------------------------------------------------
|
| These routes are for administrators who can see all reports and manage staff access.
|
*/

Route::middleware(['auth', 'verified', 'portal:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // Reports
    // Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    
    // Staff Management
    // Route::resource('staff', StaffController::class);
    
    // Add more Admin routes here
});
