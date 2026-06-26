<?php

use App\Http\Controllers\Admission\AdmissionController;
use App\Http\Controllers\Admission\AdmissionDocumentController;
use App\Http\Controllers\Parent\Student\StudentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'checkUser:parent'])->prefix('parent')->name('parent.')->group(function () {

    // Students
    Route::resource('students', StudentController::class);
    Route::post('students/{student}/photo', [StudentController::class, 'uploadPhoto'])->name('students.photo.upload');
    Route::delete('students/{student}/photo', [StudentController::class, 'removePhoto'])->name('students.photo.remove');
    
    Route::resource('admission', AdmissionController::class);

    Route::get('admission/{student}/{forms}', [AdmissionController::class, 'showForms'])->name('admission.forms');
    Route::post('admission/submit-form', [AdmissionController::class, 'store'])->name('forms.submit');
    Route::post('admission/comment/{comment}/reply', [AdmissionController::class, 'replyToComment'])->name('comment.reply');
    Route::post('admission/comment/{comment}/resolve', [AdmissionController::class, 'resolveComment'])->name('comment.resolve');
    Route::post('admission/{student}/send-approval', [AdmissionController::class, 'sendApprovalRequest'])->name('admission.send-approval');

    // Admission Document Upload/Management
    Route::post('admission/document/upload', [AdmissionDocumentController::class, 'upload'])->name('admission.document.upload');
    Route::get('admission/documents', [AdmissionDocumentController::class, 'index'])->name('admission.documents');
    Route::delete('admission/document/{document}', [AdmissionDocumentController::class, 'destroy'])->name('admission.document.delete');
    
    // Calendar (Parents can view events they're invited to, but cannot create/edit/delete)
    Route::get('calendar/events', [CalendarController::class, 'events'])->name('calendar.events');
    Route::get('calendar', [CalendarController::class, 'index'])->name('calendar.index');
});