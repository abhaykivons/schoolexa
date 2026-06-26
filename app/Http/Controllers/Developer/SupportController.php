<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupportController extends Controller
{
    /**
     * Display a listing of support tickets.
     */
    public function index(Request $request)
    {
        $tickets = SupportTicket::with(['tenant', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->priority, function ($query, $priority) {
                $query->where('priority', $priority);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('developer/support/index', [
            'tickets' => $tickets,
            'filters' => $request->only(['search', 'status', 'priority']),
        ]);
    }

    /**
     * Display the specified support ticket.
     */
    public function show(SupportTicket $ticket)
    {
        $ticket->load(['tenant', 'user', 'replies.user']);
        
        return Inertia::render('developer/support/show', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * Update the specified support ticket.
     */
    public function update(Request $request, SupportTicket $ticket)
    {
        $validated = $request->validate([
            'status' => 'sometimes|required|in:open,in_progress,resolved,closed',
            'priority' => 'sometimes|required|in:low,medium,high,urgent',
            'response' => 'sometimes|required|string|max:5000',
        ]);

        if (isset($validated['response'])) {
            $ticket->replies()->create([
                'user_id' => auth()->id(),
                'message' => $validated['response'],
                'is_internal' => false,
            ]);
            unset($validated['response']);
        }

        $ticket->update($validated);

        return redirect()->route('developer.support.show', $ticket)
            ->with('success', 'Support ticket updated successfully.');
    }

    /**
     * Add an internal note to a support ticket.
     */
    public function addNote(Request $request, SupportTicket $ticket)
    {
        $validated = $request->validate([
            'note' => 'required|string|max:5000',
        ]);

        $ticket->replies()->create([
            'user_id' => auth()->id(),
            'message' => $validated['note'],
            'is_internal' => true,
        ]);

        return redirect()->back()
            ->with('success', 'Internal note added successfully.');
    }
}
