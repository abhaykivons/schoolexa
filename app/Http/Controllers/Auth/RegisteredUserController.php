<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ApprovalFlow;
use App\Models\Company;
use App\Models\Moduler;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Stancl\Tenancy\Database\Models\Domain;


class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */


    // public function store(Request $request): RedirectResponse
    // {
    //     $request->validate([
    //         'name' => 'required|string|max:255',
    //         'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
    //         'password' => ['required', 'confirmed', Rules\Password::defaults()],
    //         'domain' => 'required|string|regex:/^[a-z0-9-]+$/|unique:domains,domain',

    //     ]);

    //     $user = User::create([
    //         'name' => $request->name,
    //         'email' => $request->email,
    //         'password' => Hash::make($request->password),
    //     ]);

    //     event(new Registered($user));

    //     Auth::login($user);
    //     $username = strtolower($request->input('name'));

    //     $tenantName = strtolower($request->input('domain'));

    //     // 1. Create the tenant in the central database
    //     $tenant = Tenant::create([
    //         'name' => $username,
    //     ]);

    //     // 3. Initialize tenancy (sets up the tenant database connection)
    //     tenancy()->initialize($tenant);

    //     // 2. Create the domain for the tenant (in central context)
    //     $tenant->domains()->create([
    //         'domain' => $request->domain.".schoolexa.com",
    //     ]);

    //     // 4. Run tenant migrations
    //     Artisan::call('migrate', [
    //         '--path' => 'database/migrations/tenant',
    //         '--force' => true,
    //     ]);

    //     Artisan::call('db:seed', [
    //         '--class' => 'TenantDatabaseSeeder', // Adjust to your seeder class name
    //         '--force' => true,
    //     ]);

    //     // End tenancy
    //     tenancy()->end();

    //     // Redirect to tenant subdomain
    //     return redirect()->away("http://$tenantName.schoolexa.com");
    // }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        DB::beginTransaction();

        try {
            
            $company = Company::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => '123-456-7890',
                'address' => '123 School Lane, Education City',
                'country' => 'USA',
                'school_name' => 'Example School',
                'website' => 'https://www.example.com',
                'logo' => 'logos/3GaImeqqnsKd1mOsBeHBsnGg0iCLgM9FuucLYElX.png',
                'status' => true,
            ]);

            $DefualtModuler = [

                // Core Modules
                ['name' => 'Dashboard', 'code' => 'DASH', 'status' => true],
                ['name' => 'Staff Management & Enrollment', 'code' => 'STAFF', 'status' => true],
                ['name' => 'Student Management & Enrollment', 'code' => 'STUD', 'status' => true],
                ['name' => 'Attendance Management', 'code' => 'ATTEND', 'status' => true],
                ['name' => 'Leave & Substitute Management', 'code' => 'LEAVE', 'status' => true],
                ['name' => 'Event Scheduler', 'code' => 'EVENT', 'status' => true],
                ['name' => 'Calendar', 'code' => 'CALENDAR', 'status' => true],
                ['name' => 'Policy Center', 'code' => 'POLICY', 'status' => true],
                ['name' => 'Reports & Analytics', 'code' => 'REPORTS', 'status' => true],
                ['name' => 'Student & Staff Discipline & Behavior Management', 'code' => 'DISCIPLINE', 'status' => true],
                ['name' => 'Notifications & Alerts', 'code' => 'NOTIFICATIONS', 'status' => true],
                ['name' => 'School Trips', 'code' => 'TRIPS', 'status' => true],
                ['name' => 'Polls & Elections', 'code' => 'ELECTIONS', 'status' => true],
                ['name' => 'After-School Activities & Clubs', 'code' => 'ACTIVITIES', 'status' => true],
                ['name' => 'School Camp Management', 'code' => 'CAMP', 'status' => true],
                
                // Administrative Modules
                ['name' => 'Academic Years Management', 'code' => 'ACADEMIC_YEARS', 'status' => true],
                ['name' => 'Class Management', 'code' => 'CLASS', 'status' => true],
                ['name' => 'Class-Subject Assignments', 'code' => 'CLASS_SUBJECT', 'status' => true],
                ['name' => 'Department Management', 'code' => 'DEPARTMENT', 'status' => true],
                ['name' => 'Designations Management', 'code' => 'DESIGNATIONS', 'status' => true],
                ['name' => 'Grade Management', 'code' => 'GRADE', 'status' => true],
                ['name' => 'Subject Management', 'code' => 'SUBJECT', 'status' => true],
                ['name' => 'Fee Structure Management', 'code' => 'FEE_STRUCTURE', 'status' => true],
                ['name' => 'Payment Management', 'code' => 'PAYMENT', 'status' => true],

                // Communication Modules
                ['name' => 'Email', 'code' => 'EMAIL', 'status' => false],
                ['name' => 'Finance & Billing', 'code' => 'FINANCE', 'status' => false],
                ['name' => 'Payroll Management', 'code' => 'PAYROLL', 'status' => false],
                ['name' => 'Family Connect / Parent Portal', 'code' => 'FAMILY_CONNECT', 'status' => true],
                ['name' => 'Health & Medical Records', 'code' => 'HEALTH', 'status' => true],
                
                // Advance Modules
                ['name' => 'Examination & Assessment', 'code' => 'EXAMINATION', 'status' => false],
                ['name' => 'Homework & Assignments', 'code' => 'HOMEWORK', 'status' => false],
                ['name' => 'Online Classes & Virtual Learning', 'code' => 'ONLINE_CLASSES', 'status' => false],
                ['name' => 'Learning Management System (LMS)', 'code' => 'LMS', 'status' => false],
                ['name' => 'Transportation Management', 'code' => 'TRANSPORTATION', 'status' => false],
                ['name' => 'Dormitory / Hostel Management', 'code' => 'DORMITORY', 'status' => false],
                ['name' => 'Inventory & Asset Management', 'code' => 'INVENTORY', 'status' => false],
                ['name' => 'eStore / School Inventory', 'code' => 'ESTORE', 'status' => false],
                ['name' => 'Library Management', 'code' => 'LIBRARY', 'status' => false],
                ['name' => 'School Meal & Menu Management', 'code' => 'SCHOOL_MEAL', 'status' => false],
                ['name' => 'Document & File Management', 'code' => 'DOC', 'status' => false],

            ];

            foreach ($DefualtModuler as $module) {
                Moduler::create([
                    'company_id' => $company->id,
                    'name' => $module['name'],
                    'code' => $module['code'],
                    'status' => $module['status'],
                ]);
            }

            // Create permissions for all modules
            $moduleWisePermissions = [
                'DASH' => ['view_dashboard'],
                'STAFF' => ['view_staff', 'add_staff', 'edit_staff', 'delete_staff'],
                'STUD' => ['view_student', 'add_student', 'edit_student', 'delete_student'],
                'ATTEND' => ['view_attendance', 'add_attendance', 'edit_attendance', 'delete_attendance'],
                'LEAVE' => ['view_leave', 'add_leave', 'edit_leave', 'delete_leave'],
                'EVENT' => ['view_event', 'add_event', 'edit_event', 'delete_event'],
                'CALENDAR' => ['view_calendar', 'add_calendar_event', 'edit_calendar_event', 'delete_calendar_event'],
                'POLICY' => ['view_policy', 'add_policy', 'edit_policy', 'delete_policy'],
                'REPORTS' => ['view_reports'],
                'DISCIPLINE' => ['view_discipline', 'add_discipline', 'edit_discipline', 'delete_discipline'],
                'NOTIFICATIONS' => ['view_notifications', 'send_notification'],
                'TRIPS' => ['view_trips', 'add_trip', 'edit_trip', 'delete_trip'],
                'ELECTIONS' => ['view_elections', 'add_election', 'edit_election', 'delete_election'],
                'ACTIVITIES' => ['view_activities', 'add_activity', 'edit_activity', 'delete_activity'],
                'CAMP' => ['view_camps', 'add_camp', 'edit_camp', 'delete_camp'],
                'ACADEMIC_YEARS' => ['view_academic_years', 'add_academic_year', 'edit_academic_year', 'delete_academic_year'],
                'CLASS' => ['view_classes', 'add_class', 'edit_class', 'delete_class'],
                'CLASS_SUBJECT' => ['view_class_subjects', 'assign_subject_to_class', 'edit_class_subject', 'remove_class_subject'],
                'DEPARTMENT' => ['view_departments', 'add_department', 'edit_department', 'delete_department'],
                'DESIGNATIONS' => ['view_designations', 'add_designation', 'edit_designation', 'delete_designation'],
                'GRADE' => ['view_grades', 'add_grade', 'edit_grade', 'delete_grade'],
                'SUBJECT' => ['view_subjects', 'add_subject', 'edit_subject', 'delete_subject'],
                'FEE_STRUCTURE' => ['view_fee_structures', 'add_fee_structure', 'edit_fee_structure', 'delete_fee_structure'],
                'PAYMENT' => ['view_payments', 'add_payment', 'edit_payment', 'delete_payment'],
                'FAMILY_CONNECT' => ['view_family_connect', 'add_family_member', 'edit_family_member', 'delete_family_member'],
                'HEALTH' => ['view_health_records', 'add_health_record', 'edit_health_record', 'delete_health_record'],
                'EXAMINATION' => ['view_examinations', 'add_examination', 'edit_examination', 'delete_examination'],
                'HOMEWORK' => ['view_homework', 'add_homework', 'edit_homework', 'delete_homework'],
                'ONLINE_CLASSES' => ['view_online_classes', 'schedule_online_class', 'edit_online_class', 'delete_online_class'],
                'LMS' => ['view_lms', 'add_course', 'edit_course', 'delete_course'],
                'TRANSPORTATION' => ['view_transportation', 'add_transport_vehicle', 'edit_transport_vehicle', 'delete_transport_vehicle'],
                'DORMITORY' => ['view_dormitories', 'add_dormitory', 'edit_dormitory', 'delete_dormitory'],
                'INVENTORY' => ['view_inventory', 'add_inventory_item', 'edit_inventory_item', 'delete_inventory_item'],
                'ESTORE' => ['view_estore', 'add_estore_item', 'edit_estore_item', 'delete_estore_item'],
                'LIBRARY' => ['view_library', 'add_book', 'edit_book', 'delete_book'],
                'SCHOOL_MEAL' => ['view_meals', 'add_meal', 'edit_meal', 'delete_meal'],
                'DOC' => ['view_documents', 'add_document', 'edit_document', 'delete_document'],
                'EMAIL' => ['view_emails', 'send_email', 'edit_email_settings'],
                'FINANCE' => ['view_financial_reports', 'add_transaction', 'edit_transaction', 'delete_transaction'],
                'PAYROLL' => ['view_payroll', 'process_payroll', 'edit_payroll_settings'],
            ];

            setPermissionsTeamId($company->id);

            foreach ($moduleWisePermissions as $moduleCode => $permissions) {
                $moduler = Moduler::where('company_id', $company->id)->where('code', $moduleCode)->first();
                if ($moduler) {
                    foreach ($permissions as $permissionName) {
                        Permission::firstOrCreate([
                            'name' => $permissionName,
                            'guard_name' => 'web',
                            'moduler_id' => $moduler->id,
                        ]);
                    }
                }
            }

            // Step 1: Create user in central DB
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'company_id' => $company->id,
                'type' => 'admin',
                'portal_type' => 'admin', // Set portal type for admin user
                'is_login' => true,
                'status' => true,
            ]);

            // Create Admin role and assign all permissions
            $adminRole = Role::firstOrCreate([
                'company_id' => $company->id,
                'name' => 'Admin',
            ], [
                'hierarchy_level' => 1,
                'is_visible' => 1,
                'guard_name' => 'web',
            ]);

            // Assign all permissions to Admin role
            $allPermissions = Permission::where('guard_name', 'web')->pluck('id')->toArray();
            if (!empty($allPermissions)) {
                $adminRole->syncPermissions($allPermissions);
            }

            // Assign Admin role to user
            $user->assignRole($adminRole);

            Log::info('User created successfully: ' . $user->company_id);
            event(new Registered($user));
            Auth::login($user);

            $tenantName = strtolower($request->input('name'));

            // Step 2: Create tenant
            $tenant = Tenant::create([
                'name' => $tenantName,
            ]);

            // Step 3: Add tenant domain
            $tenant->domains()->create([
                'domain' => "$tenantName.schoolexa.com",
            ]);

            // Initialize tenancy in a separate transaction as it might need to commit
            DB::commit();

            try {
                // Step 4: Initialize tenancy
                tenancy()->initialize($tenant);

                // Step 5: Run tenant migrations
                Artisan::call('migrate', [
                    '--path' => 'database/migrations/tenant',
                    '--force' => true,
                ]);

                // Step 6: Seed tenant database if needed
                Artisan::call('db:seed', [
                    '--class' => 'TenantDatabaseSeeder',
                    '--force' => true,
                ]);

                Log::info('Tenant initialized successfully: ' . $tenantName);

                // Step 7: Create company in tenant DB
                $tenantCompany = \App\Models\Company::create([
                    'name' => $company->name,
                    'email' => $company->email,
                    'phone' => $company->phone,
                    'address' => $company->address,
                    'logo' => $company->logo,
                    'status' => $company->status,
                ]);

                // Step 8: Create same user in tenant DB
                $tenantUser = \App\Models\User::create([
                    'name' => $user->name,
                    'email' => $user->email,
                    'password' => $user->password,
                    'company_id' => $tenantCompany->id,
                    'type' => 'admin',
                    'portal_type' => 'admin', // Set portal type for admin user
                    'is_login' => true,
                    'status' => true,
                ]);

                // Create Admin role in tenant DB and assign all permissions
                setPermissionsTeamId($tenantCompany->id);
                
                // Create modules and permissions in tenant DB (same as central DB)
                foreach ($DefualtModuler as $module) {
                    \App\Models\Moduler::create([
                        'company_id' => $tenantCompany->id,
                        'name' => $module['name'],
                        'code' => $module['code'],
                        'status' => $module['status'],
                    ]);
                }

                // Create permissions in tenant DB
                foreach ($moduleWisePermissions as $moduleCode => $permissions) {
                    $moduler = \App\Models\Moduler::where('company_id', $tenantCompany->id)->where('code', $moduleCode)->first();
                    if ($moduler) {
                        foreach ($permissions as $permissionName) {
                            \Spatie\Permission\Models\Permission::firstOrCreate([
                                'name' => $permissionName,
                                'guard_name' => 'web',
                                'moduler_id' => $moduler->id,
                            ]);
                        }
                    }
                }

                // Create Admin role in tenant DB
                $tenantAdminRole = \Spatie\Permission\Models\Role::firstOrCreate([
                    'company_id' => $tenantCompany->id,
                    'name' => 'Admin',
                ], [
                    'hierarchy_level' => 1,
                    'is_visible' => 1,
                    'guard_name' => 'web',
                ]);

                // Assign all permissions to Admin role in tenant DB
                $tenantAllPermissions = \Spatie\Permission\Models\Permission::where('guard_name', 'web')->pluck('id')->toArray();
                if (!empty($tenantAllPermissions)) {
                    $tenantAdminRole->syncPermissions($tenantAllPermissions);
                }

                // Assign Admin role to tenant user
                $tenantUser->assignRole($tenantAdminRole);

                // Step 9: Create default approvers for Onboarding modules
                $defaultApproverModules = ['staff_enrollment', 'student_onboarding'];
                
                foreach ($defaultApproverModules as $moduleType) {
                    ApprovalFlow::create([
                        'company_id' => $tenantCompany->id,
                        'module_type' => $moduleType,
                        'user_id' => $tenantUser->id,
                        'order' => 1,
                        'is_email_send' => true,
                        'comment' => 'Default approver',
                        'is_active' => true,
                    ]);
                }

                Log::info('Default approvers created for tenant: ' . $tenantName);

                // Step 10: End tenancy
                tenancy()->end();

                // Step 11: Redirect to tenant subdomain
                return redirect()->away("https://$tenantName.schoolexa.com");

            } catch (\Exception $e) {
                // Log the error for debugging
                Log::error('Tenant initialization failed: ' . $e->getMessage());
                
                // Attempt to clean up by deleting the tenant if it was created
                try {
                    if (isset($tenant)) {
                        $tenant->delete();
                    }
                } catch (\Exception $cleanupException) {
                    Log::error('Tenant cleanup failed: ' . $cleanupException->getMessage());
                }

                // Redirect back with error message
                return redirect()->back()->withErrors([
                    'message' => 'Failed to initialize tenant. Please try again or contact support.'
                ]);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('User registration failed: ' . $e->getMessage());
            
            return redirect()->back()->withErrors([
                'message' => 'Registration failed. Please try again or contact support.'
            ]);
        }
    }

    public function bookDemo(Request $request): RedirectResponse
    {
        //
    }
}
