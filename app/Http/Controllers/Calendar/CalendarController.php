<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Models\CalendarEvent;
use App\Models\PublicHoliday;
use App\Models\Company;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $isAdmin = in_array($user->type, ['admin', 'it_admin']);
        
        $events = CalendarEvent::where('company_id', $user->company_id)
            ->where(function ($query) use ($user, $isAdmin) {
                if ($isAdmin) {
                    return;
                }
                
                $query->where('created_by', $user->id)
                      ->orWhere(function ($q) use ($user) {
                          $q->where('status', 'published')
                            ->where(function ($subQuery) use ($user) {
                                $subQuery->whereJsonContains('attendees', $user->id)
                                         ->whereNotNull('attendees');
                            });
                      });
            })
            ->orderBy('starts_at')
            ->with('creator:id,name,email')
            ->get()

            ->map(function (CalendarEvent $event) {
                $attendeeIds = $event->attendees ?? [];
                $attendees = \App\Models\User::whereIn('id', $attendeeIds)
                    ->select('id', 'name', 'email')
                    ->get()
                    ->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                        ];
                    });

                $creator = $event->creator ? [
                    'id' => $event->creator->id,
                    'name' => $event->creator->name,
                    'email' => $event->creator->email,
                ] : null;

                $endDate = $event->ends_at;
                if ($event->all_day && !$endDate) {
                    $endDate = $event->starts_at->copy()->addDay();
                }

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'location' => $event->location,
                    'color' => $event->color,
                    'allDay' => $event->all_day,
                    'start' => optional($event->starts_at)->toIso8601String(),
                    'end' => $endDate ? $endDate->toIso8601String() : null,
                    'attendees' => $attendees,
                    'status' => $event->status ?? 'published',
                    'created_by' => $event->created_by,
                    'creator' => $creator,
                    'is_holiday' => false,
                ];
            });

        $company = Company::with('country')->find($user->company_id);
        $countryCode = $company && $company->country ? $company->country->iso : null;
        
        $currentYear = now()->year;
        $nextYear = $currentYear + 1;
        $holidays = [];
        
        for ($year = $currentYear; $year <= $nextYear; $year++) {
            $yearHolidays = PublicHoliday::getHolidaysForYear($year, $countryCode);
        foreach ($yearHolidays as $holiday) {
            $dateStr = is_string($holiday['date']) ? $holiday['date'] : $holiday['date']->format('Y-m-d');
            $startDate = Carbon::createFromFormat('Y-m-d', $dateStr)->startOfDay();
            if (isset($holiday['end_date']) && $holiday['end_date']) {
                $endDateStr = is_string($holiday['end_date']) ? $holiday['end_date'] : $holiday['end_date']->format('Y-m-d');
                $endDate = Carbon::createFromFormat('Y-m-d', $endDateStr)->startOfDay()->addDay();
            } else {
                $endDate = $startDate->copy()->addDay();
            }
            
            $holidayDbId = null;
            if (is_string($holiday['id']) && strpos($holiday['id'], 'holiday_') === 0) {
                $parts = explode('_', $holiday['id']);
                if (count($parts) >= 2 && is_numeric($parts[1])) {
                    $holidayDbId = (int) $parts[1];
                }
            }
            
            $holidays[] = [
                'id' => $holiday['id'],
                'holiday_db_id' => $holidayDbId,
                'title' => $holiday['title'],
                'description' => $holiday['description'] ?? null,
                'location' => null,
                'color' => $holiday['color'],
                'allDay' => true,
                'start' => $startDate->toIso8601String(),
                'end' => $endDate->toIso8601String(),
                'attendees' => [],
                'status' => 'published',
                'created_by' => null,
                'creator' => null,
                'is_holiday' => true,
            ];
        }
        }

        $allEvents = $events->concat(collect($holidays))->sortBy('start')->values();

        return Inertia::render('modules/calendar/index', [
            'events' => $allEvents,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();
        
        if (in_array($user->type, ['parent', 'student'])) {
            return redirect()
                ->back()
                ->with('flash', [
                    'type' => 'error',
                    'message' => 'You do not have permission to create events.',
                ]);
        }
        
        $payload = $this->validatedPayload($request);
        $payload['created_by'] = $user->id;
        $payload['company_id'] = $user->company_id;
        
        CalendarEvent::create($payload);

        return redirect()
            ->route('calendar.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Event created successfully.',
            ]);
    }

    public function update(Request $request, CalendarEvent $calendar): RedirectResponse
    {
        $user = auth()->user();
        $isAdmin = in_array($user->type, ['admin', 'it_admin']);
        if (!$isAdmin && $calendar->created_by !== $user->id) {
            return redirect()
                ->route('calendar.index')
                ->with('flash', [
                    'type' => 'error',
                    'message' => 'You do not have permission to update this event.',
                ]);
        }

        $calendar->update($this->validatedPayload($request));

        return redirect()
            ->route('calendar.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Event updated successfully.',
            ]);
    }

    public function destroy(CalendarEvent $calendar): RedirectResponse
    {
        $user = auth()->user();
        $isAdmin = in_array($user->type, ['admin', 'it_admin']);
        if (!$isAdmin && $calendar->created_by !== $user->id) {
            return redirect()
                ->route('calendar.index')
                ->with('flash', [
                    'type' => 'error',
                    'message' => 'You do not have permission to delete this event.',
                ]);
        }

        $calendar->delete();

        return redirect()
            ->route('calendar.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Event deleted successfully.',
            ]);
    }

    private function validatedPayload(Request $request): array
    {
        $status = $request->input('status', 'published');
        $allDay = $request->input('all_day', false);
        
        $startValidation = $status === 'draft' 
            ? ['required', 'date'] 
            : ['required', 'date', 'after_or_equal:now'];
        
        $endValidation = $allDay 
            ? ['nullable', 'date', 'after_or_equal:start']
            : ['nullable', 'date', 'after:start'];
        
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:20'],
            'all_day' => ['sometimes', 'boolean'],
            'start' => $startValidation,
            'end' => $endValidation,
            'attendees' => ['nullable', 'array'],
            'attendees.*' => ['integer', 'exists:users,id'],
            'status' => ['nullable', 'string', 'in:published,draft'],
        ]);

        return [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'location' => $validated['location'] ?? null,
            'color' => $validated['color'] ?? '#3b82f6',
            'all_day' => (bool) ($validated['all_day'] ?? false),
            'starts_at' => Carbon::parse($validated['start']),
            'ends_at' => isset($validated['end']) ? Carbon::parse($validated['end']) : null,
            'attendees' => !empty($validated['attendees']) ? $validated['attendees'] : null,
            'status' => $validated['status'] ?? 'published',
        ];
    }

    public function searchUsers(Request $request)
    {
        $user = $request->user();
        if (in_array($user->type, ['parent', 'student'])) {
            return response()->json([]);
        }
        
        $query = $request->input('query', '');
        $query = trim($query);
        
        $allUsers = \App\Models\User::where('company_id', $user->company_id)
            ->whereIn('type', ['staff', 'admin', 'it_admin', 'parent'])
            ->where('id', '!=', $user->id)
            ->select('id', 'name', 'email')
            ->get();
        
        if (!empty($query)) {
            $queryLower = strtolower($query);
            $allUsers = $allUsers->filter(function ($user) use ($queryLower) {
                $name = strtolower($user->name ?? '');
                $email = strtolower($user->email ?? '');
                return str_contains($name, $queryLower) || str_contains($email, $queryLower);
            });
        }
        
        $users = $allUsers->take(20)->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ];
        })->values();

        return response()->json($users);
    }

    public function events(): \Illuminate\Http\JsonResponse
    {
        $user = auth()->user();
        $isAdmin = in_array($user->type, ['admin', 'it_admin']);
        
        $events = CalendarEvent::where('company_id', $user->company_id)
            ->where(function ($query) use ($user, $isAdmin) {
                if ($isAdmin) {
                    return;
                }
                
                $query->where('created_by', $user->id)
                      ->orWhere(function ($q) use ($user) {
                          $q->where('status', 'published')
                            ->where(function ($subQuery) use ($user) {
                                $subQuery->whereJsonContains('attendees', $user->id)
                                         ->whereNotNull('attendees');
                            });
                      });
            })
            ->orderBy('starts_at')
            ->with('creator:id,name,email')
            ->get()
            ->map(function (CalendarEvent $event) {
                $attendeeIds = $event->attendees ?? [];
                $attendees = \App\Models\User::whereIn('id', $attendeeIds)
                    ->select('id', 'name', 'email')
                    ->get()
                    ->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                        ];
                    });

                $creator = $event->creator ? [
                    'id' => $event->creator->id,
                    'name' => $event->creator->name,
                    'email' => $event->creator->email,
                ] : null;

                $endDate = $event->ends_at;
                if ($event->all_day && !$endDate) {
                    $endDate = $event->starts_at->copy()->addDay();
                }

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'location' => $event->location,
                    'color' => $event->color,
                    'allDay' => $event->all_day,
                    'start' => optional($event->starts_at)->toIso8601String(),
                    'end' => $endDate ? $endDate->toIso8601String() : null,
                    'attendees' => $attendees,
                    'status' => $event->status ?? 'published',
                    'created_by' => $event->created_by,
                    'creator' => $creator,
                    'is_holiday' => false,
                ];
            });

        $company = Company::with('country')->find($user->company_id);
        $countryCode = $company && $company->country ? $company->country->iso : null;
        $currentYear = now()->year;
        $nextYear = $currentYear + 1;
        $holidays = [];
        
        for ($year = $currentYear; $year <= $nextYear; $year++) {
            $yearHolidays = PublicHoliday::getHolidaysForYear($year, $countryCode);
            foreach ($yearHolidays as $holiday) {
                $dateStr = is_string($holiday['date']) ? $holiday['date'] : $holiday['date']->format('Y-m-d');
                $startDate = Carbon::createFromFormat('Y-m-d', $dateStr)->startOfDay();
                if (isset($holiday['end_date']) && $holiday['end_date']) {
                    $endDateStr = is_string($holiday['end_date']) ? $holiday['end_date'] : $holiday['end_date']->format('Y-m-d');
                    $endDate = Carbon::createFromFormat('Y-m-d', $endDateStr)->startOfDay()->addDay();
                } else {
                    $endDate = $startDate->copy()->addDay();
                }
                
                $holidayDbId = null;
                if (is_string($holiday['id']) && strpos($holiday['id'], 'holiday_') === 0) {
                    $parts = explode('_', $holiday['id']);
                    if (count($parts) >= 2 && is_numeric($parts[1])) {
                        $holidayDbId = (int) $parts[1];
                    }
                }
                
                $holidays[] = [
                    'id' => $holiday['id'],
                    'holiday_db_id' => $holidayDbId,
                    'title' => $holiday['title'],
                    'description' => $holiday['description'] ?? null,
                    'location' => null,
                    'color' => $holiday['color'],
                    'allDay' => true,
                    'start' => $startDate->toIso8601String(),
                    'end' => $endDate->toIso8601String(),
                    'attendees' => [],
                    'status' => 'published',
                    'created_by' => null,
                    'creator' => null,
                    'is_holiday' => true,
                ];
            }
        }
        $allEvents = $events->concat(collect($holidays))->sortBy('start')->values();

        return response()->json($allEvents);
    }

    public function storeHoliday(Request $request): RedirectResponse
    {
        $user = auth()->user();
        if (in_array($user->type, ['parent', 'student'])) {
            return redirect()
                ->back()
                ->with('flash', [
                    'type' => 'error',
                    'message' => 'You do not have permission to create holidays.',
                ]);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date_format:Y-m-d'], // Explicit format to match frontend
            'end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'], // Explicit format
            'color' => ['nullable', 'string', 'max:20'],
            'recurring' => ['nullable', 'boolean'],
        ]);

        $startDate = Carbon::createFromFormat('Y-m-d', $validated['start_date'])->startOfDay();
        $endDate = isset($validated['end_date']) 
            ? Carbon::createFromFormat('Y-m-d', $validated['end_date'])->startOfDay()
            : $startDate->copy();

        $company = Company::with('country')->find($user->company_id);
        $countryCode = $company && $company->country ? $company->country->iso : null;

        PublicHoliday::create([
            'country_code' => $countryCode,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'date' => $startDate->format('Y-m-d'), // Store as date string to avoid timezone issues
            'end_date' => $endDate->format('Y-m-d') !== $startDate->format('Y-m-d') ? $endDate->format('Y-m-d') : null,
            'recurring' => $validated['recurring'] ?? false,
            'recurrence_type' => 1, // Fixed date
            'month' => $validated['recurring'] ? $startDate->month : null,
            'day' => $validated['recurring'] ? $startDate->day : null,
            'color' => $validated['color'] ?? '#ef4444',
            'is_active' => true,
        ]);

        return redirect()
            ->route('calendar.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Holiday created successfully.',
            ]);
    }


    public function updateHoliday(Request $request, PublicHoliday $holiday): RedirectResponse
    {
        $user = auth()->user();
        
        if (in_array($user->type, ['parent', 'student'])) {
            return redirect()
                ->back()
                ->with('flash', [
                    'type' => 'error',
                    'message' => 'You do not have permission to update holidays.',
                ]);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:start_date'],
            'color' => ['nullable', 'string', 'max:20'],
            'recurring' => ['nullable', 'boolean'],
        ]);

        $startDate = Carbon::createFromFormat('Y-m-d', $validated['start_date'])->startOfDay();
        $endDate = isset($validated['end_date']) 
            ? Carbon::createFromFormat('Y-m-d', $validated['end_date'])->startOfDay()
            : $startDate->copy();

        $company = Company::with('country')->find($user->company_id);
        $countryCode = $company && $company->country ? $company->country->iso : null;

        $holiday->update([
            'country_code' => $countryCode,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d') !== $startDate->format('Y-m-d') ? $endDate->format('Y-m-d') : null,
            'recurring' => $validated['recurring'] ?? false,
            'recurrence_type' => 1,
            'month' => $validated['recurring'] ? $startDate->month : null,
            'day' => $validated['recurring'] ? $startDate->day : null,
            'color' => $validated['color'] ?? '#ef4444',
        ]);

        return redirect()
            ->route('calendar.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Holiday updated successfully.',
            ]);
    }

    public function destroyHoliday(PublicHoliday $holiday): RedirectResponse
    {
        $user = auth()->user();
        
        if (in_array($user->type, ['parent', 'student'])) {
            return redirect()
                ->back()
                ->with('flash', [
                    'type' => 'error',
                    'message' => 'You do not have permission to delete holidays.',
                ]);
        }

        $holiday->delete();

        return redirect()
            ->route('calendar.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Holiday deleted successfully.',
            ]);
    }
}
