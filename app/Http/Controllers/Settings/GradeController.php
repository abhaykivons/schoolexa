<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class GradeController extends Controller
{
    public function index()
    {
        $grades = Grade::orderBy('order')->get();

        return Inertia::render('modules/settings/grades', [
            'grades' => $grades,
        ]);
    }

    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:grades,name'
            ],
        ])->validate();

        $highestOrder = Grade::max('order') ?? 0;
    
        Grade::create([
            'name' => $validated['name'],
            'order' => $highestOrder + 1
        ]);

        // Return the updated grades list
        return redirect()->back()->with([
            'success' => 'Grade added successfully.',
            'grades' => Grade::orderBy('order')->get()
        ]);

    }

    public function update(Request $request, Grade $grade)
    {
        $validated = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('grades')->ignore($grade->id),
            ],
        ])->validate();

        $grade->update($validated);

        return redirect()->back()->with([
            'success' => 'Grade added successfully.',
            'grades' => Grade::orderBy('order')->get()
        ]);

    }

    public function reorder(Request $request)
    {
        $request->validate([
            'grades' => 'required|array',
            'grades.*.id' => 'required|exists:grades,id',
            'grades.*.order' => 'required|integer',
        ]);

        DB::transaction(function () use ($request) {
            // Update all to negative values (to avoid unique constraint conflict)
            DB::statement('UPDATE grades SET `order` = -`order`');

            // Then update to new values
            foreach ($request->grades as $gradeData) {
                Grade::where('id', $gradeData['id'])
                    ->update(['order' => $gradeData['order']]);
            }
        });

        return redirect()->back()->with([
            'success' => 'Grades reordered successfully.',
            'grades' => Grade::orderBy('order')->get()
        ]);
    }

    public function destroy(Grade $grade)
    {
        // Check if grade has any classes
        if (SchoolClass::where('grade_id', $grade->id)->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete grade because it has associated classes.');
        }

        $grade->delete();

        // Reorder remaining grades to fill the gap
        Grade::fixOrdering();

        return redirect()->back()->with('success', 'Grade deleted successfully.');
    }
}