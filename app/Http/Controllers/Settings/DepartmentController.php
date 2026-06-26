<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::orderBy('name')->get();

        return Inertia::render('modules/settings/departments', [
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(Department::rules());

        Department::create($data);

        return back()->with('success', 'Department created successfully');
    }

    public function update(Request $request, Department $department)
    {
        $data = $request->validate(Department::rules($department->id));

        $department->update($data);

        return back()->with('success', 'Department updated successfully');
    }

    public function destroy(Department $department)
    {
        // if (!$department->canBeDeleted()) {
        //     return back()->with('error', 
        //         'Cannot delete department with associated users or designations');
        // }

        $department->delete();

        return back()->with('success', 'Department deleted successfully');
    }
}
