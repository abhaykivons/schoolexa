<?php

namespace App\Models;

use App\Casts\EncryptedString;
use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class AdmissionDocument extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'admission_form_id',
        'student_id',
        'uploaded_by',
        'document_type',
        'original_filename',
        'stored_filename',
        'file_path',
        'mime_type',
        'file_size',
        'is_watermarked',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'company_id',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'is_watermarked' => 'boolean',
        'reviewed_at' => 'datetime',
    ];

    protected $appends = ['file_url', 'formatted_size'];

    protected static function booted()
    {
        static::addGlobalScope(new CompanyScope);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->company_id)) {
                $model->company_id = session('company_id') ?? auth()->user()?->company_id ?? 1;
            }
        });

        // Delete file when document is deleted
        static::deleting(function ($model) {
            if ($model->file_path && Storage::disk('private')->exists($model->file_path)) {
                Storage::disk('private')->delete($model->file_path);
            }
        });
    }

    /**
     * Get the admission form that owns this document
     */
    public function admissionForm(): BelongsTo
    {
        return $this->belongsTo(AdmissionForm::class);
    }

    /**
     * Get the student that owns this document
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the user who uploaded this document
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the user who reviewed this document
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get the company
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get file URL attribute
     */
    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }
        
        // Generate a temporary signed URL for secure access
        return route('admission.document.view', ['document' => $this->id]);
    }

    /**
     * Get formatted file size
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }
        
        return $bytes . ' bytes';
    }

    /**
     * Approve this document
     */
    public function approve(int $reviewedBy, ?string $notes = null): void
    {
        $this->update([
            'status' => 'approved',
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
            'review_notes' => $notes,
        ]);
    }

    /**
     * Reject this document
     */
    public function reject(int $reviewedBy, ?string $notes = null): void
    {
        $this->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
            'review_notes' => $notes,
        ]);
    }

    /**
     * Check if document is a PDF
     */
    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }

    /**
     * Check if document is an image
     */
    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Get document type label
     */
    public function getDocumentTypeLabelAttribute(): string
    {
        $labels = [
            'birth_certificate' => 'Birth Certificate',
            'immunization_records' => 'Immunization Records',
            'previous_transcripts' => 'Previous Transcripts',
            'proof_of_residency' => 'Proof of Residency',
            'parent_guardian_id' => 'Parent/Guardian ID',
            'physical_exam_form' => 'Physical Exam Form',
            'dental_exam_form' => 'Dental Exam Form',
            'emergency_contact_form' => 'Emergency Contact Form',
            'custody_documents' => 'Custody Documents',
            'iep_504_plan' => 'IEP/504 Plan',
            'special_services_docs' => 'Special Services Documents',
        ];

        return $labels[$this->document_type] ?? ucwords(str_replace('_', ' ', $this->document_type));
    }
}

