<?php

use App\Http\Controllers\Staff\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Staff Portal Routes
|--------------------------------------------------------------------------
|
| These routes are for staff members with role-based access.
| IT Admins can also access this portal to help staff and users.
|
*/

Route::middleware(['auth', 'verified', 'portal:staff'])->prefix('staff')->name('staff.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // Add more Staff routes here
});
