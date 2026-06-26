<?php

use App\Http\Controllers\Student\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Student Portal Routes
|--------------------------------------------------------------------------
|
| These routes are for students to view their timetable, attendance, reports, and exam schedule.
|
*/

Route::middleware(['auth', 'verified', 'portal:student'])->prefix('student')->name('student.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // Timetable
    // Route::get('/timetable', [TimetableController::class, 'index'])->name('timetable.index');
    
    // Attendance
    // Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    
    // Reports
    // Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    
    // Exam Schedule
    // Route::get('/exams', [ExamController::class, 'index'])->name('exams.index');
    
    // Add more Student routes here
});
