<?php

namespace App\Http\Controllers\Admission;

use App\Http\Controllers\Controller;
use App\Helpers\AdmissionFormHelper;
use App\Models\AdmissionDocument;
use App\Models\AdmissionForm;
use App\Models\Grade;
use App\Models\Student;
use App\Models\StudentAdmissionForm;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class AdmissionPdfController extends Controller
{
    /**
     * Download a single form as PDF
     */
    public function downloadForm(string $studentId, string $formSlug)
    {
        $authUser = Auth::user();
        
        // Verify access - school staff only
        if (!in_array($authUser->type, ['school', 'staff', 'admin', 'it_admin'])) {
            abort(403, 'Unauthorized');
        }

        $student = Student::with(['grade', 'parent'])->findOrFail($studentId);
        
        $form = StudentAdmissionForm::where('slug', $formSlug)
            ->where('company_id', $authUser->company_id)
            ->firstOrFail();

        $admissionForm = AdmissionForm::with(['documents'])
            ->where('student_id', $student->id)
            ->where('form_id', $form->id)
            ->first();

        if (!$admissionForm) {
            abort(404, 'Form not submitted yet');
        }

        $grades = Grade::where('company_id', $authUser->company_id)->get();
        
        // Denormalize form data
        $formData = AdmissionFormHelper::denormalizeFormData($admissionForm->latest_data ?? []);

        // Get documents grouped by type
        $documents = $admissionForm->documents->groupBy('document_type');

        // Get company info
        $company = $authUser->company;

        // Select template based on form type
        $template = $this->getTemplateForForm($form->slug);

        $pdf = Pdf::loadView($template, [
            'student' => $student,
            'form' => $form,
            'admissionForm' => $admissionForm,
            'formData' => $formData,
            'grades' => $grades,
            'documents' => $documents,
            'company' => $company,
            'generatedAt' => now()->format('F d, Y h:i A'),
        ]);

        $pdf->setPaper('A4', 'portrait');
        
        $filename = $this->sanitizeFilename($student->first_name . '_' . $student->last_name . '_' . $form->name) . '.pdf';
        
        return $pdf->download($filename);
    }

    /**
     * Download all forms for a student as separate PDFs in a ZIP file
     */
    public function downloadAllForms(string $studentId)
    {
        $authUser = Auth::user();
        
        // Verify access - school staff only
        if (!in_array($authUser->type, ['school', 'staff', 'admin', 'it_admin'])) {
            abort(403, 'Unauthorized');
        }

        $student = Student::with(['grade', 'parent'])->findOrFail($studentId);
        
        $formTemplates = StudentAdmissionForm::where('company_id', $authUser->company_id)
            ->where('is_active', 1)
            ->orderBy('priority')
            ->get();

        $admissionForms = AdmissionForm::with(['documents', 'form'])
            ->where('student_id', $student->id)
            ->get()
            ->keyBy('form_id');

        $grades = Grade::where('company_id', $authUser->company_id)->get();
        $company = $authUser->company;

        // Create a temporary directory for PDFs
        $tempDir = sys_get_temp_dir() . '/admission_forms_' . uniqid();
        mkdir($tempDir, 0755, true);

        $pdfFiles = [];

        // Generate individual PDFs for each submitted form
        foreach ($formTemplates as $formTemplate) {
            $admissionForm = $admissionForms->get($formTemplate->id);
            
            if ($admissionForm && $admissionForm->status !== 'draft') {
                $formData = AdmissionFormHelper::denormalizeFormData($admissionForm->latest_data ?? []);
                $documents = $admissionForm->documents->groupBy('document_type');
                
                // Get template for this form
                $template = $this->getTemplateForForm($formTemplate->slug);
                
                $pdf = Pdf::loadView($template, [
                    'student' => $student,
                    'form' => $formTemplate,
                    'admissionForm' => $admissionForm,
                    'formData' => $formData,
                    'grades' => $grades,
                    'documents' => $documents,
                    'company' => $company,
                    'generatedAt' => now()->format('F d, Y h:i A'),
                ]);

                $pdf->setPaper('A4', 'portrait');
                
                // Create filename with form number for ordering
                $formNumber = str_pad($formTemplate->priority ?? $formTemplate->id, 2, '0', STR_PAD_LEFT);
                $pdfFilename = $formNumber . '_' . $this->sanitizeFilename($formTemplate->name) . '.pdf';
                $pdfPath = $tempDir . '/' . $pdfFilename;
                
                $pdf->save($pdfPath);
                $pdfFiles[] = $pdfPath;
            }
        }

        // If no forms were generated, return error
        if (empty($pdfFiles)) {
            // Clean up temp directory
            $this->removeDirectory($tempDir);
            abort(404, 'No submitted forms found for this student');
        }

        // Create ZIP file
        $studentName = $this->sanitizeFilename($student->first_name . '_' . $student->last_name);
        $zipFilename = $studentName . '_Admission_Forms_' . date('Y-m-d') . '.zip';
        $zipPath = $tempDir . '/' . $zipFilename;

        $zip = new \ZipArchive();
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            $this->removeDirectory($tempDir);
            abort(500, 'Failed to create ZIP file');
        }

        // Add all PDFs to ZIP
        foreach ($pdfFiles as $pdfFile) {
            $zip->addFile($pdfFile, basename($pdfFile));
        }

        $zip->close();

        // Return ZIP file for download and clean up after
        return response()->download($zipPath, $zipFilename)->deleteFileAfterSend(true);
    }

    /**
     * Remove directory and its contents
     */
    private function removeDirectory(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                $this->removeDirectory($path);
            } else {
                unlink($path);
            }
        }
        rmdir($dir);
    }

    /**
     * Get the template path for a form
     * Returns specific template if exists, otherwise falls back to generic
     */
    private function getTemplateForForm(string $slug): string
    {
        $templates = [
            'pre-enrollment-form' => 'pdf.admission.pre-enrollment',
            'health-summary-form' => 'pdf.admission.health-summary',
            'document-checklist-form' => 'pdf.admission.document-checklist',
        ];

        $template = $templates[$slug] ?? 'pdf.admission.generic';
        
        // Check if template exists, fallback to generic if not
        if (!view()->exists($template)) {
            return 'pdf.admission.generic';
        }
        
        return $template;
    }

    /**
     * Sanitize filename
     */
    private function sanitizeFilename(string $filename): string
    {
        return preg_replace('/[^A-Za-z0-9_\-]/', '_', $filename);
    }
}

