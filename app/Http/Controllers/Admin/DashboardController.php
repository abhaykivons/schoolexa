<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display Admin dashboard (Dean/Principal/Admin)
     */
    public function index()
    {
        return Inertia::render('admin/Dashboard', [
            'stats' => [
                'total_students' => 0,
                'total_staff' => 0,
                'pending_admissions' => 0,
                'pending_enrollments' => 0,
            ],
        ]);
    }
}
