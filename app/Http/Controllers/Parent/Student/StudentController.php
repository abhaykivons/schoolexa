<?php

namespace App\Http\Controllers\Parent\Student;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;


class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $students = Student::with('grade')
            ->where('parent_id', $user->id)
            ->get();
        $grades = Grade::where('company_id', $user->company_id)->orderBy('order', 'asc')->get();
        return Inertia::render('modules/parent/student/index', [
            'students' => $students,
            'grades' => $grades
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'grade_id' => 'required|exists:grades,id',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            Student::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'date_of_birth' => $request->date_of_birth,
                'grade_id' => $request->grade_id,
                'parent_id' => $user->id,
                'company_id' => $user->company_id,
                'status' => 0,
            ]);

            return redirect()->back()->with('success', 'Student added successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to add student: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = Auth::user();
        
        $student = Student::with(['grade', 'parent', 'teacher', 'currentEnrollment.schoolClass', 'currentEnrollment.classTeacher'])
            ->where('id', $id)
            ->where('parent_id', $user->id)
            ->firstOrFail();

        // Get teacher info if assigned
        $teacher = $student->teacher ?? $student->currentEnrollment?->classTeacher;
        
        // Placeholder data for features coming soon
        $feesData = [
            'total_fees' => 0,
            'paid' => 0,
            'pending' => 0,
            'next_due_date' => null,
            'payments' => [],
        ];

        $mealData = [
            'plan' => null,
            'dietary_restrictions' => [],
            'today_menu' => [],
        ];

        $timetableData = [
            'schedule' => [],
        ];

        $calendarData = [
            'events' => [],
            'holidays' => [],
        ];

        $reportsData = [
            'academic' => [],
            'attendance' => [
                'present' => 0,
                'absent' => 0,
                'late' => 0,
                'percentage' => 0,
            ],
            'behavior' => [],
        ];

        return Inertia::render('modules/parent/student/details', [
            'student' => $student,
            'teacher' => $teacher,
            'fees' => $feesData,
            'meals' => $mealData,
            'timetable' => $timetableData,
            'calendar' => $calendarData,
            'reports' => $reportsData,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Upload student photo as base64
     */
    public function uploadPhoto(Request $request, string $id)
    {
        $user = Auth::user();
        
        $student = Student::where('id', $id)
            ->where('parent_id', $user->id)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'photo' => 'required|string',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            // Validate that it's a valid base64 image
            $photo = $request->photo;
            
            // Check if it's a valid base64 image format
            if (!preg_match('/^data:image\/(jpeg|jpg|png|gif|webp);base64,/', $photo)) {
                return redirect()->back()
                    ->with('error', 'Invalid image format. Please upload a valid image.')
                    ->withInput();
            }

            // Check file size (limit to ~2MB - base64 is ~33% larger than original)
            $base64Data = preg_replace('/^data:image\/\w+;base64,/', '', $photo);
            $decodedSize = strlen(base64_decode($base64Data));
            
            if ($decodedSize > 2 * 1024 * 1024) { // 2MB limit
                return redirect()->back()
                    ->with('error', 'Image size is too large. Maximum size is 2MB.')
                    ->withInput();
            }

            $student->photo = $photo;
            $student->save();

            return redirect()->back()->with('success', 'Photo uploaded successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to upload photo: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove student photo
     */
    public function removePhoto(string $id)
    {
        $user = Auth::user();
        
        $student = Student::where('id', $id)
            ->where('parent_id', $user->id)
            ->firstOrFail();

        try {
            $student->photo = null;
            $student->save();

            return redirect()->back()->with('success', 'Photo removed successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to remove photo: ' . $e->getMessage());
        }
    }
}
