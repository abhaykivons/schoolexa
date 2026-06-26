<?php

use App\Http\Controllers\ItAdmin\DashboardController;
use App\Http\Controllers\ItAdmin\UserController;
use App\Http\Controllers\ItAdmin\ImpersonationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| IT Admin Portal Routes
|--------------------------------------------------------------------------
|
| These routes are for the IT Admin portal that manages all technical aspects
| of the school system. IT Admins can manage users and access staff portal
| for their school only.
|
*/

Route::middleware(['auth', 'verified', 'it_admin'])->prefix('it-admin')->name('it-admin.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // User Management (IT Admin can only manage users from their school)
    Route::resource('users', UserController::class);

    // Safe Login / Impersonation
    Route::prefix('impersonate')->name('impersonate.')->group(function () {
        Route::post('/login-as/{user}', [ImpersonationController::class, 'loginAs'])->name('login-as');
        Route::post('/return', [ImpersonationController::class, 'returnToItAdmin'])->name('return');
        Route::get('/info', [ImpersonationController::class, 'getImpersonationInfo'])->name('info');
    });
});
