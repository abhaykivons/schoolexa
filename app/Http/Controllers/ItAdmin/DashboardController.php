<?php

namespace App\Http\Controllers\ItAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display IT Admin dashboard
     */
    public function index()
    {
        $itAdmin = Auth::user();

        // Get stats for IT Admin's school only
        $totalUsers = User::where('company_id', $itAdmin->company_id)
            ->where('id', '!=', $itAdmin->id) // Exclude IT Admin themselves
            ->count();

        $totalStaff = User::where('company_id', $itAdmin->company_id)
            ->where('type', 'staff')
            ->count();

        $totalAdmins = User::where('company_id', $itAdmin->company_id)
            ->where('type', 'admin')
            ->count();

        $totalParents = User::where('company_id', $itAdmin->company_id)
            ->where('type', 'parent')
            ->count();

        $totalStudents = User::where('company_id', $itAdmin->company_id)
            ->where('type', 'student')
            ->count();

        return Inertia::render('it-admin/Dashboard', [
            'stats' => [
                'total_users' => $totalUsers,
                'total_staff' => $totalStaff,
                'total_admins' => $totalAdmins,
                'total_parents' => $totalParents,
                'total_students' => $totalStudents,
                'system_status' => 'operational',
            ],
        ]);
    }
}
