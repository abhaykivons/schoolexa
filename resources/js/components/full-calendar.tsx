import React, { useState, useEffect, useRef, JSX } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EventCreationModal from './event-creation-modal';
import EventDetailsModal from './event-details-modal';

// TypeScript interfaces
export interface CalendarEvent {
  id: number | string;
  title: string;
  start: Date;
  end: Date | null;
  allDay: boolean;
  color?: string;
  description?: string;
  location?: string;
  attendees?: { id: number; name: string; email?: string }[];
  status?: 'published' | 'draft';
  creator?: { id: number; name: string; email?: string } | null;
  created_by?: number;
  is_holiday?: boolean;
  holiday_db_id?: number;
}

export type CalendarView = 'month' | 'week' | 'day' | 'year';

export interface CalendarProps {
  events: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: number | string, event?: CalendarEvent) => void;
  onHolidayCreate?: (event: Omit<CalendarEvent, 'id'>) => void;
  defaultView?: CalendarView;
  showEventDetails?: boolean;
  enableEventCreation?: boolean;
  enableEventDeletion?: boolean;
  enableEventEditing?: boolean;
  enableDateNavigation?: boolean;
  initialDate?: Date;
  className?: string;
  academicYear?: number;
  maxAcademicYear?: number;
  hideHeader?: boolean;
}

const FullCalendar: React.FC<CalendarProps> = ({
  events = [],
  onDateClick,
  onEventClick,
  onEventCreate,
  onEventUpdate,
  onHolidayCreate,
  onEventDelete,
  defaultView = 'month',
  showEventDetails = true,
  enableEventCreation = true,
  enableEventDeletion = true,
  enableEventEditing = true,
  enableDateNavigation = true,
  initialDate,
  className = '',
  academicYear = new Date().getFullYear(),
  maxAcademicYear = new Date().getFullYear() + 1,
  hideHeader = false,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentView, setCurrentView] = useState<CalendarView>(defaultView);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>(events);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number>(academicYear);
  const [searchSuggestions, setSearchSuggestions] = useState<CalendarEvent[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [eventModalMode, setEventModalMode] = useState<'create' | 'edit'>('create');
  const [eventBeingEdited, setEventBeingEdited] = useState<CalendarEvent | null>(null);
  const [isHolidayModal, setIsHolidayModal] = useState(false);

  // Month names
  const monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Hour labels for day and week views
  const hourLabels: string[] = [
    '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
    '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
  ];

  // Academic year options
  const academicYearOptions = Array.from(
    { length: maxAcademicYear - 2015 + 1 },
    (_, i) => 2015 + i
  ).filter(year => year <= maxAcademicYear);

  // Get current month and year
  const month: number = currentDate.getMonth();
  const year: number = currentDate.getFullYear();

  // Filter events based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEvents(events);
      setSearchSuggestions([]);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(query) ||
        (event.description && event.description.toLowerCase().includes(query)) ||
        (event.location && event.location.toLowerCase().includes(query)) ||
        (event.attendees && event.attendees.some(attendee => attendee.name.toLowerCase().includes(query)))
      );
      setFilteredEvents(filtered);
      setSearchSuggestions(filtered.slice(0, 5));
    }
  }, [searchQuery, events]);

  const handleSuggestionClick = (event: CalendarEvent): void => {
    setSearchQuery(event.title);
    setShowSuggestions(false);
    const eventDate = new Date(event.start);

    // Navigate based on current view
    if (currentView === 'month' || currentView === 'year') {
      setCurrentDate(eventDate);
      setCurrentView('month');
    } else if (currentView === 'week') {
      setCurrentDate(eventDate);
    } else if (currentView === 'day') {
      setCurrentDate(eventDate);
      setSelectedDate(eventDate);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setHoveredEvent(null);
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          setHoverTimeout(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hoverTimeout]);

  // Navigation functions
  const goToPreviousPeriod = (): void => {
    if (currentView === 'month') {
      const newDate = new Date(year, month - 1, 1);
      if (newDate.getFullYear() > selectedAcademicYear ||
        (newDate.getFullYear() === selectedAcademicYear && newDate.getMonth() >= 0)) {
        setCurrentDate(newDate);
      }
    } else if (currentView === 'week') {
      setCurrentDate(new Date(year, month, currentDate.getDate() - 7));
    } else if (currentView === 'day') {
      setCurrentDate(new Date(year, month, currentDate.getDate() - 1));
    } else if (currentView === 'year') {
      const newYear = year - 1;
      if (newYear >= 2020) {
        setCurrentDate(new Date(newYear, month, 1));
      }
    }
  };

  const goToNextPeriod = (): void => {
    if (currentView === 'month') {
      const newDate = new Date(year, month + 1, 1);
      if (newDate.getFullYear() <= maxAcademicYear) {
        setCurrentDate(newDate);
      }
    } else if (currentView === 'week') {
      setCurrentDate(new Date(year, month, currentDate.getDate() + 7));
    } else if (currentView === 'day') {
      setCurrentDate(new Date(year, month, currentDate.getDate() + 1));
    } else if (currentView === 'year') {
      const newYear = year + 1;
      if (newYear <= maxAcademicYear) {
        setCurrentDate(new Date(newYear, month, 1));
      }
    }
  };

  const goToToday = (): void => {
    const today = new Date();
    if (today.getFullYear() <= maxAcademicYear) {
      setCurrentDate(today);
      setSelectedDate(today);
    }
  };

  const changeView = (view: CalendarView): void => {
    setCurrentView(view);
  };

  // Handle date selection - open event creation modal
  const handleDateClick = (date: Date): void => {
    setSelectedDate(date);
    setEventModalMode('create');
    setEventBeingEdited(null);
    if (onDateClick) onDateClick(date);

    // If date navigation is enabled, switch to day view
    if (enableDateNavigation && currentView === 'month') {
      setCurrentView('day');
      setCurrentDate(date);
    }

    // Open event creation modal if enabled
    if (enableEventCreation) {
      setIsEventModalOpen(true);
    }
  };

  // Close modals
  const closeEventModal = (): void => {
    setIsEventModalOpen(false);
    setSelectedDate(null);
  };

  const closeEventDetailsModal = (): void => {
    setIsEventDetailsModalOpen(false);
    setSelectedEvent(null);
  };

  const openEditModal = (event: CalendarEvent): void => {
    setEventModalMode('edit');
    setEventBeingEdited(event);
    setSelectedDate(event.start);
    setIsEventDetailsModalOpen(false);
    setIsHolidayModal(event.is_holiday || false); // Set holiday mode if editing a holiday
    setIsEventModalOpen(true);
  };

  // Handle academic year change
  const handleAcademicYearChange = (value: string): void => {
    const newYear = parseInt(value);
    setSelectedAcademicYear(newYear);
    setCurrentDate(new Date(newYear, 0, 1));
  };

  // Check if two dates are the same day
  const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Check if a date is today
  const isToday = (date: Date | null): boolean => {
    return isSameDay(date, new Date());
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date | null): CalendarEvent[] => {
    if (!date) return [];
    
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    
    const events = filteredEvents.filter(event => {
      const eventStart = new Date(event.start);
      let eventEnd: Date;
      if (event.allDay && !event.end) {
        eventEnd = new Date(eventStart);
        eventEnd.setDate(eventEnd.getDate() + 1);
        eventEnd.setHours(0, 0, 0, 0);
      } else {
        eventEnd = event.end ? new Date(event.end) : eventStart;
      }
      
      const eventStartDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const eventEndDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      
      if (event.allDay) {
        return dateStart >= eventStartDate && dateStart < eventEndDate;
      } else {
        return (eventStart <= dateEnd && eventEnd >= dateStart);
      }
    });
    
    return events.sort((a, b) => {
      if (a.is_holiday && !b.is_holiday) return -1;
      if (!a.is_holiday && b.is_holiday) return 1;
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  };

  // Get events for a specific hour in day/week view
  const getEventsForHour = (date: Date, hour: number): CalendarEvent[] => {
    const startOfHour = new Date(date);
    startOfHour.setHours(hour, 0, 0, 0);

    const endOfHour = new Date(date);
    endOfHour.setHours(hour, 59, 59, 999);

    return filteredEvents.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : new Date(event.start);

      return (
        (eventStart >= startOfHour && eventStart <= endOfHour) ||
        (eventEnd >= startOfHour && eventEnd <= endOfHour) ||
        (eventStart <= startOfHour && eventEnd >= endOfHour)
      );
    });
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Generate days in month
  const getDaysInMonth = (): (Date | null)[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add days from previous month to fill the first week
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(prevYear, prevMonth, prevMonthLastDay - i));
    }

    // Add days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month to fill the last week (always show 6 weeks = 42 days)
    const totalDays = days.length;
    const remainingDays = 42 - totalDays; // 6 weeks * 7 days = 42
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(nextYear, nextMonth, i));
    }

    return days;
  };

  // Get days in week for week view
  const getDaysInWeek = (): Date[] => {
    const days: Date[] = [];
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek;

    for (let i = 0; i < 7; i++) {
      days.push(new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), diff + i));
    }

    return days;
  };

  // Get months in year for year view
  const getMonthsInYear = (): Date[] => {
    const months: Date[] = [];

    for (let i = 0; i < 12; i++) {
      months.push(new Date(year, i, 1));
    }

    return months;
  };

  // handleEventClick function
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent): void => {
    e.stopPropagation();

    // Clear any hover timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    // Hide tooltip immediately
    setHoveredEvent(null);

    if (onEventClick) onEventClick(event);

    // For holidays, open details modal (can be edited/deleted if user has permissions)
    if (event.is_holiday) {
      setSelectedEvent(event);
      setIsEventDetailsModalOpen(true);
      return;
    }

    // If it's a draft, open the edit modal directly
    if (event.status === 'draft') {
      openEditModal(event);
      return;
    }

    // Open event details modal
    setSelectedEvent(event);
    setIsEventDetailsModalOpen(true);
  };

  const renderEventWithTooltip = (event: CalendarEvent, content: JSX.Element) => (
    <TooltipProvider key={event.id}>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent
          className="w-64 p-3"
          side="top"
          align="center"
          ref={tooltipRef}
        >
          <div className="font-medium flex items-center gap-2">
            {event.is_holiday && <span>🎉</span>}
            {event.title}
          </div>
          {event.is_holiday && (
            <div className="text-xs text-red-600 mt-1 font-medium">Public Holiday</div>
          )}
          <div className="text-xs mt-1">
            {formatDate(new Date(event.start))}
            {!event.allDay && ` • ${formatTime(new Date(event.start))}`}
            {event.end && ` - ${formatTime(new Date(event.end))}`}
          </div>
          {event.creator && !event.is_holiday && (
            <div className="text-xs text-gray-600 mt-1">👤 Created by: {event.creator.name}</div>
          )}
          {event.location && (
            <div className="text-xs text-gray-500 mt-1 truncate">📍 {event.location}</div>
          )}
          {event.status === 'draft' && (
            <div className="text-xs text-amber-600 mt-1 font-medium">📝 Draft</div>
          )}
          {event.description && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Add hover event handlers
  const handleEventMouseEnter = (event: CalendarEvent, e: React.MouseEvent): void => {
    e.stopPropagation();

    // Set a timeout to show the tooltip after a brief delay
    const timeout = setTimeout(() => {
      setHoveredEvent(event);
    }, 500);

    setHoverTimeout(timeout);
  };

  const handleEventMouseLeave = (e: React.MouseEvent): void => {
    e.stopPropagation();

    // Clear the timeout if mouse leaves before it triggers
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    // Hide the tooltip
    setHoveredEvent(null);
  };

  const renderMonthView = (): JSX.Element => {
    const days = getDaysInMonth();

    return (
      <div className="grid grid-cols-7 grid-rows-6 gap-1 rounded-md overflow-hidden">
        {/* Day headers */}
        {dayNames.map(day => (
          <div
            key={day}
            className="bg-background text-center font-medium text-muted-foreground dark:bg-[#116B11] py-2 rounded-md text-sm md:text-base"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          // Check if this day is from a different month
          const isCurrentMonth = day && day.getMonth() === month && day.getFullYear() === year;
          
          return (
          <div
            key={index}
            onClick={() => day && handleDateClick(day)}
            className={`bg-background p-1 border rounded-md cursor-pointer text-xs md:text-sm flex flex-col
              ${!isCurrentMonth ? 'bg-muted/30 text-muted-foreground/60' : ''}
              ${isToday(day) ? 'border border-primary' : 'border border-border'}
              ${selectedDate && isSameDay(day, selectedDate) ? 'bg-accent' : 'hover:bg-accent/50'}
            `}
          >
            {day && (
              <>
                <div
                  className={`ml-auto w-6 h-6 flex items-center justify-center rounded-md
                    ${isToday(day) ? 'bg-primary text-primary-foreground' : ''}
                    ${selectedDate && isSameDay(day, selectedDate) ? 'bg-primary text-primary-foreground' : ''}
                  `}
                >
                  {day.getDate()}
                </div>

                {showEventDetails && (() => {
                  const dayEvents = getEventsForDate(day);
                  const allDayEvents = dayEvents.filter(e => e.allDay);
                  const timedEvents = dayEvents.filter(e => !e.allDay);
                  const displayLimit = 3;
                  const allDayDisplayCount = Math.min(allDayEvents.length, 2);
                  const timedDisplayCount = Math.min(timedEvents.length, displayLimit - allDayDisplayCount);
                  const remainingCount = dayEvents.length - allDayDisplayCount - timedDisplayCount;

                  return (
                    <div className="mt-1 flex-1 overflow-y-auto space-y-0.5 px-1">
                      {/* All-day events list (holidays first, then regular events) */}
                      {allDayEvents.slice(0, allDayDisplayCount).map(event =>
                        renderEventWithTooltip(
                          event,
                          <div
                            key={event.id}
                            onClick={(e) => handleEventClick(event, e)}
                            className={`truncate p-0.5 rounded text-xs leading-tight cursor-pointer flex items-center gap-1 ${
                              event.is_holiday ? 'font-semibold' : ''
                            }`}
                            style={{
                              backgroundColor: event.color ? `${event.color}20` : '#e9d5ff20',
                              borderLeft: `3px solid ${event.color || '#a855f7'}`,
                              opacity: event.status === 'draft' ? 0.6 : 1,
                              borderStyle: event.status === 'draft' ? 'dashed' : 'solid',
                            }}
                            title={event.is_holiday ? 'Public Holiday' : (event.creator ? `Created by ${event.creator.name}` : '')}
                          >
                            <span className="text-[10px] text-muted-foreground mr-1">
                              {event.is_holiday ? '🎉' : '📅'}
                            </span>
                            <span className="truncate">{event.title}</span>
                            {event.creator && !event.is_holiday && (
                              <span className="text-[10px] text-muted-foreground truncate ml-1">
                                ({event.creator.name})
                              </span>
                            )}
                          </div>
                        )
                      )}
                      
                      {/* Timed events */}
                      {timedEvents.slice(0, timedDisplayCount).map(event =>
                        renderEventWithTooltip(
                          event,
                          <div
                            key={event.id}
                            onClick={(e) => handleEventClick(event, e)}
                            className="truncate p-0.5 rounded text-xs leading-tight cursor-pointer"
                            style={{
                              backgroundColor: event.color ? `${event.color}20` : '#e9d5ff20',
                              borderLeft: `3px solid ${event.color || '#a855f7'}`,
                              opacity: event.status === 'draft' ? 0.6 : 1,
                              borderStyle: event.status === 'draft' ? 'dashed' : 'solid',
                            }}
                            title={event.creator ? `Created by ${event.creator.name}` : ''}
                          >
                            <span className="font-medium">{formatTime(new Date(event.start))}</span>
                            {' '}{event.title}
                            {event.creator && (
                              <span className="text-[10px] text-muted-foreground"> ({event.creator.name})</span>
                            )}
                          </div>
                        )
                      )}
                      
                      {/* Remaining events count */}
                      {remainingCount > 0 && (
                        <div className="text-xs text-muted-foreground px-1">+{remainingCount} more</div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
          );
        })}
      </div>
    );
  };

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    
    return filteredEvents.filter(event => {
      if (event.allDay) {
        const eventStart = new Date(event.start);
        const eventStartDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
        const eventEndDate = event.end ? new Date(event.end.getFullYear(), event.end.getMonth(), event.end.getDate()) : eventStartDate;
        return dateStart >= eventStartDate && dateStart < eventEndDate;
      } else {
        const eventStart = new Date(event.start);
        const eventEnd = event.end ? new Date(event.end) : eventStart;
        return (eventStart <= dateEnd && eventEnd >= dateStart);
      }
    });
  };

  const renderWeekView = (): JSX.Element => {
    const days = getDaysInWeek();

    return (
      <div className="overflow-x-auto">
        <div className="flex md:flex-row flex-col md:min-w-fit">
          {/* Time column */}
          <div className="hidden md:block w-16 flex-shrink-0 sticky left-0 z-10 bg-background">
            <div className="h-12 border-b border-r"></div>
            {hourLabels.map((hour, index) => (
              <div key={index} className="h-12 text-xs text-muted-foreground pr-2 text-right border-b border-r">
                {hour}
              </div>
            ))}
          </div>

          {/* Days columns */}
          {days.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            const allDayEvents = dayEvents.filter(e => e.allDay);
            
            return (
              <div key={dayIndex} className="flex-1 min-w-[140px] md:min-w-0 border-l md:first:border-l-0 border-t md:border-t-0 first:border-t-0 md:first:border-t">
                {/* Day header */}
                <div
                  onClick={() => handleDateClick(day)}
                  className={`h-12 text-center flex flex-col justify-center border-b cursor-pointer
                    ${isToday(day) ? 'bg-primary/10 border-primary' : ''}
                    ${selectedDate && isSameDay(day, selectedDate) ? 'bg-accent' : ''}
                  `}
                >
                  <div className="font-medium text-sm">{dayNames[day.getDay()]}</div>
                  <div className="text-xs">{day.getDate()} {monthNames[day.getMonth()].substring(0, 3)}</div>
                </div>

                {/* All-day events bar */}
                {allDayEvents.length > 0 && (
                  <div className="border-b p-0.5 space-y-0.5">
                    {allDayEvents.slice(0, 2).map(event => (
                      <div key={event.id} onClick={(e) => handleEventClick(event, e)} onMouseEnter={(e) => handleEventMouseEnter(event, e)} onMouseLeave={handleEventMouseLeave} className="text-xs p-1 rounded truncate cursor-pointer" style={{ backgroundColor: event.color ? `${event.color}20` : '#e9d5ff20', borderLeft: `3px solid ${event.color || '#a855f7'}`, opacity: event.status === 'draft' ? 0.6 : 1, borderStyle: event.status === 'draft' ? 'dashed' : 'solid', }} >
                        {event.title}
                      </div>
                    ))}
                    {allDayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground px-1">+{allDayEvents.length - 2} more</div>
                    )}
                  </div>
                )}

                {/* Hour slots */}
                <div className="relative">
                  {Array.from({ length: 24 }).map((_, hourIndex) => {
                    const hourStart = new Date(day);
                    hourStart.setHours(hourIndex, 0, 0, 0);
                    const hourEnd = new Date(day);
                    hourEnd.setHours(hourIndex + 1, 0, 0, 0);
                    
                    // Get events that intersect with this hour
                    const hourEvents = dayEvents.filter(event => {
                      if (event.allDay) return false;
                      const eventStart = new Date(event.start);
                      const eventEnd = event.end ? new Date(event.end) : new Date(event.start);
                      return (eventStart < hourEnd && eventEnd > hourStart);
                    });

                    return (
                      <div
                        key={hourIndex}
                        className="h-12 border-b relative"
                        onClick={() => {
                          const newDate = new Date(day);
                          newDate.setHours(hourIndex, 0, 0, 0);
                          handleDateClick(newDate);
                        }}
                      >
                        {/* Mobile: Show time label */}
                        <div className="md:hidden absolute left-0 top-0 text-[10px] text-muted-foreground px-1 z-0">
                          {hourLabels[hourIndex]}
                        </div>
                        
                        {/* Events for this hour */}
                        {hourEvents.map(event => {
                          const eventStart = new Date(event.start);
                          const eventEnd = event.end ? new Date(event.end) : new Date(event.start);
                          const hourStartTime = new Date(day);
                          hourStartTime.setHours(hourIndex, 0, 0, 0);
                          
                          // Calculate position within this hour slot
                          const minutesOffset = eventStart.getHours() === hourIndex 
                            ? eventStart.getMinutes() 
                            : 0;
                          const topPercent = (minutesOffset / 60) * 100;
                          
                          // Calculate height
                          const startInSlot = eventStart > hourStartTime ? eventStart : hourStartTime;
                          const endInSlot = eventEnd < hourEnd ? eventEnd : hourEnd;
                          const durationMs = endInSlot.getTime() - startInSlot.getTime();
                          const heightPercent = (durationMs / (1000 * 60 * 60)) * 100;
                          
                          return (
                            <div
                              key={event.id}
                              onClick={(e) => handleEventClick(event, e)}
                              onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                              onMouseLeave={handleEventMouseLeave}
                              className="absolute left-0 right-0 mx-0.5 md:mx-0.5 ml-6 md:ml-0.5 p-1 text-xs rounded cursor-pointer z-10"
                              style={{
                                top: `${Math.max(0, topPercent)}%`,
                                height: `${Math.min(100, Math.max(8, heightPercent))}%`,
                                minHeight: '20px',
                                backgroundColor: event.color ? `${event.color}20` : '#e9d5ff20',
                                borderLeft: `3px solid ${event.color || '#a855f7'}`,
                                opacity: event.status === 'draft' ? 0.6 : 1,
                                borderStyle: event.status === 'draft' ? 'dashed' : 'solid',
                              }}
                            >
                              <div className="truncate font-medium">{formatTime(eventStart)}</div>
                              <div className="truncate">{event.title}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = (): JSX.Element => {
  const dayEvents = getEventsForDate(currentDate);
  const allDayEvents = dayEvents.filter(e => e.allDay || e.is_holiday);
  const timedEvents = dayEvents.filter(e => !e.allDay && !e.is_holiday);

    return (
      <div className="flex flex-col md:flex-row">
        {/* Time column */}
        <div className="w-16 flex-shrink-0">
          <div className="h-16 border-b text-center font-medium py-2">
            {dayNames[currentDate.getDay()]}
            <div className="text-sm">{currentDate.getDate()} {monthNames[currentDate.getMonth()].substring(0, 3)}</div>
          </div>
          {hourLabels.map((hour, index) => (
            <div key={index} className="h-16 text-xs text-muted-foreground pr-2 text-right border-b">
              {hour}
            </div>
          ))}
        </div>

        {/* Day column */}
        <div className="flex-1 min-w-0 border-l">
          {/* All-day events bar (for holidays and all-day events) */}
          {allDayEvents.length > 0 && (
            <div className="h-16 border-b p-2 space-y-1 overflow-y-auto">
              {allDayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                  onMouseLeave={handleEventMouseLeave}
                  className="text-xs p-2 rounded cursor-pointer flex items-center gap-2"
                  style={{
                    backgroundColor: event.color ? `${event.color}20` : '#e9d5ff20',
                    borderLeft: `3px solid ${event.color || '#a855f7'}`,
                    opacity: event.status === 'draft' ? 0.6 : 1,
                    borderStyle: event.status === 'draft' ? 'dashed' : 'solid',
                  }}
                >
                  {event.is_holiday && <span className="text-base">🎉</span>}
                  <div className="flex-1">
                    <div className="font-semibold">{event.title}</div>
                    {event.description && (
                      <div className="text-muted-foreground truncate">{event.description}</div>
                    )}
                  </div>
                  {event.is_holiday && (
                    <span className="text-xs text-red-600 font-medium">Holiday</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Hour slots for timed events */}
          <div className="relative">
            {Array.from({ length: 24 }).map((_, hourIndex) => (
              <div
                key={hourIndex}
                className="h-16 border-b relative"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setHours(hourIndex, 0, 0, 0);
                  handleDateClick(newDate);
                }}
              >
                {/* Events for this hour */}
                {getEventsForHour(currentDate, hourIndex)
                  .filter(event => !event.allDay && !event.is_holiday)
                  .map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => handleEventClick(event, e)}
                    onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                    onMouseLeave={handleEventMouseLeave}
                    className="absolute left-0 right-0 mx-1 p-1 text-xs rounded overflow-hidden cursor-pointer"
                    style={{
                      top: `${(new Date(event.start).getMinutes() / 60) * 100}%`,
                      height: event.end
                        ? `${((new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60 * 60)) * 100}%`
                        : '100%',
                      backgroundColor: event.color ? `${event.color}20` : '#e9d5ff20',
                      borderLeft: `3px solid ${event.color || '#a855f7'}`
                    }}
                  >
                    <div className="font-medium">
                      {formatTime(new Date(event.start))} - {event.end ? formatTime(new Date(event.end)) : ''}
                    </div>
                    <div>{event.title}</div>
                    {event.location && <div className="truncate">{event.location}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderYearView = (): JSX.Element => {
    const months = getMonthsInYear();
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map((monthDate, index) => {
          const monthEvents = events.filter(event =>
            new Date(event.start).getMonth() === index &&
            new Date(event.start).getFullYear() === year
          );
          return (
            <Card
              key={index}
              onClick={() => {
                setCurrentDate(monthDate);
                setCurrentView('month');
              }}
              className={`cursor-pointer ${currentDate.getMonth() === index ? 'border-primary' : ''}`}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-base">{monthNames[index]}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {monthEvents.slice(0, 3).map(event => {
                    const eventDate = new Date(event.start);
                    const dayName = dayNames[eventDate.getDay()];
                    const day = eventDate.getDate();
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event, e);
                        }}
                        onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                        onMouseLeave={handleEventMouseLeave}
                        className="text-xs p-1 rounded truncate flex items-center cursor-pointer"
                        style={{
                          backgroundColor: event.color ? `${event.color}20` : '#e9d5ff20',
                          borderLeft: `3px solid ${event.color || '#a855f7'}`,
                          opacity: event.status === 'draft' ? 0.6 : 1,
                          borderStyle: event.status === 'draft' ? 'dashed' : 'solid',
                        }}
                      >
                        <span className="text-muted-foreground text-xs mr-1">{dayName},</span>
                        <span className="font-medium">{day}</span>
                        <span className="ml-1 truncate">{event.title}</span>
                      </div>
                    );
                  })}
                  {monthEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{monthEvents.length - 3} more</div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render the appropriate view
  const renderView = (): JSX.Element => {
    switch (currentView) {
      case 'month':
        return renderMonthView();
      case 'week':
        return renderWeekView();
      case 'day':
        return renderDayView();
      case 'year':
        return renderYearView();
      default:
        return renderMonthView();
    }
  };

  return (
    <div className={`${className}`}>
      {/* Calendar Header */}
      {!hideHeader && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
          <h2 className="text-xl font-semibold">
            {currentView === 'month' && `${monthNames[month]} ${year}`}
            {currentView === 'week' && `Week of ${formatDate(getDaysInWeek()[0])}`}
            {currentView === 'day' && formatDate(currentDate)}
            {currentView === 'year' && year}
          </h2>

          <div className="flex flex-wrap gap-2">
            {/* Search input with suggestions */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 w-48 md:w-64"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-muted-foreground absolute left-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {/* Search suggestions dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <Card className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto">
                  <CardContent className="p-2">
                    {searchSuggestions.map(event => (
                      <div
                        key={event.id}
                        onClick={() => handleSuggestionClick(event)}
                        className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center rounded-sm"
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                          style={{ backgroundColor: event.color || '#a855f7' }}
                        ></div>
                        <div className="truncate">
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(new Date(event.start))}
                            {!event.allDay && `, ${formatTime(new Date(event.start))}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Clear search button */}
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className="absolute right-1 top-1 h-7 w-7"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>

            {/* Academic year dropdown */}
            <Select value={selectedAcademicYear.toString()} onValueChange={handleAcademicYearChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYearOptions.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}-{year + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View selector */}
            <div className="flex bg-muted rounded-md p-1">
              {(['month', 'week', 'day', 'year'] as CalendarView[]).map(view => (
                <Button
                  key={view}
                  variant={currentView === view ? "default" : "ghost"}
                  size="sm"
                  onClick={() => changeView(view)}
                  className="capitalize"
                >
                  {view}
                </Button>
              ))}
            </div>

            {/* Create Event/Holiday Buttons */}
            {enableEventCreation && (
              <div className="flex gap-2">
                <Button onClick={() => {
                  setEventModalMode('create');
                  setEventBeingEdited(null);
                  setIsEventModalOpen(true);
                  setIsHolidayModal(false);
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Event
                </Button>
                <Button onClick={() => {
                  setEventModalMode('create');
                  setEventBeingEdited(null);
                  setIsEventModalOpen(true);
                  setIsHolidayModal(true);
                }}
                variant="outline"
                className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  🎉 Add Holiday
                </Button>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousPeriod}
                disabled={
                  (currentView === 'month' && year === selectedAcademicYear && month === 0) ||
                  (currentView === 'year' && year === selectedAcademicYear)
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
              <Button
                variant="outline"
                onClick={goToToday}
                disabled={new Date().getFullYear() > maxAcademicYear}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPeriod}
                disabled={
                  (currentView === 'month' && year === maxAcademicYear && month === 11) ||
                  (currentView === 'year' && year === maxAcademicYear)
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className="overflow-x-auto">
        {renderView()}
      </div>

      <EventCreationModal
        isOpen={isEventModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEventBeingEdited(null);
            setEventModalMode('create');
            setIsHolidayModal(false);
          }
          setIsEventModalOpen(open);
        }}
        selectedDate={
          eventModalMode === 'edit' && eventBeingEdited
            ? eventBeingEdited.start
            : selectedDate
        }
        mode={eventModalMode}
        eventToEdit={eventBeingEdited}
        isHoliday={isHolidayModal}
        onSubmit={(event, eventId) => {
          if (isHolidayModal) {
            if (eventModalMode === 'edit' && eventBeingEdited?.holiday_db_id && onEventUpdate) {
              // Editing a holiday - use update handler which will detect it's a holiday
              onEventUpdate({
                ...event,
                id: eventBeingEdited.id,
                holiday_db_id: eventBeingEdited.holiday_db_id,
                is_holiday: true,
              } as CalendarEvent);
            } else if (onHolidayCreate) {
              // Creating a new holiday
              onHolidayCreate(event);
            }
          } else if (eventModalMode === 'edit' && eventId !== undefined && onEventUpdate) {
            onEventUpdate({
              ...event,
              id: eventId,
              // Use attendees from the event (from modal), not the old ones
              // attendees are already included in the event object from the modal
            } as CalendarEvent);
          } else if (eventModalMode === 'create' && onEventCreate) {
            onEventCreate(event);
          }
          setEventBeingEdited(null);
          setEventModalMode('create');
          setIsEventModalOpen(false);
          setIsHolidayModal(false);
        }}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={isEventDetailsModalOpen}
        onOpenChange={setIsEventDetailsModalOpen}
        selectedEvent={selectedEvent}
        enableEventDeletion={enableEventDeletion}
        enableEventEditing={enableEventEditing}
        onDelete={(eventId, event) => {
          if (onEventDelete) onEventDelete(eventId, event);
        }}
        onEdit={(event) => {
          if (event) {
            openEditModal(event);
          }
        }}
      />
    </div>
  );
};

export default FullCalendar;