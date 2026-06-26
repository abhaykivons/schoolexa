<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SupportTicketController extends Controller
{
    /**
     * Display the support dashboard (overview, stats, recent tickets).
     */
    public function dashboard()
    {
        $userId = Auth::id();

        $stats = [
            'total_tickets' => SupportTicket::where('user_id', $userId)->count(),
            'open_tickets' => SupportTicket::where('user_id', $userId)->where('status', 'open')->count(),
            'in_progress_tickets' => SupportTicket::where('user_id', $userId)->where('status', 'in_progress')->count(),
            'resolved_tickets' => SupportTicket::where('user_id', $userId)->where('status', 'resolved')->count(),
            'closed_tickets' => SupportTicket::where('user_id', $userId)->where('status', 'closed')->count(),
        ];

        $recentTickets = SupportTicket::where('user_id', $userId)
            ->withCount('replies')
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('support/dashboard', [
            'stats' => $stats,
            'recentTickets' => $recentTickets,
        ]);
    }

    /**
     * Display a listing of the user's support tickets.
     */
    public function index(Request $request)
    {
        $tickets = SupportTicket::where('user_id', Auth::id())
            ->when($request->search, function ($query, $search) {
                $query->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->ticket_type, function ($query, $type) {
                $query->where('ticket_type', $type);
            })
            ->when($request->priority, function ($query, $priority) {
                $query->where('priority', $priority);
            })
            ->with(['replies' => function ($query) {
                $query->orderBy('created_at', 'desc');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('support/tickets/index', [
            'tickets' => $tickets,
            'filters' => $request->only(['search', 'status', 'ticket_type', 'priority']),
        ]);
    }

    /**
     * Show the form for creating a new support ticket.
     */
    public function create()
    {
        return Inertia::render('support/tickets/create');
    }

    /**
     * Store a newly created support ticket.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'ticket_type' => 'required|in:bug,feature_request,error_report,question,other',
            'priority' => 'required|in:low,medium,high,urgent',
            'expected_resolution_date' => 'nullable|date|after:today',
            'attachments' => 'nullable|array',
            'attachments.*' => 'nullable|string|max:255',
        ]);

        // Get tenant ID from current tenant context
        $tenantId = tenant('id');

        $ticket = SupportTicket::create([
            'tenant_id' => $tenantId,
            'user_id' => Auth::id(),
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'ticket_type' => $validated['ticket_type'],
            'priority' => $validated['priority'],
            'expected_resolution_date' => $validated['expected_resolution_date'] ?? null,
            'attachments' => $validated['attachments'] ?? [],
            'status' => 'open',
        ]);

        return redirect()->route('support.tickets.show', $ticket)
            ->with('success', 'Support ticket created successfully. Our team will review it soon.');
    }

    /**
     * Display the specified support ticket.
     */
    public function show(SupportTicket $ticket)
    {
        // Ensure user can only view their own tickets
        if ($ticket->user_id !== Auth::id()) {
            abort(403, 'You do not have permission to view this ticket.');
        }

        $ticket->load(['replies.user', 'user']);

        return Inertia::render('support/tickets/show', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * Add a reply to the support ticket.
     */
    public function addReply(Request $request, SupportTicket $ticket)
    {
        // Ensure user can only reply to their own tickets
        if ($ticket->user_id !== Auth::id()) {
            abort(403, 'You do not have permission to reply to this ticket.');
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $ticket->replies()->create([
            'user_id' => Auth::id(),
            'message' => $validated['message'],
            'is_internal' => false,
        ]);

        // Update ticket status to open if it was closed/resolved
        if (in_array($ticket->status, ['resolved', 'closed'])) {
            $ticket->update(['status' => 'open']);
        }

        return redirect()->back()
            ->with('success', 'Reply added successfully.');
    }
}
