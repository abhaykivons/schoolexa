<?php

namespace App\Http\Controllers\StaffEnrollment;

use App\Http\Controllers\Controller;
use App\Models\ApprovalFlow;
use App\Models\ApprovalHistory;
use App\Models\EnrollmentDocument;
use App\Models\StaffEnrollment;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EnrollmentController extends Controller
{
    /**
     * Show the form for creating a new resource.
     *
     * @return \Inertia\Response
     */
    public function create()
    { 
        return Inertia::render('modules/staff/create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    
    public function store(Request $request)
    {
        // Rate limiting (5 attempts per minute)
        $executed = RateLimiter::attempt(
            'staff-enrollment:'.$request->ip(),
            $perMinute = 10,
            function() {}
        );

        if (!$executed) {
            return response()->json([
                'message' => 'Too many submissions. Please try again later.'
            ], 429);
        }

        // Validate input data
        $validator = Validator::make($request->all(), [
            'fullLegalName' => 'required|string|max:255',
            'phoneNumber' => 'required|string|max:20',
            'emailAddress' => 'required|email|max:255|unique:staff_enrollments,email_address',
            'streetAddress' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|size:2',
            'zipCode' => 'required|string|max:10',
            'workAuthorized' => 'required',
            'dateOfBirth' => 'required|date|before:-18 years',
            'positionTitle' => 'required|string|max:255',
            'subjectGradeLevel' => 'nullable|string|max:255',
            'highestDegree' => ['required', 'string', Rule::in(['high-school', 'associate', 'bachelor', 'master', 'doctorate'])],
            'majorAreaOfStudy' => 'required|string|max:255',
            'availability' => 'required|string|max:255',
            
            // Array validations
            'teachingCertifications.*.certificationType' => 'nullable|string|max:255',
            'teachingCertifications.*.certificationArea' => 'nullable|string|max:255',
            'teachingCertifications.*.issuingState' => 'nullable|string|max:255',
            'teachingCertifications.*.expirationDate' => 'nullable|date',
            
            'otherRelevantCertifications' => 'nullable|string|max:1000',
            'relevantCoursework' => 'nullable|string|max:1000',
            
            'employmentHistory.*.institutionName' => 'nullable|string|max:255',
            'employmentHistory.*.institutionAddress' => 'nullable|string|max:255',
            'employmentHistory.*.positionHeld' => 'nullable|string|max:255',
            'employmentHistory.*.classesSubjectsTaught' => 'nullable|string|max:1000',
            'employmentHistory.*.startDate' => 'nullable|date',
            'employmentHistory.*.endDate' => 'nullable|date',
            'employmentHistory.*.keyResponsibilities' => 'nullable|string|max:1000',
            'employmentHistory.*.reasonForLeaving' => 'nullable|string|max:1000',
            
            'totalYearsExperience' => 'nullable|integer|min:0|max:48',
            'administrativeExperience' => 'nullable|string|max:1000',
            
            'relevantSkills.*.value' => 'nullable|string|max:255',
            
            'areasOfExpertise' => 'nullable|string|max:1000',
            'coCurricularQualifications' => 'nullable|string|max:1000',
            'hobbiesInterests' => 'nullable|string|max:1000',
            
            'references.*.fullName' => 'nullable|string|max:255',
            'references.*.titlePosition' => 'nullable|string|max:255',
            'references.*.emailAddress' => 'nullable|email|max:255',
            'references.*.phoneNumber' => 'nullable|string|max:20',
            'references.*.relationshipToYou' => 'nullable|string|max:255',
            'references.*.durationOfRelationship' => 'nullable|string|max:255',
            
            'documentsAccepted' => 'required|array',
            'digitalSignature' => 'required|string|max:255',
            'backgroundCheckConsent' => 'required',
            
            'resumeFile' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
            'portfolioFile' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Handle file uploads
        $resumePath = $request->hasFile('resumeFile') ? $this->storeFile($request->file('resumeFile'), 'resumes') : null;
        $portfolioPath = $request->hasFile('portfolioFile') ? $this->storeFile($request->file('portfolioFile'), 'portfolios') : null;

        // Create the enrollment record (sanitizeData already escapes, so no need for e() again)
        $sanitizedData = $this->sanitizeData($request->all());
        
        $enrollment = StaffEnrollment::create([
            'full_legal_name' => $sanitizedData['fullLegalName'],
            'phone_number' => $sanitizedData['phoneNumber'],
            'email_address' => $sanitizedData['emailAddress'],
            'street_address' => $sanitizedData['streetAddress'],
            'city' => $sanitizedData['city'],
            'state' => $sanitizedData['state'],
            'zip_code' => $sanitizedData['zipCode'],
            'work_authorized' => (bool)$sanitizedData['workAuthorized'],
            'date_of_birth' => $sanitizedData['dateOfBirth'],
            'position_title' => $sanitizedData['positionTitle'],
            'subject_grade_level' => $sanitizedData['subjectGradeLevel'] ?? null,
            'highest_degree' => $sanitizedData['highestDegree'],
            'major_area_of_study' => $sanitizedData['majorAreaOfStudy'],
            'availability' => $sanitizedData['availability'],
            
            'teaching_certifications' => json_encode($sanitizedData['teachingCertifications'] ?? []),
            'other_relevant_certifications' => $sanitizedData['otherRelevantCertifications'] ?? null,
            'relevant_coursework' => $sanitizedData['relevantCoursework'] ?? null,
            'employment_history' => json_encode($sanitizedData['employmentHistory'] ?? null),
            'total_years_experience' => (int)($sanitizedData['totalYearsExperience'] ?? 0),
            'administrative_experience' => $sanitizedData['administrativeExperience'] ?? null,
            
            'relevant_skills' => json_encode($sanitizedData['relevantSkills'] ?? []),
            'areas_of_expertise' => $sanitizedData['areasOfExpertise'] ?? null,
            'co_curricular_qualifications' => $sanitizedData['coCurricularQualifications'] ?? null,
            'hobbies_interests' => $sanitizedData['hobbiesInterests'] ?? null,
            
            'references' => json_encode($sanitizedData['references'] ?? null),
            'documents_accepted' => json_encode($sanitizedData['documentsAccepted'] ?? null),
            
            'resume_file_path' => $resumePath,
            'portfolio_file_path' => $portfolioPath,
            
            'digital_signature' => $sanitizedData['digitalSignature'],
            'background_check_consent' => (bool)$sanitizedData['backgroundCheckConsent'],
        ]);

        // Send email logic here...
        // Mail::to($enrollment->email_address)->send(new EnrollmentSubmitted($enrollment));

        return response()->json([
            'message' => 'Enrollment submitted successfully',
            'data' => $enrollment
        ], 201);
    }

    public function show($id)
    {
        $enrollment = StaffEnrollment::findOrFail($id);
        $currentUserId = Auth::user()->id;
            $enrollmentArray = $enrollment->toArray();
            $jsonFields = [
                'teaching_certifications',
                'employment_history',
                'relevant_skills',
                'references',
                'documents_accepted'
            ];
            
            foreach ($jsonFields as $field) {
                if (isset($enrollmentArray[$field])) {
                    $enrollmentArray[$field] = json_decode($enrollmentArray[$field], true) ?? [];
                } else {
                    $enrollmentArray[$field] = [];
                }
            }

            if (!empty($enrollment->portfolio_file_path)) {
                $enrollmentArray['portfolio_file_url'] = route('private.storage', [
                    'path' => str_replace('\\', '/', $enrollment->portfolio_file_path)
                ]);
            }
            if (!empty($enrollment->resume_file_path)) {
                $enrollmentArray['resume_file_url'] = route('private.storage', [
                    'path' => str_replace('\\', '/', $enrollment->resume_file_path)
                ]);
            }

            $enrollmentArray['approvers'] = ApprovalFlow::with('user')
                    ->where('module_type', 'staff_enrollment')
                    ->get()
                    ->filter(function ($flow) {
                        return $flow->user !== null;
                    })
                    ->map(function ($flow) {
                        return [
                            'id' => $flow->id,
                            'user_id' => $flow->user_id,
                            'name' => $flow->user->name ?? 'Unknown',
                            'email' => $flow->user->email ?? '',
                            'is_active' => $flow->is_active,
                        ];
                    });

        
            $enrollmentArray['approval_histories'] = ApprovalHistory::where('module_type', 'staff_enrollment')
                ->where('module_id', $id)
                ->with('user')
                ->get()
                ->filter(function ($history) {
                    return $history->user !== null;
                })
                ->map(function ($history) {
                    return [
                        'id' => $history->id,
                        'user_id' => $history->user_id,
                        'user_name' => $history->user->name ?? 'Unknown',
                        'status' => $history->status,
                        'comments' => $history->comments,
                        'created_at' => $history->created_at->format('M d, Y H:i'),
                    ];
                });

            $enrollmentArray['can_approve'] = false;
            if ($enrollment->approval_status === 0) { // Only if status is pending
                $enrollmentArray['can_approve'] = ApprovalFlow::where('module_type', 'staff_enrollment')
                    ->where('user_id', $currentUserId)
                    ->where('is_active', true)
                    ->exists() 
                    && !ApprovalHistory::where('module_type', 'staff_enrollment')
                        ->where('module_id', $id)
                        ->where('user_id', $currentUserId)
                        ->exists();
            }

            $enrollmentArray['enrollment_documents'] = EnrollmentDocument::where('type', 'staff-enrollment')->get()->toArray();
       
        return Inertia::render('modules/staff/staff-enrollment-view', [
            'enrollment' => $enrollmentArray
        ]);
    }

    public function approve($id)
    {
        DB::beginTransaction();

        try {
            $enrollment = StaffEnrollment::findOrFail($id);
            $userId = Auth::user()->id;
            
            // Check if user is an approver
            $isApprover = ApprovalFlow::where('module_type', 'staff_enrollment')
                ->where('user_id', $userId)
                ->where('is_active', true)
                ->exists();

            if (!$isApprover) {
                abort(403, 'You are not authorized to approve this application');
            }

            // Check if already approved
            $hasApproved = ApprovalHistory::where('module_type', 'staff_enrollment')
                ->where('module_id', $id)
                ->where('user_id', $userId)
                ->exists();

            if ($hasApproved) {
                abort(400, 'You have already submitted your decision for this application');
            }

            // Create approval history
            ApprovalHistory::create([
                'module_type' => 'staff_enrollment',
                'module_id'   => $id,
                'user_id'     => $userId,
                'status'      => 'approved',
                'comments'    => request('comments'),
            ]);

            // Check if all approvers have approved
            $approversCount = ApprovalFlow::where('module_type', 'staff_enrollment')
                ->where('is_active', true)
                ->count();

            $approvedCount = ApprovalHistory::where('module_type', 'staff_enrollment')
                ->where('module_id', $id)
                ->where('status', 'approved')
                ->count();

            if ($approvedCount >= $approversCount) {
                $enrollment->approval_status = 1;
                $enrollment->save();

                // Send staff enrollment approved notification
                try {
                    NotificationService::staffEnrollmentApproved($enrollment);
                } catch (\Exception $e) {
                    Log::warning('Failed to send staff enrollment approved notification', [
                        'enrollment_id' => $enrollment->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            DB::commit();

            return response()->json(['message' => 'Application approved successfully']);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Approval failed: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Something went wrong during approval.'], 500);
        }
    }

    public function reject($id)
    {
        DB::beginTransaction();

        try {
            $enrollment = StaffEnrollment::findOrFail($id);
            $userId = Auth::user()->id;

            // Check if user is an approver
            $isApprover = ApprovalFlow::where('module_type', 'staff_enrollment')
                ->where('user_id', $userId)
                ->where('is_active', true)
                ->exists();

            if (!$isApprover) {
                abort(403, 'You are not authorized to reject this application');
            }

            // Check if user has already approved/rejected
            $hasApproved = ApprovalHistory::where('module_type', 'staff_enrollment')
                ->where('module_id', $id)
                ->where('user_id', $userId)
                ->exists();

            if ($hasApproved) {
                abort(400, 'You have already submitted your decision for this application');
            }

            // Create approval history
            ApprovalHistory::create([
                'module_type' => 'staff_enrollment',
                'module_id'   => $id,
                'user_id'     => $userId,
                'status'      => 'rejected',
                'comments'    => request('comments'),
            ]);

            // Update enrollment status to rejected
            $enrollment->approval_status = 2;
            $enrollment->save();

            // Send staff enrollment rejected notification
            try {
                NotificationService::staffEnrollmentRejected($enrollment, request('comments'));
            } catch (\Exception $e) {
                Log::warning('Failed to send staff enrollment rejected notification', [
                    'enrollment_id' => $enrollment->id,
                    'error' => $e->getMessage()
                ]);
            }

            DB::commit();

            return response()->json(['message' => 'Application rejected successfully']);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Rejection failed: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Something went wrong during rejection.'], 500);
        }
    }

    protected function sanitizeData(array $data): array
    {
        array_walk_recursive($data, function (&$value, $key) {
            if (is_string($value)) {
                $value = e($value); // Basic XSS protection
            }
        });
        
        return $data;
    }

    protected function storeFile($file, $directory): string
    {
        if (!$file || !$file->isValid()) {
            throw new \Exception('Invalid file upload');
        }

        // Generate a secure filename
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $safeName = Str::slug($originalName).'-'.uniqid().'.'.$extension;

        // Store the file in the private storage
        return Storage::disk('private')->putFileAs(
            $directory, 
            $file, 
            $safeName
        );
    }


}
