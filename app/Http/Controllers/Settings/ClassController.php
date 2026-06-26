<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Grade;
use App\Models\Staff;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassController extends Controller
{
    public function index()
    {
        $classes = SchoolClass::with(['grade', 'teacher'])
            ->orderBy('grade_id')
            ->orderBy('name')
            ->get();

        $grades = Grade::orderBy('order')->get();
        $teachers = Staff::get();

        return Inertia::render('modules/settings/classes', [
            'classes' => $classes,
            'grades' => $grades,
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'grade_id' => 'required|exists:grades,id',
            'capacity' => 'required|integer|min:1',
            'staff_id' => 'required|exists:staff,id',
        ]);

        SchoolClass::create([
            'name' => $request->name,
            'grade_id' => $request->grade_id,
            'capacity' => $request->capacity,
            'staff_id' => $request->staff_id,
            'status' => true,
        ]);

        return redirect()->back()->with('success', 'Class created successfully');
    }

    public function update(Request $request, SchoolClass $class)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'grade_id' => 'required|exists:grades,id',
            'capacity' => 'required|integer|min:1',
            'staff_id' => 'required|exists:staff,id',
            'status' => 'required|boolean',
        ]);

        $class->update([
            'name' => $request->name,
            'grade_id' => $request->grade_id,
            'capacity' => $request->capacity,
            'staff_id' => $request->staff_id,
            'status' => $request->status,
        ]);

        return redirect()->back()->with('success', 'Class updated successfully');
    }

    public function destroy(SchoolClass $class)
    {
        // if ($class->enrollments()->exists()) {
        //     return redirect()->back()->with('error', 'Cannot delete class with existing enrollments');
        // }

        $class->delete();
        return redirect()->back()->with('success', 'Class deleted successfully');
    }
}