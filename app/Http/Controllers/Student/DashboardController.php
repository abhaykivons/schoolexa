<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display Student dashboard
     */
    public function index()
    {
        return Inertia::render('student/Dashboard', [
            'stats' => [
                'attendance_percentage' => 0,
                'upcoming_exams' => 0,
                'assignments_due' => 0,
            ],
        ]);
    }
}
