<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stancl\Tenancy\Database\Models\Domain;

class TenantController extends Controller
{
    /**
     * Display a listing of all tenants (schools).
     */
    public function index(Request $request)
    {
        $tenants = Tenant::with('domains')
            ->when($request->search, function ($query, $search) {
                $query->where('id', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('developer/tenants/index', [
            'tenants' => $tenants,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new tenant.
     */
    public function create()
    {
        return Inertia::render('developer/tenants/create');
    }

    /**
     * Store a newly created tenant.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tenants,name',
            'domain' => 'required|string|max:255|unique:domains,domain',
        ]);

        $tenant = Tenant::create([
            'name' => $validated['name'],
        ]);

        $tenant->domains()->create([
            'domain' => $validated['domain'],
        ]);

        return redirect()->route('developer.tenants.index')
            ->with('success', 'Tenant created successfully.');
    }

    /**
     * Display the specified tenant.
     */
    public function show(Tenant $tenant)
    {
        $tenant->load('domains');
        
        return Inertia::render('developer/tenants/show', [
            'tenant' => $tenant,
        ]);
    }

    /**
     * Show the form for editing the specified tenant.
     */
    public function edit(Tenant $tenant)
    {
        $tenant->load('domains');
        
        return Inertia::render('developer/tenants/edit', [
            'tenant' => $tenant,
        ]);
    }

    /**
     * Update the specified tenant.
     */
    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tenants,name,' . $tenant->id,
        ]);

        $tenant->update($validated);

        return redirect()->route('developer.tenants.show', $tenant)
            ->with('success', 'Tenant updated successfully.');
    }

    /**
     * Remove the specified tenant.
     */
    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return redirect()->route('developer.tenants.index')
            ->with('success', 'Tenant deleted successfully.');
    }

    /**
     * Add a domain to a tenant.
     */
    public function addDomain(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'domain' => 'required|string|max:255|unique:domains,domain',
        ]);

        $tenant->domains()->create([
            'domain' => $validated['domain'],
        ]);

        return redirect()->back()
            ->with('success', 'Domain added successfully.');
    }

    /**
     * Remove a domain from a tenant.
     */
    public function removeDomain(Tenant $tenant, Domain $domain)
    {
        if ($domain->tenant_id !== $tenant->id) {
            abort(403, 'Domain does not belong to this tenant.');
        }

        $domain->delete();

        return redirect()->back()
            ->with('success', 'Domain removed successfully.');
    }
}
