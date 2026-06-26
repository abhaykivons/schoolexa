<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class AcademicYearController extends Controller
{
    public function index()
    {
        $academicYears = AcademicYear::latest()->get();

        return Inertia::render('modules/settings/academic-years', [
            'academicYears' => $academicYears,
        ]);
    }

    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'name' => 'required|unique:academic_years,name',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ])->validate();

        AcademicYear::create($validated);

        return redirect()->back()->with('success', 'Academic year added.');
    }

    public function update(Request $request, AcademicYear $academicYear)
    {
        $validated = $request->validate([
            'name' => 'required|unique:academic_years,name,' . $academicYear->id,
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $academicYear->update($validated);
        return redirect()->back()->with('success', 'Academic year updated.');
    }

    public function destroy(AcademicYear $academicYear)
    {
        $academicYear->delete();
        return redirect()->back()->with('success', 'Academic year deleted.');
    }

    public function setCurrent(AcademicYear $academicYear)
    {
        // First, set all academic years to not current
        AcademicYear::query()->update(['current' => false]);
        
        // Then set the selected one as current
        $academicYear->update(['current' => true]);
        
        return redirect()->back()->with('success', 'Current academic year updated.');
    }
}