<?php

namespace App\Http\Controllers\Admission;

use App\Http\Controllers\Controller;
use App\Helpers\AdmissionFormHelper;
use App\Models\AdmissionDocument;
use App\Models\AdmissionForm;
use App\Models\AdmissionFormComment;
use App\Models\Grade;
use App\Models\Student;
use App\Models\StudentAdmissionForm;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdmissionController extends Controller
{

    /**
     * This form is for display in parent panel
     */
    public function index()
    {
        $forms = Student::whereNull('enrollment_date')
            ->where('status', 0)
            ->get();
        return Inertia::render('modules/student-admission/forms/index', [
            'forms' => $forms,
        ]);
    }
    /**
     * This form is submit from parent panel
     */
    public function store(Request $request)
    {
        $request->validate([
            'form_id' => 'required|integer|exists:student_admission_forms,id',
        ]);

        $student = Student::where('id', $request->student_id)
            ->where('parent_id', Auth::id())
            ->firstOrFail();

        $form = StudentAdmissionForm::findOrFail($request->form_id);
        $formType = AdmissionFormHelper::getFormTypeFromSlug($form->slug) 
            ?? AdmissionFormHelper::getFormTypeFromId($form->id);

        if (!$formType) {
            return back()->with('error', 'Invalid form type');
        }

        // Single field update (edit mode)
        if ($request->has('key') && $request->has('value')) {
            return $this->updateField($student->id, $form->id, $formType, $request);
        }

        // Full form submission
        return $this->submitForm($student->id, $form->id, $formType, $request);
    }

    /**
     * This form is submit from parent panel
     * 
     * Flow:
     * - First submission: Status = 'submitted' (ready for school approval)
     * - If already approved: Status = 'submitted' (changes need re-approval)
     */
    private function submitForm(int $studentId, int $formId, string $formType, Request $request)
    {
        DB::beginTransaction();
        try {
            // Normalize form data
            $formData = AdmissionFormHelper::normalizeFormData(
                $request->except(['_token', '_method', 'form_id', 'student_id'])
            );

            // Get or create admission form
            $admissionForm = AdmissionForm::firstOrNew([
                'student_id' => $studentId,
                'form_id' => $formId,
            ], [
                'user_id' => Auth::id(),
                'form_type' => $formType,
                'status' => 'draft',
                'version' => 0,
            ]);

            // Check if form was previously approved
            $wasApproved = !empty($admissionForm->approved_data);

            // Update latest data (encryption happens automatically via cast)
            $admissionForm->latest_data = $formData;
            $admissionForm->user_id = Auth::id();
            $admissionForm->version = ($admissionForm->version ?? 0) + 1;
            
            // Set status based on approval state
            if ($wasApproved) {
                // After approval: Changes need re-approval
                $admissionForm->status = 'submitted';
            } else {
                // First submission: Ready for initial approval
                $admissionForm->status = 'submitted';
            }
            
            $admissionForm->save();

            DB::commit();

            // Send admission form submitted notification (only for first submission or after changes)
            if (!$wasApproved) {
                try {
                    NotificationService::admissionFormSubmitted($admissionForm);
                } catch (\Exception $e) {
                    Log::warning('Failed to send admission form submitted notification', [
                        'form_id' => $admissionForm->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            $message = $wasApproved 
                ? 'Form updated successfully. Changes pending approval.'
                : 'Form submitted successfully. Awaiting school approval.';
                
            return back()->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to submit form: ' . $e->getMessage());
        }
    }

    /**
     * Update single field
     * 
     * Flow:
     * - Before approval: Parent can update freely, no approval needed
     * - After approval: Updates require approval (status becomes 'submitted' with pending changes)
     */
    private function updateField(int $studentId, int $formId, string $formType, Request $request)
    {
        $request->validate([
            'key' => 'required|string',
            'value' => 'required',
        ]);

        try {
            $admissionForm = AdmissionForm::where('student_id', $studentId)
                ->where('form_id', $formId)
                ->first();

            if (!$admissionForm) {
                return back()->with('error', 'Form submission not found');
            }

            // Get current latest data (decrypted automatically by cast)
            $latestData = $admissionForm->latest_data ?? [];

            // Normalize the new value
            $normalizedValue = is_bool($request->value) 
                ? ($request->value ? '1' : '0')
                : (is_array($request->value) ? $request->value : (string) $request->value);

            // Update the specific field
            $latestData[$request->key] = $normalizedValue;

            // Determine status based on approval state
            // If form was previously approved, new changes need approval
            // If form was never approved, parent can update freely
            $wasApproved = !empty($admissionForm->approved_data);
            
            if ($wasApproved) {
                // After approval: Changes need approval
                $admissionForm->status = 'submitted'; // Pending approval for changes
            } else {
                // Before approval: Parent can update freely
                $admissionForm->status = 'draft'; // Still in draft, no approval needed yet
            }

            // Update the form (encryption happens automatically via cast)
            $admissionForm->latest_data = $latestData;
            $admissionForm->user_id = Auth::id();
            $admissionForm->version = ($admissionForm->version ?? 0) + 1;
            $admissionForm->save();

            $message = $wasApproved 
                ? 'Field updated successfully. Changes pending approval.'
                : 'Field updated successfully.';

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update field: ' . $e->getMessage());
        }
    }

    /**
     * Approve form (admin only)
     */
    public function approve(Request $request, int $id)
    {
        $admissionForm = AdmissionForm::findOrFail($id);
        
        // Check permissions (add your permission logic here)
        // if (!Auth::user()->can('approve_admission_forms')) {
        //     abort(403);
        // }

        DB::beginTransaction();
        try {
            $admissionForm->approve(Auth::id());
            DB::commit();
            return back()->with('success', 'Form approved successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to approve form: ' . $e->getMessage());
        }
    }

    /**
     * Reject form (admin only)
     */
    public function reject(Request $request, int $id)
    {
        $admissionForm = AdmissionForm::findOrFail($id);
        
        // Check permissions (add your permission logic here)

        DB::beginTransaction();
        try {
            $admissionForm->reject();
            DB::commit();
            return back()->with('success', 'Form rejected');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to reject form: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $authUser = Auth::user();
        $student = Student::with('grade')
            ->where('id', $id)
            ->where('parent_id', $authUser->id)
            ->firstOrFail();

        if ($student->status == 1) {
            abort(403, 'No further actions are allowed.');
        }

        $forms = StudentAdmissionForm::where('company_id', $authUser->company_id)
            ->where('is_active', 1)
            ->get();
        
        // Get all admission forms for this student with comments count
        $admissionForms = AdmissionForm::withCount(['comments', 'comments as unresolved_comments_count' => function ($query) {
                $query->where('is_resolved', false);
            }])
            ->where('student_id', $student->id)
            ->get()
            ->keyBy('form_id');

        return Inertia::render('modules/parent/student/show', [
            'student' => $student,
            'forms' => $forms,
            'admissionForms' => $admissionForms,
        ]);
    }

    /**
     * Show specific form
     */
    public function showForms(string $studentId, string $formId)
    {
        $authUser = Auth::user();
        
        $student = Student::with('grade')
            ->where('id', $studentId)
            ->where('parent_id', $authUser->id)
            ->firstOrFail();

        $form = StudentAdmissionForm::where('slug', $formId)
            ->where('company_id', $authUser->company_id)
            ->where('is_active', 1)
            ->firstOrFail();

        // Get or create admission form (needed for document uploads)
        // For forms that support document uploads, we need to create a draft record
        $formType = AdmissionFormHelper::getFormTypeFromSlug($form->slug) 
            ?? AdmissionFormHelper::getFormTypeFromId($form->id);

        $admissionForm = AdmissionForm::with(['comments.user', 'comments.replier', 'documents'])
            ->where('student_id', $student->id)
            ->where('form_id', $form->id)
            ->first();

        // Auto-create a draft admission form if one doesn't exist
        // This is needed for document uploads to work before form submission
        if (!$admissionForm) {
            $admissionForm = AdmissionForm::create([
                'student_id' => $student->id,
                'form_id' => $form->id,
                'user_id' => $authUser->id,
                'form_type' => $formType ?? 'unknown',
                'status' => 'draft',
                'version' => 0,
                'latest_data' => [],
            ]);
            
            // Reload with relationships
            $admissionForm->load(['comments.user', 'comments.replier', 'documents']);
        }

        $grades = Grade::where('company_id', $authUser->company_id)->get();

        // Prepare data for frontend
        // Display logic:
        // - If approved_data exists, show that (official approved version)
        // - If only latest_data exists, show that (pending approval)
        // - When parent edits, they edit latest_data (creates new pending version)
        $approvedData = [];
        $latestData = [];
        $displayData = [];
        
        $approvedData = AdmissionFormHelper::denormalizeFormData($admissionForm->approved_data ?? []);
        $latestData = AdmissionFormHelper::denormalizeFormData($admissionForm->latest_data ?? []);
        
        // For display: use approved_data if available, otherwise latest_data
        // This ensures users see the approved version when it exists
        $displayData = !empty($admissionForm->approved_data) 
            ? $approvedData 
            : $latestData;

        // Get comments organized by field
        $commentsByField = [];
        $globalComments = [];
        
        foreach ($admissionForm->comments as $comment) {
            $commentData = [
                'id' => $comment->id,
                'field_name' => $comment->field_name,
                'comment' => $comment->comment,
                'reply' => $comment->reply,
                'reply_by_name' => $comment->replier?->name,
                'reply_at' => $comment->reply_at?->format('M d, Y H:i'),
                'is_resolved' => $comment->is_resolved,
                'user_name' => $comment->user?->name ?? 'School',
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

        // Get uploaded documents
        $documents = $admissionForm->documents->map(function ($doc) {
            return [
                'id' => $doc->id,
                'type' => $doc->document_type,
                'file_name' => $doc->original_filename,
                'file_size' => $doc->file_size,
                'formatted_size' => $doc->formatted_size,
                'upload_date' => $doc->created_at->format('Y-m-d'),
                'status' => $doc->status,
                'is_watermarked' => $doc->is_watermarked,
                'file_url' => $doc->file_url,
                'review_notes' => $doc->review_notes,
            ];
        });

        return Inertia::render('modules/student-admission/forms/index', [
            'student' => $student,
            'form' => $form,
            'admissionForm' => $admissionForm,
            'formData' => $displayData, // Data to display (approved if available, otherwise latest)
            'approvedData' => $approvedData, // Approved version (for reference)
            'latestData' => $latestData, // Latest submitted version (pending approval)
            'grades' => $grades,
            'commentsByField' => $commentsByField,
            'globalComments' => $globalComments,
            'documents' => $documents, // Uploaded documents
        ]);
    }

    /**
     * Parent replies to a comment
     */
    public function replyToComment(Request $request, int $commentId)
    {
        $request->validate([
            'reply' => 'required|string|max:1000',
        ]);

        $comment = AdmissionFormComment::with('admissionForm.student')
            ->findOrFail($commentId);

        // Verify parent owns this student
        if (!$comment->admissionForm || !$comment->admissionForm->student || $comment->admissionForm->student->parent_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $comment->addReply($request->reply, Auth::id());

        return back()->with('success', 'Reply sent successfully');
    }

    /**
     * Parent marks a comment as resolved
     */
    public function resolveComment(int $commentId)
    {
        $comment = AdmissionFormComment::with('admissionForm.student')
            ->findOrFail($commentId);

        // Verify parent owns this student
        if (!$comment->admissionForm || !$comment->admissionForm->student || $comment->admissionForm->student->parent_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $comment->update([
            'is_resolved' => true,
            'resolved_at' => now(),
            'resolved_by' => Auth::id(),
        ]);

        return back()->with('success', 'Comment marked as resolved');
    }

    /**
     * Send approval request - updates all admission forms for a student to 'submitted' status
     */
    public function sendApprovalRequest(Request $request, int $studentId)
    {
        $authUser = Auth::user();
        
        // Verify parent owns this student
        $student = Student::where('id', $studentId)
            ->where('parent_id', $authUser->id)
            ->firstOrFail();

        // Get all active forms for this company
        $activeForms = StudentAdmissionForm::where('company_id', $authUser->company_id)
            ->where('is_active', 1)
            ->pluck('id');

        // Get all admission forms for this student
        $admissionForms = AdmissionForm::where('student_id', $student->id)
            ->whereIn('form_id', $activeForms)
            ->get();

        // Check if all required forms are submitted
        if ($admissionForms->isEmpty()) {
            return back()->with('error', 'No forms have been submitted yet.');
        }

        // Check if all forms count matches active forms count
        if ($admissionForms->count() < $activeForms->count()) {
            return back()->with('error', 'Please complete all required forms before sending approval request.');
        }

        DB::beginTransaction();
        try {
            // Update all admission forms status to 'submitted'
            AdmissionForm::where('student_id', $student->id)
                ->whereIn('form_id', $activeForms)
                ->update(['status' => 'submitted']);

            DB::commit();

            // Send notification to parent confirming submission
            try {
                // Get first admission form to use for notification
                $firstForm = $admissionForms->first();
                if ($firstForm) {
                    NotificationService::admissionFormSubmitted($firstForm);
                }
            } catch (\Exception $e) {
                Log::warning('Failed to send approval request notification', [
                    'student_id' => $student->id,
                    'error' => $e->getMessage()
                ]);
            }

            return back()->with('success', 'Approval request sent successfully. The school will review your application.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to send approval request: ' . $e->getMessage());
        }
    }
}
