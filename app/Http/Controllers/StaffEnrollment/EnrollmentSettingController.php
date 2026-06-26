<?php

namespace App\Http\Controllers\StaffEnrollment;

use App\Http\Controllers\Controller;
use App\Models\ApprovalFlow;
use App\Models\EnrollmentDocument;
use App\Models\EnrollmentFormSetting;
use App\Models\Scopes\CompanyScope;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EnrollmentSettingController extends Controller
{

    public function index()
    {
        if (!Auth::user()) {
            // This endpoint is public (no session), so CompanyScope now fails
            // closed for it. Opt out explicitly to preserve existing behavior.
            // KNOWN LIMITATION (deferred, see SECURITY_REMEDIATION.md): the public
            // form carries no company identifier, so it cannot be scoped to a
            // single school and returns documents/config across companies. Needs a
            // company-bound public route before this can be properly scoped.
            $documents = EnrollmentDocument::withoutGlobalScope(CompanyScope::class)
                ->where('type', 'staff-enrollment')
                ->where('is_visible', true)
                ->orderBy('created_at', 'desc')
                ->get();

            $config = EnrollmentFormSetting::withoutGlobalScope(CompanyScope::class)
                ->where('form_type', 'staff-enrollment-setting-configuration')->first();

            return response()->json([
                'documents' => $documents,
                'config' => $config
            ]);
        }
        
        $documents = EnrollmentDocument::where('type', 'staff-enrollment')
            ->orderBy('created_at', 'desc')
            ->get();

        $config = EnrollmentFormSetting::where('form_type', 'staff-enrollment-setting-configuration')->first();
        $users = User::with('roles')->where('status', 1)->where('company_id', Auth::user()->company_id)->whereNot('type', 'parent')->get();
        $approvers = ApprovalFlow::with(['user' => function($query) {
            $query->with('roles');
        }])
        ->where('module_type', 'staff_enrollment')
        ->orderBy('order')
        ->get();

        return response()->json([
            'documents' => $documents,
            'config' => $config,
            'users' => $users,
            'approvers' => $approvers
        ]);
    }

    public function create()
    {
        return Inertia::render('modules/staff/setting');
    }


    public function store(Request $request)
    {
        if ($request->has('form_type') && $request->form_type == 'staff-enrollment-setting-configuration') {
            $validated = $request->validate([
                'form_title' => 'nullable|string|max:255',
                'notification_email' => 'nullable|email|max:255',
                'form_description' => 'nullable|string',
                'public_access_enabled' => 'required|in:0,1',
                'school_logo' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
                'id' => 'nullable|exists:enrollment_form_settings,id',
            ]);

            $data = [
                'form_type' => 'staff-enrollment-setting-configuration',
                'form_title' => $validated['form_title'] ?? '',
                'notification_email' => $validated['notification_email'] ?? '',
                'form_description' => $validated['form_description'] ?? '',
                'public_access_enabled' => $validated['public_access_enabled'] === '1',
            ];

            if ($request->hasFile('school_logo')) {
                $path = $request->file('school_logo')->store('logos', 'public');
                $data['school_logo'] = $path;
            }

            if ($request->filled('id')) {
                $config = EnrollmentFormSetting::find($validated['id']);
                $config->update($data);
            } else {
                $config = EnrollmentFormSetting::where('form_type', 'staff-enrollment-setting-configuration')->first();
                if ($config) {
                    $config->update($data);
                } else {
                    $config = EnrollmentFormSetting::create($data);
                }
            }

            return response()->json(['message' => 'Configuration saved successfully', 'data' => $config]);
        }


        if($request->has('form_type') && $request->form_type == 'staff-enrollment-setting-document') {
            $filePath = null;
            if ($request->hasFile('file')) {
                $filePath = $request->file('file')->store('enrollment-documents', 'public');
            }
    
            if ($request->filled('id')) {
                $document = EnrollmentDocument::findOrFail($request->id);

                $updateData = array_filter([
                    'name' => $request->name,
                    'description' => $request->description,
                    'is_required' => $request->has('is_required') ? $request->is_required : null,
                    'is_visible' => $request->has('is_visible') ? $request->is_visible : null,
                    'text_content' => $request->text_content,
                ], fn ($val) => !is_null($val));

                if ($request->hasFile('file')) {
                    $filePath = $request->file('file')->store('enrollment-documents', 'public');
                    if ($document->file_path) {
                        Storage::disk('public')->delete($document->file_path);
                    }
                    $updateData['file_path'] = $filePath;
                }

                $document->update($updateData);

                return response()->json([
                    'success' => true,
                    'document' => $document,
                    'message' => 'Document updated successfully'
                ]);
            }

    
            $request->validate([
                'id' => 'nullable|exists:enrollment_documents,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:20480',
            ]);
            // Else, create new
            $document = EnrollmentDocument::create([
                'name' => $request->name,
                'description' => $request->description,
                'type' => 'staff-enrollment',
                'file_path' => $filePath,
                'text_content' => $request->text_content,
                'is_required' => $request->is_required ?? '0',
                'is_visible' => $request->is_visible ?? '1',
            ]);
    
            return response()->json([
                'success' => true,
                'document' => $document,
                'message' => 'Document created successfully'
            ]);
        }
    }

    public function destroy($id)
    {
        $document = EnrollmentDocument::findOrFail($id);
        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }
        
        $document->delete();
        
        return redirect()->back()->with('success', 'Document deleted successfully');
    }
}