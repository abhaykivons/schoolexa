<?php

namespace App\Http\Controllers\Admission;

use App\Http\Controllers\Controller;
use App\Models\AdmissionDocument;
use App\Models\AdmissionForm;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Helpers\WatermarkedPdf;

class AdmissionDocumentController extends Controller
{
    /**
     * Allowed file types that support watermarking
     */
    private array $allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
    ];

    /**
     * Max file size in bytes (10MB)
     */
    private int $maxFileSize = 10485760;

    /**
     * Upload a document
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'document_type' => 'required|string',
            'admission_form_id' => 'required|integer|exists:admission_forms,id',
            'student_id' => 'required|integer|exists:students,id',
        ]);

        // Verify parent owns this student
        $student = Student::where('id', $request->student_id)
            ->where('parent_id', Auth::id())
            ->firstOrFail();

        // Verify admission form belongs to student
        $admissionForm = AdmissionForm::where('id', $request->admission_form_id)
            ->where('student_id', $student->id)
            ->firstOrFail();

        $file = $request->file('file');

        // Validate file type - only allow types we can watermark
        $mimeType = $file->getMimeType();
        if (!in_array($mimeType, $this->allowedMimeTypes)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid file type. Only PDF, JPEG, and PNG files are allowed (these formats support watermarking).'
            ], 422);
        }

        // Validate file size
        if ($file->getSize() > $this->maxFileSize) {
            return response()->json([
                'success' => false,
                'message' => 'File too large. Maximum size is 10MB'
            ], 422);
        }

        try {
            // Get company name for watermark
            $companyName = Auth::user()->company?->name ?? 'School';

            // Generate secure filename
            $originalFilename = $file->getClientOriginalName();
            $extension = strtolower($file->getClientOriginalExtension());
            $storedFilename = Str::slug(pathinfo($originalFilename, PATHINFO_FILENAME)) 
                . '-' . uniqid() 
                . '-' . time() 
                . '.' . $extension;

            // Define storage path
            $storagePath = "admission_documents/{$student->id}/{$admissionForm->id}";
            $fullPath = $storagePath . '/' . $storedFilename;

            // Process and store file with watermark
            $isWatermarked = false;
            
            if ($mimeType === 'application/pdf') {
                // Add watermark to PDF
                $tempInputPath = $file->getRealPath();
                $tempOutputPath = sys_get_temp_dir() . '/' . $storedFilename;
                
                $this->addWatermarkToPdf($tempInputPath, $tempOutputPath, $companyName);
                
                // Store watermarked PDF
                Storage::disk('private')->put($fullPath, file_get_contents($tempOutputPath));
                
                // Clean up temp file
                if (file_exists($tempOutputPath)) {
                    unlink($tempOutputPath);
                }
                
                $isWatermarked = true;
            } else {
                // Add watermark to images
                $watermarkedContent = $this->addWatermarkToImage($file, $companyName);
                Storage::disk('private')->put($fullPath, $watermarkedContent);
                $isWatermarked = true;
            }

            // Create database record
            $document = AdmissionDocument::create([
                'admission_form_id' => $admissionForm->id,
                'student_id' => $student->id,
                'uploaded_by' => Auth::id(),
                'document_type' => $request->document_type,
                'original_filename' => $originalFilename,
                'stored_filename' => $storedFilename,
                'file_path' => $fullPath,
                'mime_type' => $mimeType,
                'file_size' => $file->getSize(),
                'is_watermarked' => $isWatermarked,
                'status' => 'pending',
                'company_id' => Auth::user()->company_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded and watermarked successfully',
                'document' => [
                    'id' => $document->id,
                    'type' => $document->document_type,
                    'file_name' => $document->original_filename,
                    'file_size' => $document->file_size,
                    'formatted_size' => $document->formatted_size,
                    'upload_date' => $document->created_at->format('Y-m-d'),
                    'status' => $document->status,
                    'is_watermarked' => $document->is_watermarked,
                    'file_url' => $document->file_url,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Document upload failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get documents for a form
     */
    public function index(Request $request)
    {
        $request->validate([
            'admission_form_id' => 'required|integer|exists:admission_forms,id',
            'student_id' => 'required|integer|exists:students,id',
        ]);

        // Verify parent owns this student
        $student = Student::where('id', $request->student_id)
            ->where('parent_id', Auth::id())
            ->firstOrFail();

        $documents = AdmissionDocument::where('admission_form_id', $request->admission_form_id)
            ->where('student_id', $student->id)
            ->orderBy('document_type')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($doc) {
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

        return response()->json([
            'success' => true,
            'documents' => $documents,
        ]);
    }

    /**
     * Delete a document
     */
    public function destroy(Request $request, int $documentId)
    {
        $document = AdmissionDocument::findOrFail($documentId);

        // Verify parent owns this student
        $student = Student::where('id', $document->student_id)
            ->where('parent_id', Auth::id())
            ->firstOrFail();

        // Don't allow deletion of approved documents
        if ($document->status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete approved documents'
            ], 403);
        }

        try {
            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document'
            ], 500);
        }
    }

    /**
     * View/Download a document
     */
    public function view(int $documentId)
    {
        $document = AdmissionDocument::findOrFail($documentId);

        // Verify user has access (parent or school staff)
        $user = Auth::user();
        $hasAccess = false;

        // Check if parent owns this student
        if ($user->type === 'parent') {
            $hasAccess = Student::where('id', $document->student_id)
                ->where('parent_id', $user->id)
                ->exists();
        }

        // Check if school staff from same company
        if (in_array($user->type, ['school', 'staff', 'admin', 'it_admin'])) {
            $hasAccess = $user->company_id === $document->company_id;
        }

        if (!$hasAccess) {
            abort(403, 'Unauthorized access to document');
        }

        if (!Storage::disk('private')->exists($document->file_path)) {
            abort(404, 'Document not found');
        }

        $fileContent = Storage::disk('private')->get($document->file_path);
        
        return response($fileContent, 200)
            ->header('Content-Type', $document->mime_type)
            ->header('Content-Disposition', 'inline; filename="' . $document->original_filename . '"');
    }

    /**
     * Download a document
     */
    public function download(int $documentId)
    {
        $document = AdmissionDocument::findOrFail($documentId);

        // Same access check as view
        $user = Auth::user();
        $hasAccess = false;

        // Check if parent owns this student
        if ($user->type === 'parent') {
            $hasAccess = Student::where('id', $document->student_id)
                ->where('parent_id', $user->id)
                ->exists();
        }

        // Check if school staff from same company
        if (in_array($user->type, ['school', 'staff', 'admin', 'it_admin'])) {
            $hasAccess = $user->company_id === $document->company_id;
        }

        if (!$hasAccess) {
            abort(403, 'Unauthorized access to document');
        }

        if (!Storage::disk('private')->exists($document->file_path)) {
            abort(404, 'Document not found');
        }

        return Storage::disk('private')->download(
            $document->file_path,
            $document->original_filename
        );
    }

    /**
     * Add watermark to image using GD with CONFIDENTIAL text
     */
    private function addWatermarkToImage($file, string $companyName): string
    {
        // Get image info
        $imageInfo = getimagesize($file->getRealPath());
        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $mimeType = $imageInfo['mime'];

        // Create image resource based on type
        switch ($mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                $image = imagecreatefromjpeg($file->getRealPath());
                break;
            case 'image/png':
                $image = imagecreatefrompng($file->getRealPath());
                break;
            default:
                return file_get_contents($file->getRealPath());
        }

        if (!$image) {
            return file_get_contents($file->getRealPath());
        }

        // Preserve transparency for PNG
        if ($mimeType === 'image/png') {
            imagealphablending($image, true);
            imagesavealpha($image, true);
        }

        // Use built-in font
        $font = 5; // Largest built-in font

        // Create colors
        $grayColor = imagecolorallocatealpha($image, 128, 128, 128, 70);
        $redColor = imagecolorallocatealpha($image, 200, 50, 50, 70);

        // Watermark texts
        $confidentialText = "CONFIDENTIAL";
        $companyText = "© " . $companyName;
        $dateText = date('Y-m-d H:i:s');

        // Get text dimensions
        $fontWidth = imagefontwidth($font);
        $fontHeight = imagefontheight($font);
        
        $confidentialWidth = $fontWidth * strlen($confidentialText);
        $companyWidth = $fontWidth * strlen($companyText);
        $dateWidth = $fontWidth * strlen($dateText);

        // Add multiple CONFIDENTIAL watermarks diagonally across image
        $spacing = 150; // Space between watermarks
        for ($y = -$height; $y < $height * 2; $y += $spacing) {
            for ($x = -$width; $x < $width * 2; $x += $spacing) {
                // Calculate position for diagonal pattern
                $posX = $x + ($y / 2);
                $posY = $y;
                
                if ($posX > -100 && $posX < $width + 100 && $posY > -20 && $posY < $height + 20) {
                    imagestring($image, $font, (int)$posX, (int)$posY, $confidentialText, $redColor);
                }
            }
        }

        // Add company name in corners
        // Top-left
        imagestring($image, $font, 10, 10, $companyText, $grayColor);
        // Top-right
        imagestring($image, $font, $width - $companyWidth - 10, 10, $companyText, $grayColor);
        // Bottom-left
        imagestring($image, $font, 10, $height - $fontHeight - 10, $companyText, $grayColor);
        // Bottom-right
        imagestring($image, $font, $width - $companyWidth - 10, $height - $fontHeight - 10, $companyText, $grayColor);

        // Add center watermark (larger)
        $centerX = ($width - $confidentialWidth) / 2;
        $centerY = ($height - $fontHeight) / 2;
        imagestring($image, $font, (int)$centerX, (int)$centerY, $confidentialText, $redColor);
        imagestring($image, $font, (int)$centerX, (int)($centerY + $fontHeight + 5), $companyText, $grayColor);

        // Add date at bottom center
        imagestring($image, $font, (int)(($width - $dateWidth) / 2), $height - $fontHeight - 30, "Uploaded: " . $dateText, $grayColor);

        // Output to string
        ob_start();
        switch ($mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                imagejpeg($image, null, 90);
                break;
            case 'image/png':
                imagepng($image);
                break;
        }
        $output = ob_get_clean();

        imagedestroy($image);

        return $output;
    }

    /**
     * Add watermark to PDF using FPDI with custom rotation support
     */
    private function addWatermarkToPdf(string $inputPath, string $outputPath, string $companyName): void
    {
        // Create new custom PDF instance with rotation and alpha support
        $pdf = new WatermarkedPdf();
        
        // Get page count from source PDF
        $pageCount = $pdf->setSourceFile($inputPath);
        
        // Process each page
        for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
            // Import page
            $templateId = $pdf->importPage($pageNo);
            $size = $pdf->getTemplateSize($templateId);
            
            // Add page with same size as original
            $orientation = $size['width'] > $size['height'] ? 'L' : 'P';
            $pdf->AddPage($orientation, [$size['width'], $size['height']]);
            
            // Use imported page as template
            $pdf->useTemplate($templateId, 0, 0, $size['width'], $size['height']);
            
            // Enable alpha for transparency
            $pdf->SetAlpha(0.3);
            
            // Add diagonal CONFIDENTIAL watermarks across the page
            $pdf->SetFont('Helvetica', 'B', 30);
            $pdf->SetTextColor(200, 50, 50);
            
            // Add multiple diagonal watermarks
            $watermarkText = 'CONFIDENTIAL';
            $spacing = 80;
            
            for ($y = -50; $y < $size['height'] + 100; $y += $spacing) {
                for ($x = -100; $x < $size['width'] + 100; $x += $spacing) {
                    $posX = $x + ($y * 0.5);
                    $posY = $y;
                    
                    if ($posX > -50 && $posX < $size['width'] + 50 && $posY > 0 && $posY < $size['height']) {
                        // Rotate text
                        $pdf->Rotate(45, $posX + 40, $posY);
                        $pdf->Text($posX, $posY, $watermarkText);
                        $pdf->Rotate(0);
                    }
                }
            }
            
            // Add company name in corners (less transparent)
            $pdf->SetAlpha(0.5);
            $pdf->SetFont('Helvetica', '', 10);
            $pdf->SetTextColor(100, 100, 100);
            
            $companyText = "© " . $companyName;
            
            // Top-left
            $pdf->Text(10, 15, $companyText);
            // Top-right
            $pdf->Text($size['width'] - $pdf->GetStringWidth($companyText) - 10, 15, $companyText);
            // Bottom-left
            $pdf->Text(10, $size['height'] - 10, $companyText);
            // Bottom-right
            $pdf->Text($size['width'] - $pdf->GetStringWidth($companyText) - 10, $size['height'] - 10, $companyText);
            
            // Add upload date at bottom center
            $dateText = "Uploaded: " . date('Y-m-d H:i:s');
            $dateWidth = $pdf->GetStringWidth($dateText);
            $pdf->Text(($size['width'] - $dateWidth) / 2, $size['height'] - 5, $dateText);
            
            // Reset alpha
            $pdf->SetAlpha(1);
        }
        
        // Output to file
        $pdf->Output($outputPath, 'F');
    }
}
