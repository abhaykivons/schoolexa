<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeadController extends Controller
{
    /**
     * Display a listing of leads
     */
    public function index(Request $request)
    {
        $query = Lead::query()->orderBy('created_at', 'desc');

        // Filter by type
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by source
        if ($request->filled('source') && $request->source !== 'all') {
            $query->where('source', $request->source);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('school_name', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $leads = $query->paginate(20)->withQueryString();

        // Get statistics
        $stats = [
            'total' => Lead::count(),
            'new' => Lead::where('status', 'new')->count(),
            'contacted' => Lead::where('status', 'contacted')->count(),
            'qualified' => Lead::where('status', 'qualified')->count(),
            'converted' => Lead::where('status', 'converted')->count(),
            'lost' => Lead::where('status', 'lost')->count(),
        ];

        // Get counts for each type
        $typeCounts = [
            'all' => Lead::count(),
            'waitlist' => Lead::where('type', 'waitlist')->count(),
            'demo' => Lead::where('type', 'demo')->count(),
            'free_trial' => Lead::where('type', 'free_trial')->count(),
            'contact_sales' => Lead::where('type', 'contact_sales')->count(),
            'partner' => Lead::where('type', 'partner')->count(),
            'contact' => Lead::where('type', 'contact')->count(),
        ];

        // Get counts for each status
        $statusCounts = [
            'all' => Lead::count(),
            'new' => Lead::where('status', 'new')->count(),
            'contacted' => Lead::where('status', 'contacted')->count(),
            'qualified' => Lead::where('status', 'qualified')->count(),
            'converted' => Lead::where('status', 'converted')->count(),
            'lost' => Lead::where('status', 'lost')->count(),
        ];

        return Inertia::render('developer/leads/Index', [
            'leads' => $leads,
            'filters' => $request->only(['type', 'status', 'source', 'search', 'date_from', 'date_to']),
            'stats' => $stats,
            'typeCounts' => $typeCounts,
            'statusCounts' => $statusCounts,
        ]);
    }

    /**
     * Display the specified lead
     */
    public function show(Lead $lead)
    {
        return Inertia::render('developer/leads/Show', [
            'lead' => $lead,
        ]);
    }

    /**
     * Update lead status
     */
    public function updateStatus(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,contacted,qualified,converted,lost',
        ]);

        $lead->update(['status' => $validated['status']]);

        return back()->with('success', 'Lead status updated successfully.');
    }

    /**
     * Update lead information
     */
    public function update(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'school_name' => 'nullable|string|max:255',
            'school_size' => 'nullable|string|max:50',
            'company_name' => 'nullable|string|max:255',
            'company_website' => 'nullable|url|max:255',
            'partner_type' => 'nullable|string|max:100',
            'role' => 'nullable|string|max:100',
            'message' => 'nullable|string|max:5000',
            'status' => 'sometimes|required|in:new,contacted,qualified,converted,lost',
            'type' => 'sometimes|required|in:waitlist,demo,contact_sales,free_trial,partner,contact',
            'source' => 'nullable|string|max:255',
        ]);

        $lead->update($validated);

        return back()->with('success', 'Lead updated successfully.');
    }

    /**
     * Delete a lead
     */
    public function destroy(Lead $lead)
    {
        $lead->delete();

        return redirect()->route('developer.leads.index')
            ->with('success', 'Lead deleted successfully.');
    }

    /**
     * Bulk update lead statuses
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'lead_ids' => 'required|array',
            'lead_ids.*' => 'exists:leads,id',
            'status' => 'required|in:new,contacted,qualified,converted,lost',
        ]);

        Lead::whereIn('id', $validated['lead_ids'])
            ->update(['status' => $validated['status']]);

        return back()->with('success', count($validated['lead_ids']) . ' leads updated successfully.');
    }

    /**
     * Bulk delete leads
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'lead_ids' => 'required|array',
            'lead_ids.*' => 'exists:leads,id',
        ]);

        Lead::whereIn('id', $validated['lead_ids'])->delete();

        return back()->with('success', count($validated['lead_ids']) . ' leads deleted successfully.');
    }

    /**
     * Export leads to CSV
     */
    public function export(Request $request)
    {
        $query = Lead::query();

        // Apply same filters as index
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $leads = $query->orderBy('created_at', 'desc')->get();

        $filename = 'leads_export_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($leads) {
            $file = fopen('php://output', 'w');

            // Add CSV headers
            fputcsv($file, [
                'ID',
                'Name',
                'Email',
                'Phone',
                'School Name',
                'Company Name',
                'Type',
                'Status',
                'Source',
                'Created At',
                'Updated At',
            ]);

            // Add data rows
            foreach ($leads as $lead) {
                fputcsv($file, [
                    $lead->id,
                    $lead->name,
                    $lead->email,
                    $lead->phone ?? '',
                    $lead->school_name ?? '',
                    $lead->company_name ?? '',
                    $lead->type,
                    $lead->status,
                    $lead->source ?? '',
                    $lead->created_at->format('Y-m-d H:i:s'),
                    $lead->updated_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get lead statistics for dashboard
     */
    public function statistics()
    {
        $stats = [
            'total' => Lead::count(),
            'new' => Lead::where('status', 'new')->count(),
            'contacted' => Lead::where('status', 'contacted')->count(),
            'qualified' => Lead::where('status', 'qualified')->count(),
            'converted' => Lead::where('status', 'converted')->count(),
            'lost' => Lead::where('status', 'lost')->count(),
            'by_type' => [
                'waitlist' => Lead::where('type', 'waitlist')->count(),
                'demo' => Lead::where('type', 'demo')->count(),
                'free_trial' => Lead::where('type', 'free_trial')->count(),
                'contact_sales' => Lead::where('type', 'contact_sales')->count(),
                'partner' => Lead::where('type', 'partner')->count(),
                'contact' => Lead::where('type', 'contact')->count(),
            ],
            'recent' => Lead::orderBy('created_at', 'desc')->limit(10)->get(),
            'conversion_rate' => Lead::count() > 0 
                ? round((Lead::where('status', 'converted')->count() / Lead::count()) * 100, 2)
                : 0,
        ];

        return response()->json($stats);
    }
}
