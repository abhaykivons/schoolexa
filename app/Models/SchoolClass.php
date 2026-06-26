<?php

namespace App\Models;

use App\Casts\EncryptedString;
use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SchoolClass extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'grade_id',
        'capacity',
        'staff_id',
        'academic_year_id',
        'status',
        'company_id',
    ];

    protected $casts = [
        'name' => EncryptedString::class,
        'capacity' => 'integer',
    ];

    protected $appends = [
        'current_strength',
        'available_seats',
        'is_full',
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
    
    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    public function classTeacher(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'class_subject_teacher', 'class_id', 'subject_id')
            ->using(ClassSubjectTeacher::class)
            ->withPivot('staff_id', 'id');
    }

    public function assignedTeachers(): BelongsToMany
    {
        return $this->belongsToMany(Staff::class, 'class_subject_teacher', 'class_id', 'staff_id')
            ->using(ClassSubjectTeacher::class)
            ->withPivot('subject_id', 'id');
    }

    /**
     * Get all enrollments in this class
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class, 'class_id');
    }

    /**
     * Get active enrollments only
     */
    public function activeEnrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class, 'class_id')
            ->where('status', StudentEnrollment::STATUS_ACTIVE);
    }

    /**
     * Get students currently in this class (via enrollments)
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(
            Student::class,
            'student_enrollments',
            'class_id',
            'student_id'
        )->wherePivot('status', StudentEnrollment::STATUS_ACTIVE);
    }

    // ==================
    // ACCESSORS
    // ==================

    /**
     * Get current number of students in this class
     */
    public function getCurrentStrengthAttribute(): int
    {
        return $this->activeEnrollments()->count();
    }

    /**
     * Get number of available seats
     */
    public function getAvailableSeatsAttribute(): int
    {
        return max(0, $this->capacity - $this->current_strength);
    }

    /**
     * Check if class is full
     */
    public function getIsFullAttribute(): bool
    {
        return $this->current_strength >= $this->capacity;
    }

    // ==================
    // SCOPES
    // ==================

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    public function scopeForGrade($query, $gradeId)
    {
        return $query->where('grade_id', $gradeId);
    }

    public function scopeForAcademicYear($query, $academicYearId)
    {
        return $query->where('academic_year_id', $academicYearId);
    }

    public function scopeWithAvailableSeats($query)
    {
        return $query->whereRaw('capacity > (
            SELECT COUNT(*) FROM student_enrollments 
            WHERE student_enrollments.class_id = school_classes.id 
            AND student_enrollments.status = ?
        )', [StudentEnrollment::STATUS_ACTIVE]);
    }

    // ==================
    // HELPER METHODS
    // ==================

    /**
     * Check if class has capacity for more students
     */
    public function hasCapacity(int $count = 1): bool
    {
        return $this->available_seats >= $count;
    }

    /**
     * Get current strength for a specific academic year
     */
    public function getStrengthForYear($academicYearId): int
    {
        return $this->enrollments()
            ->where('academic_year_id', $academicYearId)
            ->where('status', StudentEnrollment::STATUS_ACTIVE)
            ->count();
    }

    /**
     * Check if a specific student is enrolled in this class
     */
    public function hasStudent($studentId): bool
    {
        return $this->activeEnrollments()
            ->where('student_id', $studentId)
            ->exists();
    }
}
