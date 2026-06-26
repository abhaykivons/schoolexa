<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display Staff dashboard
     */
    public function index()
    {
        return Inertia::render('staff/Dashboard', [
            'stats' => [
                'my_classes' => 0,
                'my_students' => 0,
                'upcoming_events' => 0,
            ],
        ]);
    }
}
