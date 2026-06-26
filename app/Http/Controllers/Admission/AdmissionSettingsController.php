<?php

namespace App\Http\Controllers\Admission;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdmissionSettingsController extends Controller
{
    public function index()
    { 
        return Inertia::render('modules/student-admission/setting');
    }
}
