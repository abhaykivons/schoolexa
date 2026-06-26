<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Casts\EncryptedString;
use App\Enum\StudentStatus;
use Illuminate\Support\Str;

class Student extends Model
{
    use HasFactory;
    protected $fillable = [
        'first_name',
        'last_name',
        'photo',
        'date_of_birth',
        'student_id',
        'grade_id',
        'parent_id',
        'user_id',
        'teacher_id',
        'company_id',
        'status',
        'enrollment_date',
        'is_login',
    ];

    protected $casts = [
        'first_name' => EncryptedString::class,
        'last_name' => EncryptedString::class,
        'status' => StudentStatus::class,
        'enrollment_date' => 'date',
        'is_login' => 'boolean',
    ];

    protected $appends = [
        'full_name',
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
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function admissionForms(): HasMany
    {
        return $this->hasMany(AdmissionForm::class);
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'teacher_id');
    }

    /**
     * All enrollment records (year-wise history)
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class)->orderBy('academic_year_id', 'desc');
    }

    /**
     * Current active enrollment
     */
    public function currentEnrollment(): HasOne
    {
        return $this->hasOne(StudentEnrollment::class)
            ->where('status', StudentEnrollment::STATUS_ACTIVE)
            ->latest('enrollment_date');
    }

    /**
     * Get enrollment for a specific academic year
     */
    public function enrollmentForYear($academicYearId): ?StudentEnrollment
    {
        return $this->enrollments()->where('academic_year_id', $academicYearId)->first();
    }

    // ==================
    // ACCESSORS
    // ==================

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    // ==================
    // HELPER METHODS
    // ==================

    /**
     * Generate unique student ID
     * Format: SCHOOL_PREFIX + YEAR + SEQUENCE (e.g., SCH2025001)
     */
    public static function generateStudentId($companyId = null): string
    {
        $company = Company::find($companyId ?? session('company_id') ?? 1);
        $prefix = strtoupper(Str::substr(preg_replace('/\s+/', '', $company?->name ?? 'STU'), 0, 3));
        $year = date('Y');
        
        // Get the last student ID for this year
        $lastStudent = self::withoutGlobalScopes()
            ->where('company_id', $companyId ?? session('company_id') ?? 1)
            ->where('student_id', 'LIKE', "{$prefix}{$year}%")
            ->orderBy('student_id', 'desc')
            ->first();

        if ($lastStudent && $lastStudent->student_id) {
            // Extract the sequence number
            $lastSequence = intval(substr($lastStudent->student_id, -4));
            $newSequence = $lastSequence + 1;
        } else {
            $newSequence = 1;
        }

        return $prefix . $year . str_pad($newSequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Check if student is currently enrolled
     */
    public function isEnrolled(): bool
    {
        return $this->status === StudentStatus::Enrolled;
    }

    /**
     * Get current class from active enrollment
     */
    public function getCurrentClass(): ?SchoolClass
    {
        return $this->currentEnrollment?->schoolClass;
    }

    /**
     * Get current class teacher from active enrollment
     */
    public function getCurrentClassTeacher(): ?Staff
    {
        return $this->currentEnrollment?->classTeacher;
    }

    /**
     * Get all past enrollment records with details
     */
    public function getEnrollmentHistory(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->enrollments()
            ->with(['academicYear', 'grade', 'schoolClass', 'classTeacher.enrollment'])
            ->orderBy('academic_year_id', 'desc')
            ->get();
    }
}
