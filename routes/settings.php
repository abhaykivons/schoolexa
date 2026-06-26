<?php

use App\Http\Controllers\Approval\ApprovalFlowController;
use App\Http\Controllers\Settings\AcademicYearController;
use App\Http\Controllers\Settings\ClassAssignmentController;
use App\Http\Controllers\Settings\ClassController;
use App\Http\Controllers\Settings\DatabaseController;
use App\Http\Controllers\Settings\DepartmentController;
use App\Http\Controllers\Settings\DesignationController;
use App\Http\Controllers\Settings\GradeController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SubjectController;
use App\Http\Controllers\Settings\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'checkUser:school'])->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::resource('settings/academic-years', AcademicYearController::class);
    
    Route::get('/settings/users', [UserController::class, 'index'])->name('users.index');
    Route::patch('/settings/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::patch('/settings/users/{user}', [UserController::class, 'update'])->name('users.update');

    Route::patch('settings/academic-years/{academicYear}/set-current', [AcademicYearController::class, 'setCurrent'])->name('academic-years.set-current');
    Route::resource('settings/grades', GradeController::class);
    Route::post('settings/grades/reorder', [GradeController::class, 'reorder'])->name('grades.reorder');
    
    Route::resource('settings/designations', DesignationController::class);
    Route::post('settings/roles/{role}/permissions', [DesignationController::class, 'updatePermissions'])->name('roles.permissions.update');

    Route::resource('settings/departments', DepartmentController::class);
    
    Route::resource('settings/classes', ClassController::class);
    Route::resource('settings/subjects', SubjectController::class);
    Route::resource('settings/class-assignments', ClassAssignmentController::class);

    Route::prefix('approval-flows')->group(function () {
        Route::get('/', [ApprovalFlowController::class, 'index']);
        Route::post('/', [ApprovalFlowController::class, 'store']);
        Route::put('/{id}', [ApprovalFlowController::class, 'store']);
        Route::put('/{id}/status', [ApprovalFlowController::class, 'updateStatus']);
        Route::delete('/{id}', [ApprovalFlowController::class, 'destroy']);
    });

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
