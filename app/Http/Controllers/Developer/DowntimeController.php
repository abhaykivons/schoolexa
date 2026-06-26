<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\Downtime;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DowntimeController extends Controller
{
    /**
     * Display a listing of downtime incidents.
     */
    public function index(Request $request)
    {
        $downtimes = Downtime::with('tenant')
            ->when($request->search, function ($query, $search) {
                $query->where('description', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('started_at', 'desc')
            ->paginate(15);

        return Inertia::render('developer/downtime/index', [
            'downtimes' => $downtimes,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new downtime incident.
     */
    public function create()
    {
        $tenants = Tenant::orderBy('name')->get(['id', 'name']);
        
        return Inertia::render('developer/downtime/create', [
            'tenants' => $tenants,
        ]);
    }

    /**
     * Store a newly created downtime incident.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:1000',
            'started_at' => 'required|date',
            'tenant_id' => 'nullable|string|exists:tenants,id',
            'status' => 'required|in:scheduled,ongoing,resolved',
        ]);

        // Convert empty string to null for tenant_id
        if ($validated['tenant_id'] === '') {
            $validated['tenant_id'] = null;
        }

        $downtime = Downtime::create($validated);

        return redirect()->route('developer.downtime.index')
            ->with('success', 'Downtime incident created successfully.');
    }

    /**
     * Display the specified downtime incident.
     */
    public function show(Downtime $downtime)
    {
        $downtime->load('tenant');
        $tenants = Tenant::orderBy('name')->get(['id', 'name']);
        
        return Inertia::render('developer/downtime/show', [
            'downtime' => $downtime,
            'tenants' => $tenants,
        ]);
    }

    /**
     * Update the specified downtime incident.
     */
    public function update(Request $request, Downtime $downtime)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:1000',
            'started_at' => 'required|date',
            'resolved_at' => 'nullable|date|after:started_at',
            'tenant_id' => 'nullable|string|exists:tenants,id',
            'status' => 'required|in:scheduled,ongoing,resolved',
        ]);

        // Convert empty string to null for tenant_id
        if (isset($validated['tenant_id']) && $validated['tenant_id'] === '') {
            $validated['tenant_id'] = null;
        }

        // Convert empty string to null for resolved_at
        if (isset($validated['resolved_at']) && $validated['resolved_at'] === '') {
            $validated['resolved_at'] = null;
        }

        // Auto-set resolved_at if status is resolved and not set
        if ($validated['status'] === 'resolved' && empty($validated['resolved_at'])) {
            $validated['resolved_at'] = now();
        }

        $downtime->update($validated);

        return redirect()->route('developer.downtime.show', $downtime)
            ->with('success', 'Downtime incident updated successfully.');
    }

    /**
     * Remove the specified downtime incident.
     */
    public function destroy(Downtime $downtime)
    {
        $downtime->delete();

        return redirect()->route('developer.downtime.index')
            ->with('success', 'Downtime incident deleted successfully.');
    }
}
