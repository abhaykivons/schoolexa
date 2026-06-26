<?php

namespace App\Http\Controllers\Approval;

use App\Http\Controllers\Controller;
use App\Models\ApprovalFlow;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ApprovalFlowController extends Controller
{
    public function index(Request $request)
    {
        $moduleType = $request->module_type ?? ' ';
        $approvers = ApprovalFlow::with('user')
            ->where('module_type', $moduleType)
            ->orderBy('order')
            ->get();

        $users = User::where('status', 1)
            ->with('roles')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->join(', ')
                ];
            });

        return response()->json([
            'approvers' => $approvers,
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_type' => 'required|string',
            'user_id' => [
                'required',
                'exists:users,id',
                Rule::unique('approval_flows')
                    ->where('module_type', $request->module_type)
                    ->ignore($request->id)
            ],
            'order' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('approval_flows')
                    ->where('module_type', $request->module_type)
                    ->ignore($request->id)
            ],
            'is_email_send' => 'required|boolean',
            'comment' => 'nullable|string',
            'is_active' => 'required|boolean'
        ]);

        try {
            DB::beginTransaction();

            if ($request->has('id')) {
                $approver = ApprovalFlow::findOrFail($request->id);
                $approver->update($validated);
            } else {
                $existing = ApprovalFlow::where('user_id', $validated['user_id'])
                    ->where('module_type', $validated['module_type'])
                    ->first();

                if ($existing) {
                    return response()->json([
                        'message' => 'This user is already an approver for this module',
                        'approver' => $existing
                    ], 422);
                }

                $approver = ApprovalFlow::create($validated);
            }

            // Load the user with roles
            $approver->load(['user.roles']);

            DB::commit();

            return response()->json([
                'message' => 'Approver saved successfully',
                'approver' => $approver
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error saving approver: ' . $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $approver = ApprovalFlow::findOrFail($id);
        $approver->update(['is_active' => $request->is_active]);

        return response()->json([
            'message' => 'Status updated successfully',
            'approver' => $approver->load('user')
        ]);
    }

    public function destroy($id)
    {
        $approver = ApprovalFlow::findOrFail($id);
        $approver->delete();

        return response()->json(['message' => 'Approver deleted successfully']);
    }
}
