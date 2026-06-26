<?php

namespace App\Http\Controllers\Admission;

use App\Http\Controllers\Controller;
use App\Helpers\AdmissionFormHelper;
use App\Models\AcademicYear;
use App\Models\AdmissionDocument;
use App\Models\AdmissionForm;
use App\Models\AdmissionFormComment;
use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Staff;
use App\Models\Student;
use App\Models\StudentAdmissionForm;
use App\Models\StudentEnrollment;
use App\Models\User;
use App\Enum\StudentStatus;
use App\Notifications\EnrolledSuccessfully;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SchoolAdmissionController extends Controller
{
    /**
     * Display the enrolments dashboard (stats and recent students).
     */
    public function dashboard()
    {
        $authUser = Auth::user();

        $formTemplates = StudentAdmissionForm::where('company_id', $authUser->company_id)
            ->where('is_active', 1)
            ->get();
        $requiredFormsCount = $formTemplates->where('required', 1)->count();

        $students = Student::with(['admissionForms.form', 'admissionForms.comments', 'grade', 'parent'])
            ->whereNotNull('parent_id')
            ->get()
            ->map(function ($student) use ($requiredFormsCount) {
                $admissionForms = $student->admissionForms;
                $approvedForms = $admissionForms->where('status', 'approved')->count();
                $pendingForms = $admissionForms->where('status', 'submitted')->count();
                $draftForms = $admissionForms->where('status', 'draft')->count();
                $rejectedForms = $admissionForms->where('status', 'rejected')->count();
                $requiredFormsApproved = $admissionForms->filter(function ($af) {
                    return $af->form && $af->form->required == 1 && $af->status === 'approved';
                })->count();

                $overallStatus = 'not_started';
                if ($student->status?->value === StudentStatus::Enrolled->value) {
                    $overallStatus = 'enrolled';
                } elseif ($requiredFormsApproved === $requiredFormsCount && $requiredFormsCount > 0) {
                    $overallStatus = 'ready_to_enroll';
                } elseif ($pendingForms > 0) {
                    $overallStatus = 'pending_approval';
                } elseif ($rejectedForms > 0) {
                    $overallStatus = 'has_rejections';
                } elseif ($draftForms > 0 || $admissionForms->where('status', 'submitted')->count() > 0) {
                    $overallStatus = 'in_progress';
                }

                $updatedAt = $admissionForms->max('updated_at');
                return [
                    'id' => $student->id,
                    'name' => $student->first_name . ' ' . $student->last_name,
                    'grade' => $student->grade?->name ?? 'Not assigned',
                    'parent_name' => $student->parent?->name ?? 'Unknown',
                    'overall_status' => $overallStatus,
                    'progress_percentage' => $requiredFormsCount > 0
                        ? round(($requiredFormsApproved / $requiredFormsCount) * 100)
                        : 0,
                    'updated_at' => $updatedAt?->format('M d, Y H:i'),
                    'updated_at_iso' => $updatedAt?->toIso8601String() ?? now()->toIso8601String(),
                ];
            });

        $pendingCount = $students->where('overall_status', 'pending_approval')->count();
        $inProgressCount = $students->whereIn('overall_status', ['in_progress', 'has_rejections'])->count();
        $readyToEnrollCount = $students->where('overall_status', 'ready_to_enroll')->count();
        $enrolledCount = $students->where('overall_status', 'enrolled')->count();
        $notStartedCount = $students->where('overall_status', 'not_started')->count();

        $recentStudents = $students->sortByDesc('updated_at_iso')->take(5)->values()->map(function ($s) {
            unset($s['updated_at_iso']);
            return $s;
        });

        $stats = [
            'total_students' => $students->count(),
            'pending_count' => $pendingCount,
            'in_progress_count' => $inProgressCount,
            'ready_to_enroll_count' => $readyToEnrollCount,
            'enrolled_count' => $enrolledCount,
            'not_started_count' => $notStartedCount,
        ];

        return Inertia::render('enrolments/dashboard', [
            'stats' => $stats,
            'recentStudents' => $recentStudents,
        ]);
    }

    /**
     * Display students with their admission form progress
     */
    public function index()
    {
        $authUser = Auth::user();
        
        // Get form templates
        $formTemplates = StudentAdmissionForm::where('company_id', $authUser->company_id)
            ->where('is_active', 1)
            ->get();
        
        $requiredFormsCount = $formTemplates->where('required', 1)->count();
        $totalFormsCount = $formTemplates->count();

        // Get all students with their admission forms
        $students = Student::with(['admissionForms.form', 'admissionForms.comments', 'grade', 'parent'])
            ->whereNotNull('parent_id')
            ->get()
            ->map(function ($student) use ($formTemplates, $requiredFormsCount) {
                $admissionForms = $student->admissionForms;
                
                // Calculate form progress
                $submittedForms = $admissionForms->count();
                $approvedForms = $admissionForms->where('status', 'approved')->count();
                $pendingForms = $admissionForms->where('status', 'submitted')->count();
                $draftForms = $admissionForms->where('status', 'draft')->count();
                $rejectedForms = $admissionForms->where('status', 'rejected')->count();
                
                // Check required forms
                $requiredFormsSubmitted = $admissionForms->filter(function ($af) {
                    return $af->form && $af->form->required == 1;
                })->count();
                
                $requiredFormsApproved = $admissionForms->filter(function ($af) {
                    return $af->form && $af->form->required == 1 && $af->status === 'approved';
                })->count();

                // Count unresolved comments
                $unresolvedComments = $admissionForms->sum(function ($af) {
                    return $af->comments->where('is_resolved', false)->count();
                });

                // Determine overall status
                $overallStatus = 'not_started';
                if ($student->status?->value === StudentStatus::Enrolled->value) {
                    $overallStatus = 'enrolled';
                } elseif ($requiredFormsApproved === $requiredFormsCount && $requiredFormsCount > 0) {
                    $overallStatus = 'ready_to_enroll';
                } elseif ($pendingForms > 0) {
                    $overallStatus = 'pending_approval';
                } elseif ($rejectedForms > 0) {
                    $overallStatus = 'has_rejections';
                } elseif ($draftForms > 0 || $submittedForms > 0) {
                    $overallStatus = 'in_progress';
                }

                return [
                    'id' => $student->id,
                    'name' => $student->first_name . ' ' . $student->last_name,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'grade' => $student->grade?->name ?? 'Not assigned',
                    'parent_name' => $student->parent?->name ?? 'Unknown',
                    'parent_email' => $student->parent?->email ?? '',
                    'status' => $student->status?->value ?? 0,
                    'status_label' => $student->status?->label() ?? 'Draft',
                    'overall_status' => $overallStatus,
                    'forms_submitted' => $submittedForms,
                    'forms_approved' => $approvedForms,
                    'forms_pending' => $pendingForms,
                    'forms_draft' => $draftForms,
                    'forms_rejected' => $rejectedForms,
                    'required_forms_submitted' => $requiredFormsSubmitted,
                    'required_forms_approved' => $requiredFormsApproved,
                    'unresolved_comments' => $unresolvedComments,
                    'progress_percentage' => $requiredFormsCount > 0 
                        ? round(($requiredFormsApproved / $requiredFormsCount) * 100) 
                        : 0,
                    'updated_at' => $admissionForms->max('updated_at')?->format('M d, Y H:i'),
                ];
            });

        // Group students by status
        $pendingStudents = $students->filter(fn($s) => $s['overall_status'] === 'pending_approval')->values();
        $inProgressStudents = $students->filter(fn($s) => in_array($s['overall_status'], ['in_progress', 'has_rejections']))->values();
        $readyToEnrollStudents = $students->filter(fn($s) => $s['overall_status'] === 'ready_to_enroll')->values();
        $enrolledStudents = $students->filter(fn($s) => $s['overall_status'] === 'enrolled')->values();
        $notStartedStudents = $students->filter(fn($s) => $s['overall_status'] === 'not_started')->values();

        return Inertia::render('modules/student-admission/index', [
            'students' => $students,
            'pendingStudents' => $pendingStudents,
            'inProgressStudents' => $inProgressStudents,
            'readyToEnrollStudents' => $readyToEnrollStudents,
            'enrolledStudents' => $enrolledStudents,
            'notStartedStudents' => $notStartedStudents,
            'formTemplates' => $formTemplates,
            'stats' => [
                'total_students' => $students->count(),
                'pending_count' => $pendingStudents->count(),
                'in_progress_count' => $inProgressStudents->count(),
                'ready_to_enroll_count' => $readyToEnrollStudents->count(),
                'enrolled_count' => $enrolledStudents->count(),
                'required_forms_count' => $requiredFormsCount,
                'total_forms_count' => $totalFormsCount,
            ]
        ]);
    }

    /**
     * Show all forms for a specific student (like parent view but for school)
     */
    public function show(string $studentId)
    {
        $authUser = Auth::user();
        
        $student = Student::with(['grade', 'parent'])->findOrFail($studentId);

        // Get all form templates
        $formTemplates = StudentAdmissionForm::where('company_id', $authUser->company_id)
            ->where('is_active', 1)
            ->orderBy('priority')
            ->get();

        // Get all admission forms for this student with comments
        $admissionForms = AdmissionForm::with(['form', 'user', 'approver', 'comments.user'])
            ->where('student_id', $student->id)
            ->get()
            ->keyBy('form_id');

        // Get grades for form display
        $grades = Grade::where('company_id', $authUser->company_id)->get();

        // Calculate stats
        $requiredForms = $formTemplates->where('required', 1);
        $requiredFormsApproved = $requiredForms->filter(function ($form) use ($admissionForms) {
            $af = $admissionForms->get($form->id);
            return $af && $af->status === 'approved';
        })->count();

        $allRequiredApproved = $requiredFormsApproved === $requiredForms->count() && $requiredForms->count() > 0;

        // Transform admission forms for frontend
        $transformedForms = $admissionForms->map(function ($af) {
            return [
                'id' => $af->id,
                'form_id' => $af->form_id,
                'form_type' => $af->form_type,
                'status' => $af->status,
                'version' => $af->version,
                'submitted_by' => $af->user?->name ?? 'Unknown',
                'submitted_at' => $af->updated_at?->format('M d, Y H:i'),
                'approved_by' => $af->approver?->name ?? null,
                'approved_at' => $af->approved_at?->format('M d, Y H:i'),
                'has_pending_changes' => !empty($af->approved_data) && 
                    json_encode($af->approved_data) !== json_encode($af->latest_data),
                'comments' => $af->comments->map(function ($comment) {
                    return [
                        'id' => $comment->id,
                        'field_name' => $comment->field_name,
                        'comment' => $comment->comment,
                        'is_resolved' => $comment->is_resolved,
                        'user_name' => $comment->user?->name ?? 'Unknown',
                        'created_at' => $comment->created_at?->format('M d, Y H:i'),
                    ];
                }),
                'unresolved_comments_count' => $af->comments->where('is_resolved', false)->count(),
            ];
        });

        // Get current academic year
        $currentAcademicYear = AcademicYear::where('current', true)->first();

        // Get available classes for the student's grade with capacity info
        $availableClasses = SchoolClass::with(['classTeacher.enrollment', 'grade'])
            ->where('grade_id', $student->grade_id)
            ->active()
            ->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'grade_id' => $class->grade_id,
                    'grade_name' => $class->grade?->name,
                    'capacity' => $class->capacity,
                    'current_strength' => $class->current_strength,
                    'available_seats' => $class->available_seats,
                    'is_full' => $class->is_full,
                    'class_teacher_id' => $class->staff_id,
                    'class_teacher_name' => $class->classTeacher?->enrollment?->full_legal_name ?? 'Not Assigned',
                ];
            });

        return Inertia::render('modules/student-admission/show', [
            'student' => [
                'id' => $student->id,
                'name' => $student->first_name . ' ' . $student->last_name,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'grade' => $student->grade?->name ?? 'Not assigned',
                'grade_id' => $student->grade_id,
                'parent_name' => $student->parent?->name ?? 'Unknown',
                'parent_email' => $student->parent?->email ?? '',
                'status' => $student->status?->value ?? 0,
                'status_label' => $student->status?->label() ?? 'Draft',
            ],
            'formTemplates' => $formTemplates,
            'admissionForms' => $transformedForms,
            'grades' => $grades,
            'allRequiredApproved' => $allRequiredApproved,
            'availableClasses' => $availableClasses,
            'currentAcademicYear' => $currentAcademicYear ? [
                'id' => $currentAcademicYear->id,
                'name' => $currentAcademicYear->name,
            ] : null,
            'stats' => [
                'total_forms' => $formTemplates->count(),
                'required_forms' => $requiredForms->count(),
                'submitted_forms' => $admissionForms->count(),
                'approved_forms' => $admissionForms->where('status', 'approved')->count(),
                'pending_forms' => $admissionForms->where('status', 'submitted')->count(),
                'required_approved' => $requiredFormsApproved,
            ]
        ]);
    }

    /**
     * View specific form details with data - SAME as parent view but for school
     */
    public function viewForm(string $studentId, string $formSlug)
    {
        $authUser = Auth::user();
        
        $student = Student::with(['grade', 'parent'])->findOrFail($studentId);

        $form = StudentAdmissionForm::where('slug', $formSlug)
            ->where('company_id', $authUser->company_id)
            ->where('is_active', 1)
            ->firstOrFail();

        $admissionForm = AdmissionForm::with(['comments.user', 'comments.replier'])
            ->where('student_id', $student->id)
            ->where('form_id', $form->id)
            ->first();

        $grades = Grade::where('company_id', $authUser->company_id)->get();

        // Prepare form data - SAME structure as parent controller
        $approvedData = [];
        $latestData = [];
        $formData = [];
        
        if ($admissionForm) {
            $approvedData = AdmissionFormHelper::denormalizeFormData($admissionForm->approved_data ?? []);
            $latestData = AdmissionFormHelper::denormalizeFormData($admissionForm->latest_data ?? []);
            // For display: use latest data (what parent submitted)
            $formData = $latestData;
        }

        // Get comments organized by field
        $commentsByField = [];
        $globalComments = [];
        
        if ($admissionForm) {
            foreach ($admissionForm->comments as $comment) {
                $commentData = [
                    'id' => $comment->id,
                    'field_name' => $comment->field_name,
                    'comment' => $comment->comment,
                    'reply' => $comment->reply,
                    'reply_by_name' => $comment->replier?->name,
                    'reply_at' => $comment->reply_at?->format('M d, Y H:i'),
                    'is_resolved' => $comment->is_resolved,
                    'user_name' => $comment->user?->name ?? 'Unknown',
                    'created_at' => $comment->created_at?->format('M d, Y H:i'),
                ];
                
                if ($comment->field_name) {
                    if (!isset($commentsByField[$comment->field_name])) {
                        $commentsByField[$comment->field_name] = [];
                    }
                    $commentsByField[$comment->field_name][] = $commentData;
                } else {
                    $globalComments[] = $commentData;
                }
            }
        }

        // Get uploaded documents for this form
        $documents = [];
        if ($admissionForm) {
            $documents = AdmissionDocument::where('admission_form_id', $admissionForm->id)
                ->where('student_id', $student->id)
                ->orderBy('document_type')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'type' => $doc->document_type,
                        'type_label' => $doc->document_type_label,
                        'file_name' => $doc->original_filename,
                        'file_size' => $doc->file_size,
                        'formatted_size' => $doc->formatted_size,
                        'upload_date' => $doc->created_at->format('Y-m-d'),
                        'uploaded_at' => $doc->created_at->format('M d, Y H:i'),
                        'status' => $doc->status,
                        'is_watermarked' => $doc->is_watermarked,
                        'file_url' => $doc->file_url,
                        'download_url' => route('admission.document.download', ['document' => $doc->id]),
                        'review_notes' => $doc->review_notes,
                        'reviewed_by' => $doc->reviewer?->name,
                        'reviewed_at' => $doc->reviewed_at?->format('M d, Y H:i'),
                        'is_pdf' => $doc->isPdf(),
                        'is_image' => $doc->isImage(),
                    ];
                });
        }

        // Get available classes for the student's grade
        $availableClasses = SchoolClass::with(['classTeacher.enrollment', 'grade'])
            ->where('grade_id', $student->grade_id)
            ->active()
            ->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'grade_id' => $class->grade_id,
                    'grade_name' => $class->grade?->name,
                    'capacity' => $class->capacity,
                    'current_strength' => $class->current_strength,
                    'available_seats' => $class->available_seats,
                    'is_full' => $class->is_full,
                    'class_teacher_id' => $class->staff_id,
                    'class_teacher_name' => $class->classTeacher?->enrollment?->full_legal_name ?? 'Not Assigned',
                ];
            });

        // Return SAME data structure as parent, plus school-specific data
        return Inertia::render('modules/student-admission/school-forms/index', [
            // Same props as parent view
            'student' => $student,
            'form' => $form,
            'admissionForm' => $admissionForm,
            'formData' => $formData,
            'approvedData' => $approvedData,
            'latestData' => $latestData,
            'grades' => $grades,
            // School-specific props
            'viewMode' => 'school',
            'commentsByField' => $commentsByField,
            'globalComments' => $globalComments,
            'documents' => $documents,
            'availableClasses' => $availableClasses,
        ]);
    }

    /**
     * Add comment to a form (global or field-specific)
     */
    public function addComment(Request $request, string $admissionFormId)
    {
        $request->validate([
            'comment' => 'required|string|max:1000',
            'field_name' => 'nullable|string|max:255',
        ]);

        $admissionForm = AdmissionForm::findOrFail($admissionFormId);

        AdmissionFormComment::create([
            'admission_form_id' => $admissionForm->id,
            'user_id' => Auth::id(),
            'field_name' => $request->field_name,
            'comment' => $request->comment,
        ]);

        return back()->with('success', 'Comment added successfully');
    }

    /**
     * Delete a comment
     */
    public function deleteComment(string $commentId)
    {
        $comment = AdmissionFormComment::findOrFail($commentId);
        
        // Only allow deletion if user owns the comment or is admin
        if ($comment->user_id !== Auth::id()) {
            abort(403, 'You can only delete your own comments');
        }

        $comment->delete();

        return back()->with('success', 'Comment deleted');
    }

    /**
     * Approve a specific admission form
     */
    public function approve(Request $request, string $id)
    {
        $admissionForm = AdmissionForm::with('student')->findOrFail($id);

        DB::beginTransaction();
        try {
            $admissionForm->approve(Auth::id());
            
            // Mark all comments as resolved when form is approved
            $admissionForm->comments()->update([
                'is_resolved' => true,
                'resolved_at' => now(),
            ]);
            
            DB::commit();

            // Send admission approved notification
            if ($admissionForm->student) {
                try {
                    NotificationService::admissionApproved($admissionForm->student);
                } catch (\Exception $e) {
                    Log::warning('Failed to send admission approved notification', [
                        'student_id' => $admissionForm->student?->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return back()->with('success', 'Form approved successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to approve form: ' . $e->getMessage());
        }
    }

    /**
     * Reject a specific admission form
     */
    public function reject(Request $request, string $id)
    {
        $admissionForm = AdmissionForm::with('student')->findOrFail($id);

        DB::beginTransaction();
        try {
            $admissionForm->reject();
            DB::commit();

            // Send admission rejected notification
            if ($admissionForm->student) {
                try {
                    $validated = $request->validate([
                        'reason' => 'nullable|string|max:1000',
                    ]);
                    $reason = $validated['reason'] ?? 'Your admission application has been rejected.';
                    NotificationService::admissionRejected($admissionForm->student, $reason);
                } catch (\Exception $e) {
                    Log::warning('Failed to send admission rejected notification', [
                        'student_id' => $admissionForm->student?->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return back()->with('success', 'Form rejected');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to reject form: ' . $e->getMessage());
        }
    }

    /**
     * Approve a document
     */
    public function approveDocument(Request $request, string $documentId)
    {
        $document = AdmissionDocument::with('student')->findOrFail($documentId);
        
        // Verify document belongs to company
        if ($document->company_id !== Auth::user()->company_id) {
            abort(403, 'Unauthorized');
        }

        $document->approve(Auth::id(), $request->notes);

        // Send document approved notification
        try {
            NotificationService::documentApproved($document);
        } catch (\Exception $e) {
            Log::warning('Failed to send document approved notification', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
        }

        return back()->with('success', 'Document approved successfully');
    }

    /**
     * Reject a document
     */
    public function rejectDocument(Request $request, string $documentId)
    {
        $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        $document = AdmissionDocument::with('student')->findOrFail($documentId);
        
        // Verify document belongs to company
        if ($document->company_id !== Auth::user()->company_id) {
            abort(403, 'Unauthorized');
        }

        $document->reject(Auth::id(), $request->notes);

        // Send document rejected notification
        try {
            NotificationService::documentRejected($document, $request->notes);
        } catch (\Exception $e) {
            Log::warning('Failed to send document rejected notification', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
        }

        return back()->with('success', 'Document rejected. Parent has been notified.');
    }

    /**
     * Get classes available for a grade (with capacity check)
     */
    public function getClassesForGrade(Request $request, string $gradeId)
    {
        $classes = SchoolClass::with(['classTeacher.enrollment', 'grade'])
            ->where('grade_id', $gradeId)
            ->active()
            ->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'grade_id' => $class->grade_id,
                    'grade_name' => $class->grade?->name,
                    'capacity' => $class->capacity,
                    'current_strength' => $class->current_strength,
                    'available_seats' => $class->available_seats,
                    'is_full' => $class->is_full,
                    'class_teacher_id' => $class->staff_id,
                    'class_teacher_name' => $class->classTeacher?->enrollment?->full_legal_name ?? 'Not Assigned',
                ];
            });

        return response()->json($classes);
    }

    /**
     * Final enrollment - mark student as enrolled
     * - Generate unique student ID
     * - Create user account for student
     * - Assign class (with capacity check)
     * - Assign class teacher
     * - Create enrollment record
     */
    public function enroll(Request $request, string $studentId)
    {
        $authUser = Auth::user();
        
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'create_login' => 'boolean',
        ]);

        $student = Student::with(['parent', 'grade'])->findOrFail($studentId);


        if ($student->status === StudentStatus::Enrolled) {
            return back()->with('error', 'Student is already enrolled.');
        }


        // Check if all required forms are approved
        $formTemplates = StudentAdmissionForm::where('company_id', $authUser->company_id)
            ->where('is_active', 1)
            ->where('required', 1)
            ->get();

        $admissionForms = AdmissionForm::where('student_id', $student->id)->get();

        $allRequiredApproved = $formTemplates->every(function ($form) use ($admissionForms) {
            $af = $admissionForms->firstWhere('form_id', $form->id);
            return $af && $af->status === 'approved';
        });

        if (!$allRequiredApproved) {
            return back()->with('error', 'Cannot enroll student. Not all required forms are approved.');
        }

        // Verify class exists and has capacity
        $selectedClass = SchoolClass::with('classTeacher')->findOrFail($request->class_id);
        
        if (!$selectedClass->hasCapacity()) {
            return back()->with('error', 'Selected class is full. Please choose another class.');
        }

        // Verify class is for the correct grade
        if ($selectedClass->grade_id !== $student->grade_id) {
            return back()->with('error', 'Selected class does not match student\'s grade.');
        }

        // Get current academic year
        $currentAcademicYear = AcademicYear::where('current', true)->first();
        if (!$currentAcademicYear) {
            return back()->with('error', 'No active academic year found. Please set up the academic year first.');
        }

        DB::beginTransaction();
        try {
            // 1. Generate unique student ID
            $studentIdNumber = Student::generateStudentId($authUser->company_id);

            // 2. Create user account for student (if requested or by default)
            $studentUser = null;
            $generatedPassword = null;
            
            if ($request->create_login !== false) {
                $generatedPassword = Str::random(8);
                
                // Create email from student name or use parent email with suffix
                $studentEmail = $this->generateStudentEmail($student, $authUser->company_id);
                
                $studentUser = User::create([
                    'name' => $student->first_name . ' ' . $student->last_name,
                    'email' => $studentEmail,
                    'password' => Hash::make($generatedPassword),
                    'company_id' => $authUser->company_id,
                    'type' => 'student',
                    'status' => true,
                    'is_login' => true,
                    'created_by' => $authUser->id,
                ]);

                // Assign student role
                $studentUser->assignRole('Student');
            }

            // 3. Update student record
            $student->student_id = $studentIdNumber;
            $student->user_id = $studentUser?->id;
            $student->teacher_id = $selectedClass->staff_id;
            $student->status = StudentStatus::Enrolled;
            $student->enrollment_date = now();
            $student->is_login = $studentUser ? true : false;
            $student->save();

            // 4. Create enrollment record for this academic year
            $enrollment = StudentEnrollment::create([
                'company_id' => $authUser->company_id,
                'student_id' => $student->id,
                'academic_year_id' => $currentAcademicYear->id,
                'grade_id' => $student->grade_id,
                'class_id' => $selectedClass->id,
                'class_teacher_id' => $selectedClass->staff_id,
                'roll_number' => StudentEnrollment::generateRollNumber($selectedClass->id, $currentAcademicYear->id),
                'enrollment_date' => now(),
                'status' => StudentEnrollment::STATUS_ACTIVE,
            ]);

            DB::commit();

            // Send notification via Notification Studio
            try {
                // Trigger the student_enrolled notification flow
                NotificationService::studentEnrolled($student, $enrollment, $generatedPassword);
            } catch (\Exception $e) {
                // Log but don't fail enrollment
                Log::info('Failed to send enrollment notification: ' . $e->getMessage());
            }

            $successMessage = 'Student enrolled successfully! Student ID: ' . $studentIdNumber;
            if ($generatedPassword) {
                $successMessage .= ' | Temporary Password: ' . $generatedPassword;
            }

            return back()->with('success', $successMessage);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::info('Enrollment failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to enroll student: ' . $e->getMessage());
        }
    }

    /**
     * Generate a unique email for student
     */
    private function generateStudentEmail(Student $student, $companyId): string
    {
        $baseName = Str::slug($student->first_name . '.' . $student->last_name, '.');
        $email = $baseName . '@student.local';
        
        // Check if email exists and append number if needed
        $counter = 1;
        while (User::where('email', $email)->where('company_id', $companyId)->exists()) {
            $email = $baseName . $counter . '@student.local';
            $counter++;
        }
        
        return $email;
    }

    /**
     * Get student enrollment history (year-wise records)
     */
    public function getEnrollmentHistory(string $studentId)
    {
        $student = Student::with([
            'enrollments' => function ($query) {
                $query->with(['academicYear', 'grade', 'schoolClass', 'classTeacher.enrollment'])
                    ->orderBy('academic_year_id', 'desc');
            }
        ])->findOrFail($studentId);

        $history = $student->enrollments->map(function ($enrollment) {
            return [
                'id' => $enrollment->id,
                'academic_year' => $enrollment->academicYear?->name,
                'academic_year_id' => $enrollment->academic_year_id,
                'grade' => $enrollment->grade?->name,
                'class' => $enrollment->schoolClass?->name,
                'class_teacher' => $enrollment->classTeacher?->enrollment?->full_legal_name ?? 'N/A',
                'roll_number' => $enrollment->roll_number,
                'enrollment_date' => $enrollment->enrollment_date?->format('M d, Y'),
                'leaving_date' => $enrollment->leaving_date?->format('M d, Y'),
                'status' => $enrollment->status,
                'status_label' => $enrollment->status_label,
            ];
        });

        return response()->json([
            'student_id' => $student->student_id,
            'student_name' => $student->full_name,
            'history' => $history,
        ]);
    }

    /**
     * Promote students to next academic year
     */
    public function promoteStudent(Request $request, string $studentId)
    {
        $request->validate([
            'new_academic_year_id' => 'required|exists:academic_years,id',
            'new_grade_id' => 'required|exists:grades,id',
            'new_class_id' => 'required|exists:school_classes,id',
            'remarks' => 'nullable|string|max:500',
        ]);

        $student = Student::with('currentEnrollment')->findOrFail($studentId);

        if (!$student->currentEnrollment) {
            return back()->with('error', 'Student has no active enrollment to promote from.');
        }

        // Check class capacity
        $newClass = SchoolClass::findOrFail($request->new_class_id);
        if (!$newClass->hasCapacity()) {
            return back()->with('error', 'Selected class is full.');
        }

        $previousEnrollment = $student->currentEnrollment;

        DB::beginTransaction();
        try {
            $newEnrollment = $student->currentEnrollment->promoteToNextYear(
                $request->new_academic_year_id,
                $request->new_grade_id,
                $request->new_class_id,
                $request->remarks
            );

            if (!$newEnrollment) {
                throw new \Exception('Failed to create promotion record.');
            }

            // Update student's current grade and teacher
            $student->update([
                'grade_id' => $request->new_grade_id,
                'teacher_id' => $newClass->staff_id,
            ]);

            DB::commit();

            // Send student promoted notification
            try {
                NotificationService::studentPromoted($student, $newEnrollment, $previousEnrollment);
            } catch (\Exception $e) {
                Log::warning('Failed to send student promoted notification', [
                    'student_id' => $student->id,
                    'error' => $e->getMessage()
                ]);
            }

            return back()->with('success', 'Student promoted successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to promote student: ' . $e->getMessage());
        }
    }
}
