<?php

use App\Http\Controllers\Auth\ParentAuthController;
use App\Http\Controllers\Enrollment\StudentController;
use App\Http\Controllers\StaffEnrollment\StaffController;
use App\Http\Controllers\StaffEnrollment\EnrollmentController;
use App\Http\Controllers\StaffEnrollment\EnrollmentSettingController;
use App\Http\Controllers\Calendar\CalendarController;
use App\Http\Controllers\Admission\AdmissionController;
use App\Http\Controllers\Admission\AdmissionSettingsController;
use App\Http\Controllers\Admission\AdmissionDocumentController;
use App\Http\Controllers\Admission\AdmissionPdfController;
use App\Http\Controllers\Admission\SchoolAdmissionController;
use App\Http\Controllers\Settings\EmailTemplateController;
use App\Http\Controllers\NotificationStudio\NotificationStudioController;
use App\Http\Controllers\NotificationStudio\NotificationFlowController;
use App\Http\Controllers\NotificationStudio\NotificationLogController;
use App\Http\Controllers\NotificationStudio\EmailSettingsController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// SEO: XML Sitemap for Google indexing and sitelinks
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Public Static Pages
Route::get('/about', function () {
    return Inertia::render('about');
})->name('about');

Route::get('/careers', function () {
    return Inertia::render('careers');
})->name('careers');

Route::get('/press-kit', function () {
    return Inertia::render('press-kit');
})->name('press-kit');

Route::get('/partners', function () {
    return Inertia::render('partners');
})->name('partners');

Route::get('/privacy-policy', function () {
    return Inertia::render('privacy-policy');
})->name('privacy-policy');

Route::get('/terms-of-service', function () {
    return Inertia::render('terms-of-service');
})->name('terms-of-service');

Route::get('/cookie-policy', function () {
    return Inertia::render('cookie-policy');
})->name('cookie-policy');

Route::get('/pricing', function () {
    return Inertia::render('pricing');
})->name('pricing');

Route::get('/help-center', function () {
    return Inertia::render('help-center');
})->name('help-center');

Route::get('/contact', function () {
    return Inertia::render('contact');
})->name('contact');

Route::get('/status', function () {
    return Inertia::render('status');
})->name('status');

Route::get('/security', function () {
    return Inertia::render('security');
})->name('security');

// SEO Landing Pages for Marketing Keywords
Route::get('/school-management-software', function () {
    return Inertia::render('seo/school-management-software');
})->name('seo.school-management');

Route::get('/edtech-school-management', function () {
    return Inertia::render('seo/edtech-school-management');
})->name('seo.edtech');

Route::get('/student-information-system', function () {
    return Inertia::render('seo/student-information-system');
})->name('seo.sis');

// Lead Capture Routes (Public)
// Lead form routes with spam protection and rate limiting
Route::middleware(['spam.protect', 'throttle:10,1'])->group(function () {
    Route::post('/leads/waitlist', [LeadController::class, 'waitlist'])->name('leads.waitlist');
    Route::post('/leads/demo', [LeadController::class, 'demo'])->name('leads.demo');
    Route::post('/leads/contact-sales', [LeadController::class, 'contactSales'])->name('leads.contact-sales');
    Route::post('/leads/free-trial', [LeadController::class, 'freeTrial'])->name('leads.free-trial');
    Route::post('/leads/partner', [LeadController::class, 'partner'])->name('leads.partner');
    Route::post('/leads/contact', [LeadController::class, 'contact'])->name('leads.contact');
});

// Public Documentation
Route::get('/docs', function () {
    return Inertia::render('docs/index');
})->name('docs');

Route::get('/docs/{section}/{article}', function ($section, $article) {
    return Inertia::render('docs/article', [
        'section' => $section,
        'article' => $article,
    ]);
})->name('docs.article');

Route::middleware(['auth', 'verified', 'checkUser:school'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Support Tickets (Raise Ticket Feature)
    Route::prefix('support')->name('support.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Support\SupportTicketController::class, 'dashboard'])->name('dashboard');
        Route::get('tickets', [\App\Http\Controllers\Support\SupportTicketController::class, 'index'])->name('tickets.index');
        Route::get('tickets/create', [\App\Http\Controllers\Support\SupportTicketController::class, 'create'])->name('tickets.create');
        Route::post('tickets', [\App\Http\Controllers\Support\SupportTicketController::class, 'store'])->name('tickets.store');
        Route::get('tickets/{ticket}', [\App\Http\Controllers\Support\SupportTicketController::class, 'show'])->name('tickets.show');
        Route::post('tickets/{ticket}/reply', [\App\Http\Controllers\Support\SupportTicketController::class, 'addReply'])->name('tickets.reply');
    });


    // Enrolments (Student Admission) Dashboard
    Route::get('enrolments', [SchoolAdmissionController::class, 'dashboard'])->name('enrolments.dashboard');

    // Staff Enrollment
    Route::resource('staff', StaffController::class);
    Route::get('new-applicant-staff', [StaffController::class, 'newApplicants'])->name('staff.new-applicants');
    Route::get('onboarding', [StaffController::class, 'onboardingDashboard'])->name('onboarding.dashboard');
    Route::get('employee', [StaffController::class, 'employeeDashboard'])->name('employee.dashboard');
    Route::resource('staff-enrollment', EnrollmentController::class);
    Route::post('/staff-enrollment/{id}/approve', [EnrollmentController::class, 'approve']);
    Route::post('/staff-enrollment/{id}/reject', [EnrollmentController::class, 'reject']);
    Route::resource('staff-enrollment-settings', EnrollmentSettingController::class);

    // Student Onboarding
    Route::resource('admission', AdmissionController::class);
    Route::resource('admission-settings', AdmissionSettingsController::class);
    
    // School Admission Management (View forms submitted by parents)
    Route::get('school-admission', [SchoolAdmissionController::class, 'index'])->name('school-admission.index');
    Route::get('school-admission/{student}', [SchoolAdmissionController::class, 'show'])->name('school-admission.show');
    Route::get('school-admission/{student}/form/{form}', [SchoolAdmissionController::class, 'viewForm'])->name('school-admission.view-form');
    Route::post('school-admission/form/{admissionForm}/approve', [SchoolAdmissionController::class, 'approve'])->name('school-admission.approve');
    Route::post('school-admission/form/{admissionForm}/reject', [SchoolAdmissionController::class, 'reject'])->name('school-admission.reject');
    Route::post('school-admission/form/{admissionForm}/comment', [SchoolAdmissionController::class, 'addComment'])->name('school-admission.add-comment');
    Route::delete('school-admission/comment/{comment}', [SchoolAdmissionController::class, 'deleteComment'])->name('school-admission.delete-comment');
    Route::post('school-admission/{student}/enroll', [SchoolAdmissionController::class, 'enroll'])->name('school-admission.enroll');
    Route::get('school-admission/classes/{grade}', [SchoolAdmissionController::class, 'getClassesForGrade'])->name('school-admission.classes-for-grade');
    Route::get('school-admission/{student}/enrollment-history', [SchoolAdmissionController::class, 'getEnrollmentHistory'])->name('school-admission.enrollment-history');
    Route::post('school-admission/{student}/promote', [SchoolAdmissionController::class, 'promoteStudent'])->name('school-admission.promote');
    
    // School can review admission documents
    Route::post('school-admission/document/{document}/approve', [SchoolAdmissionController::class, 'approveDocument'])->name('school-admission.document.approve');
    Route::post('school-admission/document/{document}/reject', [SchoolAdmissionController::class, 'rejectDocument'])->name('school-admission.document.reject');
    
    // PDF Download routes for admission forms
    Route::get('school-admission/{student}/form/{form}/pdf', [AdmissionPdfController::class, 'downloadForm'])->name('school-admission.download-form');
    Route::get('school-admission/{student}/pdf/all', [AdmissionPdfController::class, 'downloadAllForms'])->name('school-admission.download-all-forms');

    // Calendar (School staff, admin, it_admin can access)
    Route::resource('calendar', CalendarController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('calendar/users/search', [CalendarController::class, 'searchUsers'])->name('calendar.users.search');
    Route::get('calendar/events', [CalendarController::class, 'events'])->name('calendar.events');
    Route::post('calendar/holiday', [CalendarController::class, 'storeHoliday'])->name('calendar.holiday.store');
    Route::put('calendar/holiday/{holiday}', [CalendarController::class, 'updateHoliday'])->name('calendar.holiday.update');
    Route::delete('calendar/holiday/{holiday}', [CalendarController::class, 'destroyHoliday'])->name('calendar.holiday.destroy');

    // Notification Studio
    Route::prefix('notification-studio')->name('notification-studio.')->group(function () {
        // Main dashboard
        Route::get('/', [NotificationStudioController::class, 'index'])->name('index');
        Route::get('/dashboard-data', [NotificationStudioController::class, 'dashboardData'])->name('dashboard-data');
        
        // Email Templates
        Route::prefix('templates')->name('templates.')->group(function () {
            Route::get('/', [EmailTemplateController::class, 'index'])->name('index');
            Route::get('/create', [EmailTemplateController::class, 'create'])->name('create');
            Route::post('/', [EmailTemplateController::class, 'store'])->name('store');
            Route::get('/{emailTemplate}', [EmailTemplateController::class, 'show'])->name('show');
            Route::get('/{emailTemplate}/edit', [EmailTemplateController::class, 'edit'])->name('edit');
            Route::put('/{emailTemplate}', [EmailTemplateController::class, 'update'])->name('update');
            Route::delete('/{emailTemplate}', [EmailTemplateController::class, 'destroy'])->name('destroy');
            Route::patch('/{emailTemplate}/toggle-status', [EmailTemplateController::class, 'toggleStatus'])->name('toggle-status');
            Route::post('/{emailTemplate}/duplicate', [EmailTemplateController::class, 'duplicate'])->name('duplicate');
            Route::get('/{emailTemplate}/preview', [EmailTemplateController::class, 'preview'])->name('preview');
        });
        Route::get('/templates-default', [EmailTemplateController::class, 'getDefaultTemplate'])->name('templates.get-default');
        Route::post('/templates-seed-defaults', [EmailTemplateController::class, 'seedDefaults'])->name('templates.seed-defaults');
        
        // Notification Flows
        Route::prefix('flows')->name('flows.')->group(function () {
            Route::get('/', [NotificationFlowController::class, 'index'])->name('index');
            Route::get('/create', [NotificationFlowController::class, 'create'])->name('create');
            Route::post('/', [NotificationFlowController::class, 'store'])->name('store');
            Route::get('/{flow}/edit', [NotificationFlowController::class, 'edit'])->name('edit');
            Route::put('/{flow}', [NotificationFlowController::class, 'update'])->name('update');
            Route::delete('/{flow}', [NotificationFlowController::class, 'destroy'])->name('destroy');
            Route::patch('/{flow}/toggle-status', [NotificationFlowController::class, 'toggleStatus'])->name('toggle-status');
            Route::post('/{flow}/duplicate', [NotificationFlowController::class, 'duplicate'])->name('duplicate');
            Route::post('/{flow}/test', [NotificationFlowController::class, 'test'])->name('test');
        });
        Route::get('/flows-defaults', [NotificationFlowController::class, 'getDefaults'])->name('flows.get-defaults');
        Route::post('/flows-seed-defaults', [NotificationFlowController::class, 'seedDefaults'])->name('flows.seed-defaults');
        
        // Notification Logs
        Route::prefix('logs')->name('logs.')->group(function () {
            Route::get('/', [NotificationLogController::class, 'index'])->name('index');
            Route::get('/{log}', [NotificationLogController::class, 'show'])->name('show');
            Route::post('/{log}/retry', [NotificationLogController::class, 'retry'])->name('retry');
            Route::post('/cleanup', [NotificationLogController::class, 'cleanup'])->name('cleanup');
            Route::get('/export/csv', [NotificationLogController::class, 'export'])->name('export');
        });
        
        // Email Settings
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [EmailSettingsController::class, 'index'])->name('index');
            Route::post('/', [EmailSettingsController::class, 'store'])->name('store');
            Route::post('/test', [EmailSettingsController::class, 'test'])->name('test');
            Route::patch('/toggle-status', [EmailSettingsController::class, 'toggleStatus'])->name('toggle-status');
        });
    });

    Route::get('storage-link', function () {
        Artisan::call('storage:link');
    });

    Route::get('/private-storage/{path}', function ($path) {
        $fullPath = storage_path('app/private/' . $path);
        
        if (!file_exists($fullPath)) {
            abort(404);
        }

        return response()->file($fullPath);
    })->where('path', '.*')->name('private.storage');

});

// Staff Enrollment Public
Route::get('apiv1/staff-enrollment/public', function () {
    return Inertia::render('modules/staff/PublicEnrollment');
})->name('enrollment.public');
Route::get('get-staff-enrollment-settings', [EnrollmentSettingController::class, 'index'])->name('public.enrollment.settings');


// Document view/download routes (accessible to authenticated users - both parents and school staff)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admission/document/{document}/view', [AdmissionDocumentController::class, 'view'])->name('admission.document.view');
    Route::get('admission/document/{document}/download', [AdmissionDocumentController::class, 'download'])->name('admission.document.download');
});

// In-App Notifications API
Route::middleware(['auth'])->prefix('api/notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('mark-as-read');
    Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
    Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
    Route::delete('/clear-all', [NotificationController::class, 'clearAll'])->name('clear-all');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/parents.php';
require __DIR__.'/developer.php';
require __DIR__.'/it-admin.php';
require __DIR__.'/admin.php';
require __DIR__.'/staff.php';
require __DIR__.'/student.php';