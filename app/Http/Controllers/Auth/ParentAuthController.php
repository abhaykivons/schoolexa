<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ParentAuthController extends Controller
{
    public function index($uuid)
    {
        $company = Company::where('uuid', $uuid)->firstOrFail();
        return Inertia::render('auth/school-login', ['company' => $company]);
    }


    public function create($uuid)
    {
        $company = Company::where('uuid', $uuid)->firstOrFail();
        return Inertia::render('auth/parent-register', ['company' => $company]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'uuid' => 'required|string|max:255',
            'email' => 'required|string|lowercase|max:255|unique:'.User::class,
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $company = Company::where('uuid', $validated['uuid'])->firstOrFail();

            // Create the parent user
            $parent = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'company_id' => $company->id,
                'password' => bcrypt($validated['password']),
                'type' => 'parent',
                'status' => true,
                'is_login' => true,
            ]);

            setPermissionsTeamId($company->id);
            $parent->assignRole('Parent');
            
            // Trigger parent registered notification
            try {
                NotificationService::parentRegistered($parent);
            } catch (\Exception $e) {
                Log::warning('Failed to send parent registration notification', [
                    'parent_id' => $parent->id,
                    'error' => $e->getMessage()
                ]);
            }
            
            // Log the parent in
            Auth::login($parent);

            return redirect()->route('parent.students.index');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Registration failed. Please try again.',
            ])->withInput($request->except('password', 'password_confirmation'));
        }
    }
}
