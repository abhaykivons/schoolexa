<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::get();
        
        return Inertia::render('modules/settings/subjects', [
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code',
            'description' => 'nullable|string|max:500',
            'type' => 'required|in:core,elective',
        ]);

        Subject::create($request->only(['name', 'code', 'description', 'type']));

        return redirect()->back()->with('success', 'Subject created successfully');
    }

    public function update(Request $request, Subject $subject)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code,'.$subject->id,
            'description' => 'nullable|string|max:500',
            'type' => 'required|in:core,elective',
        ]);

        $subject->update($request->only(['name', 'code', 'description', 'type']));

        return redirect()->back()->with('success', 'Subject updated successfully');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();
        
        return redirect()->back()->with('success', 'Subject deleted successfully');
    }
}