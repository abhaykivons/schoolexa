<?php

namespace App\Models;

use App\Models\Scopes\CompanyScope;
use App\Traits\HasDateFormat;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Permission\Models\Role;

class Staff extends Model
{
    use HasDateFormat;

    public const STATUS_ACTIVE = 1;
    public const STATUS_INACTIVE = 0;
    public const STATUS_TERMINATED = 2;
    public const STATUS_RESIGNED = 3;
    public const STATUS_RETIRED = 4;
    public const STATUS_DECEASED = 5;
    public const STATUS_SUSPENDED = 6;
    public const STATUS_ON_LEAVE = 7;

    public const STATUS_LABELS = [
        self::STATUS_ACTIVE => 'Active',
        self::STATUS_INACTIVE => 'Inactive',
        self::STATUS_TERMINATED => 'Terminated',
        self::STATUS_RESIGNED => 'Resigned',
        self::STATUS_RETIRED => 'Retired',
        self::STATUS_DECEASED => 'Deceased',
        self::STATUS_SUSPENDED => 'Suspended',
        self::STATUS_ON_LEAVE => 'On Leave',
    ];
    
    protected $fillable = [
        'user_id',
        'role_id',
        'department_id',
        'enrollment_id',
        'status',     
        'company_id',
    ];

    protected $appends = [
        'status_label',
        'formatted_enrollment_date',
        'formatted_application_date',
        'full_name',
        'designation_name',
        'department_name',
    ];

    protected $casts = [
        'enrollment_date' => 'datetime',
        'created_at' => 'datetime', 
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

    public function user()
    {
        return $this->belongsTo(User::class)->where('company_id', auth()->user()->company_id);
    }

    public function designation()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function classes()
    {
        return $this->hasMany(SchoolClass::class, 'staff_id');
    }

    public function isLoginAccess()
    {
        return $this->user->status;
    }

    public function enrollment()
    {
        return $this->belongsTo(StaffEnrollment::class, 'enrollment_id');
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? 'Unknown';
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeTerminated($query)
    {
        return $query->where('status', self::STATUS_TERMINATED);
    }

    public function getFormattedEnrollmentDateAttribute()
    {
        return $this->formatDate($this->enrollment->enrollment_date);
    }

    public function getFormattedApplicationDateAttribute()
    {
        return $this->formatDateTime($this->created_at);
    }

    public function getFullNameAttribute()
    {
        return $this->enrollment->full_legal_name;
    }

    public function getDesignationNameAttribute()
    {
        return $this->designation ? $this->designation->title : ' ';
    }

    public function getDepartmentNameAttribute()
    {
        return $this->department ? $this->department->name : ' ';
    }

    public function subjectAssignments(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'class_subject_teacher', 'staff_id', 'subject_id')
            ->using(ClassSubjectTeacher::class)
            ->withPivot('class_id', 'id');
    }

    public function classAssignments(): BelongsToMany
    {
        return $this->belongsToMany(SchoolClass::class, 'class_subject_teacher', 'staff_id', 'class_id')
            ->using(ClassSubjectTeacher::class)
            ->withPivot('subject_id', 'id');
    }

    // public function permissions()
    // {
    //     return $this->belongsToMany(Permission::class, 'staff_permissions')
    //         ->withPivot('granted');
    // }
}
