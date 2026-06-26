<?php

namespace App\Models;

use App\Casts\EncryptedString;
use App\Models\Scopes\CompanyScope;
use App\Traits\HasDateFormat;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class StaffEnrollment extends Model
{

    use HasDateFormat;

    /**
     * The table associated with the model.
     *
     * @var string
     */

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'full_legal_name',
        'phone_number',
        'email_address',
        'street_address',
        'city',
        'state',
        'zip_code',
        'work_authorized',
        'date_of_birth',
        'position_title',
        'subject_grade_level',
        'highest_degree',
        'major_area_of_study',
        'availability',
        'teaching_certifications',
        'other_relevant_certifications',
        'relevant_coursework',
        'employment_history',
        'total_years_experience',
        'administrative_experience',
        'relevant_skills',
        'areas_of_expertise',
        'co_curricular_qualifications',
        'hobbies_interests',
        'references',
        'documents_accepted',
        'resume_file_path',
        'portfolio_file_path',
        'digital_signature',
        'background_check_consent',
        'enrollment_date',
        'company_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'work_authorized' => 'boolean',
        'date_of_birth' => 'date',
        'teaching_certifications' => 'array',
        'employment_history' => 'array',
        'relevant_skills' => 'array',
        'references' => 'array',
        'documents_accepted' => 'array',
        'background_check_consent' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'full_legal_name' => EncryptedString::class,
        'phone_number' => EncryptedString::class,
        'email_address' => EncryptedString::class,
        'street_address' => EncryptedString::class,
        'city' => EncryptedString::class,
        'state' => EncryptedString::class,
        'zip_code' => EncryptedString::class,
        'position_title' => EncryptedString::class,
        'subject_grade_level' => EncryptedString::class,
        'highest_degree' => EncryptedString::class,
        'major_area_of_study' => EncryptedString::class,
        'availability' => EncryptedString::class,
        'relevant_coursework' => EncryptedString::class,
        'areas_of_expertise' => EncryptedString::class,
        'co_curricular_qualifications' => EncryptedString::class,
        'hobbies_interests' => EncryptedString::class,
        'resume_file_path' => EncryptedString::class,
        'portfolio_file_path' => EncryptedString::class,
        'digital_signature' => EncryptedString::class,
    ];

    protected $attributes = [
        'teaching_certifications' => '[]',
        'employment_history' => '[]',
        'relevant_skills' => '[]',
        'areas_of_expertise' => '[]',
        'references' => '[]',
        'documents_accepted' => '[]',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */

    protected $appends = [
        'formatted_application_date'
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

    /**
     * Get the user's full legal name with proper capitalization.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    protected function fullLegalName(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ucwords(strtolower($value)),
            set: fn ($value) => ucwords(strtolower($value)),
        );
    }

    /**
     * Get the user's email address in lowercase.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    protected function emailAddress(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => strtolower($value),
            set: fn ($value) => strtolower($value),
        );
    }

    /**
     * Get the URL to access the resume file.
     *
     * @return string|null
     */
    public function getResumeUrlAttribute()
    {
        if (!$this->resume_file_path) {
            return null;
        }

        return route('enrollment.download.resume', [
            'id' => $this->id,
            'hash' => hash('sha256', $this->id . $this->email_address . config('app.key'))
        ]);
    }

    /**
     * Get the URL to access the portfolio file.
     *
     * @return string|null
     */
    public function getPortfolioUrlAttribute()
    {
        if (!$this->portfolio_file_path) {
            return null;
        }

        return route('enrollment.download.portfolio', [
            'id' => $this->id,
            'hash' => hash('sha256', $this->id . $this->email_address . config('app.key'))
        ]);
    }

    /**
     * Scope a query to only include enrollments from a specific state.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $state
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByState($query, $state)
    {
        return $query->where('state', strtoupper($state));
    }

    /**
     * Scope a query to only include work-authorized enrollments.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWorkAuthorized($query)
    {
        return $query->where('work_authorized', true);
    }

    /**
     * Get the age of the applicant based on date of birth.
     *
     * @return int|null
     */
    public function getAgeAttribute()
    {
        if (!$this->date_of_birth) {
            return null;
        }

        return $this->date_of_birth->age;
    }

    /**
     * Get the formatted phone number.
     *
     * @return string
     */
    public function getFormattedPhoneNumberAttribute()
    {
        $phone = preg_replace('/[^0-9]/', '', $this->phone_number);
        
        if (strlen($phone) === 10) {
            return preg_replace('/(\d{3})(\d{3})(\d{4})/', '($1) $2-$3', $phone);
        }
        
        if (strlen($phone) === 11) {
            return preg_replace('/(\d{1})(\d{3})(\d{3})(\d{4})/', '+$1 ($2) $3-$4', $phone);
        }
        
        return $this->phone_number;
    }

    /**
     * Get the first teaching certification (if exists).
     *
     * @return array|null
     */
    public function getPrimaryCertificationAttribute()
    {
        if (empty($this->teaching_certifications)) {
            return null;
        }

        return $this->teaching_certifications[0];
    }

    /**
     * Get the most recent employment history (if exists).
     *
     * @return array|null
     */
    public function getCurrentEmploymentAttribute()
    {
        if (empty($this->employment_history)) {
            return null;
        }

        // Sort by end date (most recent first)
        $sorted = collect($this->employment_history)->sortByDesc(function ($item) {
            return strtotime($item['endDate']);
        });

        return $sorted->first();
    }


    public function getFormattedApplicationDateAttribute()
    {
        return $this->created_at ? $this->created_at->format(config('app.date_format')) : null;
    }
}