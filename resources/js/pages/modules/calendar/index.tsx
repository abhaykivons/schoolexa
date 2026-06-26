// modules/calendar/index.tsx
import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import FullCalendar, { CalendarEvent } from '@/components/full-calendar';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface ServerCalendarEvent {
  id: number | string;
  title: string;
  description?: string | null;
  location?: string | null;
  color?: string | null;
  start: string;
  end: string | null;
  allDay: boolean;
  attendees?: { id: number; name: string; email?: string }[];
  status?: 'published' | 'draft';
  created_by?: number;
  creator?: { id: number; name: string; email?: string } | null;
  is_holiday?: boolean;
}

type CalendarPageProps = SharedData & {
  events: ServerCalendarEvent[];
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Calendar', href: '/calendar' },
];

export default function Calendar() {
  const { auth, events: serverEvents = [] } = usePage<CalendarPageProps>().props;
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Check user type for permission checks
  const userType = auth?.user?.type || 'staff';
  const isParent = userType === 'parent';
  const isStudent = userType === 'student';
  const canCreateEvents = !isParent && !isStudent; // Only school users can create events

  const transformServerEvent = (event: ServerCalendarEvent): CalendarEvent => ({
    id: event.id,
    title: event.title,
    description: event.description ?? undefined,
    location: event.location ?? undefined,
    color: event.color ?? (event.is_holiday ? '#ef4444' : '#3b82f6'),
    allDay: event.allDay,
    attendees: event.attendees ?? [],
    start: new Date(event.start),
    end: event.end ? new Date(event.end) : null,
    status: event.status ?? 'published',
    creator: event.creator ?? null,
    created_by: event.created_by,
    is_holiday: event.is_holiday ?? false,
    holiday_db_id: (event as any).holiday_db_id,
  });

  useEffect(() => {
    setEvents(serverEvents.map(transformServerEvent));
  }, [serverEvents]);

  const buildPayload = (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => {
    const formatDateTime = (date: Date, isAllDay: boolean): string => {
      if (isAllDay) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      }
      return date.toISOString();
    };

    return {
      title: event.title,
      description: event.description ?? null,
      location: event.location ?? null,
      color: event.color ?? '#3b82f6',
      all_day: event.allDay,
      start: formatDateTime(event.start, event.allDay),
      end: event.end ? formatDateTime(event.end, event.allDay) : null,
      attendees: event.attendees ? event.attendees.map(a => a.id) : [],
      status: event.status || 'published', // Preserve existing status (including drafts)
    };
  };

  const handleDateClick = (date: Date): void => console.log('Date clicked:', date);
  const handleEventClick = (event: CalendarEvent): void => console.log('Event clicked:', event);
  const handleEventCreate = (event: Omit<CalendarEvent, 'id'>): void => {
    router.post('/calendar', buildPayload(event), {
      preserveScroll: true,
      onSuccess: () => {
      },
      onError: () => {
      },
    });
  };

  const handleEventUpdate = (event: CalendarEvent): void => {
    if (event.is_holiday && event.holiday_db_id) {
      handleHolidayUpdate(event);
      return;
    }
    
    router.put(`/calendar/${event.id}`, buildPayload(event), {
      preserveScroll: true,
    });
  };

  const handleEventDelete = (eventId: number | string, event?: CalendarEvent): void => {
    if (event?.is_holiday && event.holiday_db_id) {
      router.delete(`/calendar/holiday/${event.holiday_db_id}`, {
        preserveScroll: true,
        onSuccess: () => {
        },
        onError: (errors) => {
          console.error('Error deleting holiday:', errors);
        },
      });
      return;
    }
    
    router.delete(`/calendar/${eventId}`, {
      preserveScroll: true,
    });
  };

  const handleHolidayUpdate = (event: CalendarEvent): void => {
    if (!event.holiday_db_id) {
      console.error('Cannot update holiday: holiday_db_id is missing');
      return;
    }
    
    // Helper function to format date as YYYY-MM-DD in local timezone (avoid UTC conversion)
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const startDateOnly = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
    const endDateOnly = event.end ? new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()) : null;
    
    const daysDiff = endDateOnly ? Math.floor((endDateOnly.getTime() - startDateOnly.getTime()) / (24 * 60 * 60 * 1000)) : 0;
    
    const isSingleDay = !endDateOnly || daysDiff <= 1;
    
    const payload = {
      title: event.title,
      description: event.description ?? null,
      start_date: formatLocalDate(startDateOnly),
      end_date: isSingleDay ? null : (endDateOnly ? formatLocalDate(endDateOnly) : null),
      color: event.color ?? '#ef4444',
      recurring: false,
    };

    router.put(`/calendar/holiday/${event.holiday_db_id}`, payload, {
      preserveScroll: true,
      onSuccess: () => {
        // Holiday updated successfully - page will reload
      },
      onError: (errors) => {
        console.error('Error updating holiday:', errors);
        // Error will be shown via flash message from backend
      },
    });
  };

  const handleHolidayCreate = (event: Omit<CalendarEvent, 'id'>): void => {
    // Helper function to format date as YYYY-MM-DD in local timezone (avoid UTC conversion)
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Normalize dates to compare just the date part (ignore time)
    const startDateOnly = new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate());
    const endDateOnly = event.end ? new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()) : null;
    
    // Calculate the difference in days
    const daysDiff = endDateOnly ? Math.floor((endDateOnly.getTime() - startDateOnly.getTime()) / (24 * 60 * 60 * 1000)) : 0;
    
    const isSingleDay = !endDateOnly || daysDiff <= 1;
    
    const payload = {
      title: event.title,
      description: event.description ?? null,
      start_date: formatLocalDate(startDateOnly),
      end_date: isSingleDay ? null : (endDateOnly ? formatLocalDate(endDateOnly) : null),
      color: event.color ?? '#ef4444',
      recurring: false,
    };

    router.post('/calendar/holiday', payload, {
      preserveScroll: true,
      onSuccess: () => {
        // Holiday created successfully - page will reload
      },
      onError: () => {
        // Error handling
      },
    });
  };

  const today = new Date();
  const currentYear = today.getFullYear();
  // Allow navigation at least 2 years into the future for creating events
  const maxYear = currentYear + 2;
  const minYear = currentYear - 1; // Allow looking at past events
  const initialCalendarDate = today;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Calendar" />
      <div className="flex flex-col min-h-screen">
        <Header user={auth.user} />
        <div className="p-4 mb-12 lg:mb-0 md:mb-0">
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-sm">
            <FullCalendar
              events={events}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              onEventCreate={handleEventCreate}
              onEventUpdate={handleEventUpdate}
              onEventDelete={handleEventDelete}
              onHolidayCreate={handleHolidayCreate}
              defaultView="month"
              showEventDetails={true} // Show/hide event details
              enableEventCreation={canCreateEvents} // Parents/students cannot create events
              enableEventDeletion={canCreateEvents} // Parents/students cannot delete events
              enableEventEditing={canCreateEvents} // Parents/students cannot edit events
              enableDateNavigation={true}
              initialDate={initialCalendarDate}
              academicYear={minYear}
              maxAcademicYear={maxYear}
              className="w-full"
              hideHeader={false} // Show/hide the calendar header
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}