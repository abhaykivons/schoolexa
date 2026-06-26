<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class StudentEnrollment extends Model
{
    // Enrollment statuses
    public const STATUS_ACTIVE = 'active';
    public const STATUS_PROMOTED = 'promoted';
    public const STATUS_TRANSFERRED = 'transferred';
    public const STATUS_WITHDRAWN = 'withdrawn';
    public const STATUS_COMPLETED = 'completed';

    public const STATUS_LABELS = [
        self::STATUS_ACTIVE => 'Active',
        self::STATUS_PROMOTED => 'Promoted',
        self::STATUS_TRANSFERRED => 'Transferred',
        self::STATUS_WITHDRAWN => 'Withdrawn',
        self::STATUS_COMPLETED => 'Completed',
    ];

    protected $fillable = [
        'company_id',
        'student_id',
        'academic_year_id',
        'grade_id',
        'class_id',
        'class_teacher_id',
        'roll_number',
        'enrollment_date',
        'leaving_date',
        'status',
        'promoted_from_enrollment_id',
        'remarks',
    ];

    protected $casts = [
        'enrollment_date' => 'date',
        'leaving_date' => 'date',
    ];

    protected $appends = [
        'status_label',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new CompanyScope);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (in_array('company_id', $model->getConnection()->getSchemaBuilder()->getColumnListing($model->getTable()))) {
                $model->company_id = session('company_id') ?? 1;
            }
        });
    }

    // ==================
    // RELATIONSHIPS
    // ==================

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function classTeacher(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'class_teacher_id');
    }

    public function promotedFromEnrollment(): BelongsTo
    {
        return $this->belongsTo(StudentEnrollment::class, 'promoted_from_enrollment_id');
    }

    public function promotedToEnrollment(): HasOne
    {
        return $this->hasOne(StudentEnrollment::class, 'promoted_from_enrollment_id');
    }

    // ==================
    // ACCESSORS
    // ==================

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? 'Unknown';
    }

    // ==================
    // SCOPES
    // ==================

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeForAcademicYear($query, $academicYearId)
    {
        return $query->where('academic_year_id', $academicYearId);
    }

    public function scopeForClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    public function scopeCurrentYear($query)
    {
        $currentYear = AcademicYear::where('current', true)->first();
        if ($currentYear) {
            return $query->where('academic_year_id', $currentYear->id);
        }
        return $query;
    }

    // ==================
    // HELPER METHODS
    // ==================

    /**
     * Generate roll number for a class
     */
    public static function generateRollNumber($classId, $academicYearId): string
    {
        $lastEnrollment = self::where('class_id', $classId)
            ->where('academic_year_id', $academicYearId)
            ->orderBy('roll_number', 'desc')
            ->first();

        if ($lastEnrollment && $lastEnrollment->roll_number) {
            $lastNumber = intval($lastEnrollment->roll_number);
            return str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        }

        return '001';
    }

    /**
     * Check if student can be promoted to next grade
     */
    public function canBePromoted(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Promote student to next academic year with new class
     */
    public function promoteToNextYear($newAcademicYearId, $newGradeId, $newClassId, $remarks = null): ?StudentEnrollment
    {
        if (!$this->canBePromoted()) {
            return null;
        }

        // Mark current enrollment as promoted
        $this->update([
            'status' => self::STATUS_PROMOTED,
            'leaving_date' => now(),
        ]);

        // Create new enrollment
        return self::create([
            'student_id' => $this->student_id,
            'academic_year_id' => $newAcademicYearId,
            'grade_id' => $newGradeId,
            'class_id' => $newClassId,
            'class_teacher_id' => SchoolClass::find($newClassId)?->staff_id,
            'roll_number' => self::generateRollNumber($newClassId, $newAcademicYearId),
            'enrollment_date' => now(),
            'status' => self::STATUS_ACTIVE,
            'promoted_from_enrollment_id' => $this->id,
            'remarks' => $remarks,
        ]);
    }
}

