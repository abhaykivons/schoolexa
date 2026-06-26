<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Staff;
use App\Models\ClassSubjectTeacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassAssignmentController extends Controller
{
    public function index()
    {
        $classes = SchoolClass::with([
                'grade', 
                'classTeacher', 
                'subjects' => function($query) {
                    $query->with('teachers');
                }
            ])
            ->orderBy('grade_id')
            ->orderBy('name')
            ->get();


        $subjects = Subject::orderBy('name')->get();
        $teachers = Staff::get();


        return Inertia::render('modules/settings/class-assignments', [
            'classes' => $classes,
            'subjects' => $subjects,
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'staff_id' => 'required|exists:staff,id',
        ]);

        // Check if subject is already assigned to this class
        $exists = ClassSubjectTeacher::where('class_id', $request->class_id)
            ->where('subject_id', $request->subject_id)
            ->exists();

        if ($exists) {
            return back()->with('error', 'This subject is already assigned to this class');
        }

        // Create the assignment
        ClassSubjectTeacher::create([
            'class_id' => $request->class_id,
            'subject_id' => $request->subject_id,
            'staff_id' => $request->staff_id,
        ]);

        return back()->with('success', 'Assignment created successfully');
    }

    public function update(Request $request, $assignmentId)
    {
        $request->validate([
            'staff_id' => 'required|exists:staff,id', 
        ]);

        $assignment = ClassSubjectTeacher::findOrFail($assignmentId);
        $assignment->update(['staff_id' => $request->staff_id]); 

        return redirect()->back()->with('success', 'Assignment updated successfully');
    }

    public function destroy($assignmentId)
    {
        ClassSubjectTeacher::findOrFail($assignmentId)->delete();
        return redirect()->back()->with('success', 'Assignment removed successfully');
    }
}