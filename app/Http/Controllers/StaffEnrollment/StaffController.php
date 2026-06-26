<?php

namespace App\Http\Controllers\StaffEnrollment;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Moduler;
use App\Models\Staff;
use App\Models\StaffEnrollment;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Stancl\Tenancy\Database\Models\Domain;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Log;

class StaffController extends Controller
{
    /**
     * Display the onboarding dashboard (staff applications stats and recent applicants).
     */
    public function onboardingDashboard(): Response
    {
        $pendingCount = StaffEnrollment::whereNull('enrollment_date')->count();
        $enrolledCount = StaffEnrollment::whereNotNull('enrollment_date')->count();
        $totalCount = StaffEnrollment::count();

        $recentApplicants = StaffEnrollment::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'full_legal_name' => $a->full_legal_name,
                'email_address' => $a->email_address,
                'position_title' => $a->position_title,
                'created_at' => $a->created_at?->format('M d, Y H:i'),
                'enrollment_date' => $a->enrollment_date?->format('M d, Y'),
                'is_enrolled' => $a->enrollment_date !== null,
            ]);

        $stats = [
            'total_applicants' => $totalCount,
            'pending_count' => $pendingCount,
            'enrolled_count' => $enrolledCount,
        ];

        return Inertia::render('onboarding/dashboard', [
            'stats' => $stats,
            'recentApplicants' => $recentApplicants,
        ]);
    }

    /**
     * Display the employee dashboard (staff stats and recent staff).
     */
    public function employeeDashboard(): Response
    {
        $enrolledStaff = Staff::with(['user', 'designation', 'department'])
            ->whereHas('enrollment', function ($query) {
                $query->whereNotNull('enrollment_date');
            })
            ->get();

        $totalCount = $enrolledStaff->count();
        $activeCount = $enrolledStaff->where('status', Staff::STATUS_ACTIVE)->count();

        $recentStaff = Staff::with(['user', 'designation', 'department'])
            ->whereHas('enrollment', fn ($q) => $q->whereNotNull('enrollment_date'))
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'full_name' => $s->user?->name ?? $s->full_name ?? '—',
                'email' => $s->user?->email ?? '—',
                'designation_name' => $s->designation?->name ?? '—',
                'department_name' => $s->department?->name ?? '—',
                'created_at' => $s->created_at?->format('M d, Y H:i'),
            ]);

        $stats = [
            'total_staff' => $totalCount,
            'active_count' => $activeCount,
        ];

        return Inertia::render('employee/dashboard', [
            'stats' => $stats,
            'recentStaff' => $recentStaff,
        ]);
    }

    public function index(): Response
    {
        $enrolledStaff = Staff::with(['user', 'designation', 'department', 'enrollment'])
            ->whereHas('enrollment', function ($query) {
                $query->whereNotNull('enrollment_date');
            })
            ->get();

        $appliedStaff = StaffEnrollment::whereNull('enrollment_date')
            ->get();

        // Get the modules for the current company
        $modules = Moduler::where('company_id', Auth::user()->company_id)
            ->get()
            ->pluck('status', 'name');

        $tenentDomain = Domain::where('tenant_id', tenant('id'))->pluck('domain');

        return Inertia::render('modules/staff/index', [
            'enrolledStaff' => $enrolledStaff,
            'appliedStaff' => $appliedStaff,
            'tenantDomain' => 'schoolexa.com', // ABHAY We need to change here after some time currantly we don't have tenant domain
            'modules' => $modules,
            'roles' => Role::all(),
        ]);
    }

    public function newApplicants(): Response
    {
        $appliedStaff = StaffEnrollment::whereNull('enrollment_date')
            ->get();

        // Get the modules for the current company
        $modules = Moduler::where('company_id', Auth::user()->company_id)
            ->get()
            ->pluck('status', 'name');

        $tenentDomain = Domain::where('tenant_id', tenant('id'))->pluck('domain');

        return Inertia::render('modules/staff/NewApplicants', [
            'appliedStaff' => $appliedStaff,
            'tenantDomain' => 'schoolexa.com', // Change this later
            'modules' => $modules,
            'roles' => Role::whereNotIn('name', ['Student', 'Parent', 'Admin'])->get(),
            'departments' => Department::get(),
        ]);
    }
    
    public function create()
    {
        return Inertia::render('modules/staff/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
            'email' => 'nullable|string|email|max:255|unique:users',
            'application_id' => 'required|exists:staff_enrollments,id',
            'department_id' => 'required|exists:departments,id',
        ]);

        try {
            DB::beginTransaction();

            $appliedStaff = StaffEnrollment::findOrFail($request->application_id);

            $is_login = $request->has('create_login') && $request->create_login;

            if ($is_login && $request->has('send_credentials') && $request->send_credentials) {
                $request->validate([
                    'email' => 'required|string|email|max:255|unique:users',
                ]);
            }

            $password = Str::random(8);

            // Create the user
            $user = User::create([
                'name'       => $appliedStaff->full_legal_name,
                'email'      => $request->email ?? $appliedStaff->email_address,
                'password'   => Hash::make($password),
                'status'     => true,
                'is_login'   => $is_login,
                'created_by' => Auth::id(),
                'company_id' => Auth::user()->company_id,
            ]);

            // Update or create staff record
            Staff::create([
                'user_id'        => $user->id,
                'role_id'        => $request->role_id,
                'department_id'  => $request->department_id,
                'enrollment_id'  => $appliedStaff->id,
                'status'         => true,
            ]);

            $appliedStaff->update([
                'enrollment_date' => now(),
            ]);

            // Assign role to the user
            setPermissionsTeamId(session('company_id'));
            $user->assignRole(Role::findById($request->role_id));

            DB::commit();

            // Send staff account created notification (in-app + email via notification flow)
            if ($request->has('send_credentials') && $request->send_credentials) {
                try {
                    NotificationService::staffAccountCreated($user, $password);
                } catch (\Exception $e) {
                    Log::warning('Failed to send staff account created notification', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return redirect()->route('staff.index')->with('success', 'Staff member created successfully.');

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error creating staff member: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Something went wrong: ' . $e->getMessage()]);
        }
    }
}
