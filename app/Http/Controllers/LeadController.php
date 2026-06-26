<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Mail\LeadConfirmationMail;
use App\Mail\NewLeadNotificationMail;
use App\Services\RecaptchaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LeadController extends Controller
{
    protected RecaptchaService $recaptcha;

    public function __construct(RecaptchaService $recaptcha)
    {
        $this->recaptcha = $recaptcha;
    }

    /**
     * Verify reCAPTCHA token
     */
    private function verifyRecaptcha(Request $request): bool
    {
        $token = $request->input('recaptcha_token');
        return $this->recaptcha->verify($token);
    }

    /**
     * Send confirmation email to lead and notification to admin
     */
    private function sendEmails(Lead $lead): void
    {
        try {
            // Send confirmation email to the lead
            Mail::to($lead->email)->send(new LeadConfirmationMail($lead));
            
            // Send notification to admin/sales team
            $adminEmail = config('mail.admin_email', 'sales@schoolexa.com');
            Mail::to($adminEmail)->send(new NewLeadNotificationMail($lead));
        } catch (\Exception $e) {
            // Log the error but don't fail the request
            Log::error('Failed to send lead emails: ' . $e->getMessage(), [
                'lead_id' => $lead->id,
                'lead_email' => $lead->email,
            ]);
        }
    }

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

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . addcslashes($search, '%_') . '%')
                  ->orWhere('email', 'like', '%' . addcslashes($search, '%_') . '%')
                  ->orWhere('school_name', 'like', '%' . addcslashes($search, '%_') . '%');
            });
        }

        $leads = $query->paginate(20)->withQueryString();

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

        return Inertia::render('settings/leads', [
            'leads' => $leads,
            'filters' => $request->only(['type', 'status', 'search']),
            'typeCounts' => $typeCounts,
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
     * Delete a lead
     */
    public function destroy(Lead $lead)
    {
        $lead->delete();

        return back()->with('success', 'Lead deleted successfully.');
    }

    /**
     * Store a waitlist signup
     */
    public function waitlist(Request $request)
    {
        // Verify reCAPTCHA
        if (!$this->verifyRecaptcha($request)) {
            return back()->withErrors(['message' => 'Security verification failed. Please try again.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'school_name' => 'nullable|string|max:255',
        ]);

        // Sanitize inputs
        $validated = $this->sanitizeInputs($validated);

        $lead = Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'school_name' => $validated['school_name'] ?? null,
            'type' => 'waitlist',
            'source' => 'website',
            'status' => 'new',
        ]);

        // Send confirmation and notification emails
        $this->sendEmails($lead);

        return back()->with('success', 'Thank you for joining our waitlist! We\'ll be in touch soon.');
    }

    /**
     * Sanitize input data
     */
    private function sanitizeInputs(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                // Strip HTML tags
                $value = strip_tags($value);
                // Remove potential script injections
                $value = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $value);
                // Trim whitespace
                $value = trim($value);
                $data[$key] = $value;
            }
        }
        return $data;
    }

    /**
     * Store a demo request
     */
    public function demo(Request $request)
    {
        // Verify reCAPTCHA
        if (!$this->verifyRecaptcha($request)) {
            return back()->withErrors(['message' => 'Security verification failed. Please try again.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'school_name' => 'required|string|max:255',
            'school_size' => 'nullable|string|max:50',
            'role' => 'nullable|string|max:100',
        ]);

        // Sanitize inputs
        $validated = $this->sanitizeInputs($validated);

        $lead = Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'school_name' => $validated['school_name'],
            'school_size' => $validated['school_size'] ?? null,
            'role' => $validated['role'] ?? null,
            'type' => 'demo',
            'source' => 'website',
            'status' => 'new',
        ]);

        // Send confirmation and notification emails
        $this->sendEmails($lead);

        return back()->with('success', 'Demo request submitted! Our team will contact you within 24 hours.');
    }

    /**
     * Store a contact sales inquiry
     */
    public function contactSales(Request $request)
    {
        // Verify reCAPTCHA
        if (!$this->verifyRecaptcha($request)) {
            return back()->withErrors(['message' => 'Security verification failed. Please try again.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'school_name' => 'required|string|max:255',
            'school_size' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:1000',
        ]);

        // Sanitize inputs
        $validated = $this->sanitizeInputs($validated);

        $lead = Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'school_name' => $validated['school_name'],
            'school_size' => $validated['school_size'] ?? null,
            'message' => $validated['message'] ?? null,
            'type' => 'contact_sales',
            'source' => 'website',
            'status' => 'new',
        ]);

        // Send confirmation and notification emails
        $this->sendEmails($lead);

        return back()->with('success', 'Thank you for your interest! Our sales team will reach out shortly.');
    }

    /**
     * Store a partner application
     */
    public function partner(Request $request)
    {
        // Verify reCAPTCHA
        if (!$this->verifyRecaptcha($request)) {
            return back()->withErrors(['message' => 'Security verification failed. Please try again.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company_name' => 'required|string|max:255',
            'company_website' => 'nullable|url|max:255',
            'partner_type' => 'required|string|max:100',
            'message' => 'nullable|string|max:2000',
        ]);

        // Sanitize inputs
        $validated = $this->sanitizeInputs($validated);

        $lead = Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'company_name' => $validated['company_name'],
            'company_website' => $validated['company_website'] ?? null,
            'partner_type' => $validated['partner_type'],
            'message' => $validated['message'] ?? null,
            'type' => 'partner',
            'source' => 'website',
            'status' => 'new',
        ]);

        // Send confirmation and notification emails
        $this->sendEmails($lead);

        return back()->with('success', 'Thank you for your partner application! Our team will contact you within 2-3 business days.');
    }

    /**
     * Store a general contact form submission
     */
    public function contact(Request $request)
    {
        // Verify reCAPTCHA
        if (!$this->verifyRecaptcha($request)) {
            return back()->withErrors(['message' => 'Security verification failed. Please try again.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'subject' => 'required|string|max:255',
            'department' => 'nullable|string|max:100',
            'message' => 'required|string|max:2000',
        ]);

        // Sanitize inputs
        $validated = $this->sanitizeInputs($validated);

        $lead = Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'company_name' => $validated['company'] ?? null,
            'message' => "Subject: {$validated['subject']}\nDepartment: " . ($validated['department'] ?? 'General') . "\n\n{$validated['message']}",
            'type' => 'contact',
            'source' => 'website',
            'status' => 'new',
        ]);

        // Send confirmation and notification emails
        $this->sendEmails($lead);

        return back()->with('success', 'Thank you for your message! We\'ll get back to you within 24 hours.');
    }

    /**
     * Store a free trial signup
     */
    public function freeTrial(Request $request)
    {
        // Verify reCAPTCHA
        if (!$this->verifyRecaptcha($request)) {
            return back()->withErrors(['message' => 'Security verification failed. Please try again.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'school_name' => 'required|string|max:255',
            'school_size' => 'nullable|string|max:50',
            'role' => 'nullable|string|max:100',
        ]);

        // Sanitize inputs
        $validated = $this->sanitizeInputs($validated);

        $lead = Lead::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'school_name' => $validated['school_name'],
            'school_size' => $validated['school_size'] ?? null,
            'role' => $validated['role'] ?? null,
            'type' => 'free_trial',
            'source' => 'website',
            'status' => 'new',
        ]);

        // Send confirmation and notification emails
        $this->sendEmails($lead);

        return back()->with('success', 'Your free trial is being set up! Check your email for login details.');
    }
}

