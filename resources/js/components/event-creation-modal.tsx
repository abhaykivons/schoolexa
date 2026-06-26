import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InputError from '@/components/input-error';
import { CalendarEvent } from './full-calendar';

export interface EventCreationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onSubmit: (event: Omit<CalendarEvent, 'id'>, eventId?: number | string) => void;
  mode?: 'create' | 'edit';
  eventToEdit?: CalendarEvent | null;
  isHoliday?: boolean;
}

const COLOR_PRESETS = [
  '#3b82f6', '#ef4444', '#22c55e', '#eab308',
  '#a855f7', '#ec4899', '#f97316', '#6366f1',
  '#06b6d4', '#8b5cf6', '#64748b', '#14b8a6'
];

const defaultEventState = (date: Date | null) => {
  const now = new Date();
  let start = date ? new Date(date) : new Date(now);

  if (start.getTime() < now.getTime()) {
    start = new Date(now);
  }

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  return {
    title: '',
    start,
    end,
    allDay: false,
    description: '',
    location: '',
    color: '#3b82f6',
    status: 'published' as 'published' | 'draft',
    attendees: [] as { id: number; name: string; email?: string }[]
  };
};

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateInput = (value: string): { year: number; month: number; day: number } | null => {
  const [year, month, day] = value.split('-').map(Number);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }
  return { year, month: month - 1, day };
};

const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isOpen,
  onOpenChange,
  selectedDate,
  onSubmit,
  mode = 'create',
  eventToEdit = null,
  isHoliday = false
}) => {
  const [newEvent, setNewEvent] = useState(defaultEventState(selectedDate));
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Title validation
    if (!newEvent.title || newEvent.title.trim() === '') {
      errors.title = 'Event title is required';
    } else if (newEvent.title.length > 255) {
      errors.title = 'Title must be less than 255 characters';
    }

    // Date validation for holidays
    if (isHoliday) {
      if (!newEvent.start) {
        errors.startDate = 'Start date is required';
      }
      if (newEvent.end && newEvent.end < newEvent.start) {
        errors.endDate = 'End date must be on or after start date';
      }
    } else {
      // Date validation for regular events
      if (!newEvent.start) {
        errors.startDate = 'Start date is required';
      }
      
      // Time validation for non-all-day events
      if (!newEvent.allDay) {
        if (!newEvent.end) {
          errors.endTime = 'End time is required for timed events';
        } else if (newEvent.end <= newEvent.start) {
          errors.endTime = 'End time must be after start time';
        }
      } else {
        // All-day event validation
        if (newEvent.end && newEvent.end < newEvent.start) {
          errors.endDate = 'End date must be on or after start date';
        }
      }

      // Published event validation - start must be in future
      const finalStatus = isEditMode && newEvent.status ? newEvent.status : 'published';
      if (finalStatus === 'published' && !isEditMode) {
        const now = new Date();
        if (newEvent.start.getTime() < now.getTime()) {
          errors.startDate = 'Start date/time must be in the future for published events';
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  const [guestQuery, setGuestQuery] = useState('');
  const [guestSuggestions, setGuestSuggestions] = useState<{ id: number, name: string, email: string }[]>([]);
  const [showGuestSuggestions, setShowGuestSuggestions] = useState(false);
  const guestSuggestionsRef = useRef<HTMLDivElement>(null);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both color picker and color button
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node) &&
        colorButtonRef.current &&
        !colorButtonRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
      
      if (
        guestSuggestionsRef.current &&
        !guestSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowGuestSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUsers = () => {
      const query = guestQuery.trim();
      const searchQuery = query.length > 0 ? `?query=${encodeURIComponent(query)}` : '';
      
      fetch(`/calendar/users/search${searchQuery}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch users');
          }
          return res.json();
        })
        .then(data => {
          const currentAttendees = newEvent.attendees || [];
          const filtered = data.filter((user: any) => !currentAttendees.some(a => a.id === user.id));
          setGuestSuggestions(filtered);
          if (filtered.length > 0 || query.length > 0) {
            setShowGuestSuggestions(true);
          }
        })
        .catch(err => { 
          console.error('Error fetching users:', err);
          setGuestSuggestions([]);
        });
    };

    const timeoutId = setTimeout(fetchUsers, guestQuery.trim().length > 0 ? 300 : 100);
    return () => clearTimeout(timeoutId);
  }, [guestQuery, newEvent.attendees]);

  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorChange = (color: string) => {
    setNewEvent(prev => ({
      ...prev,
      color
    }));
    // Don't close the color picker immediately after selecting a color
  };

  const addGuest = (user: { id: number; name: string; email: string }) => {
    setNewEvent(prev => ({
      ...prev,
      attendees: [...(prev.attendees || []), user]
    }));
    setGuestQuery('');
    setShowGuestSuggestions(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && eventToEdit) {
      if (eventToEdit.is_holiday) {
        let endDate = eventToEdit.end ? new Date(eventToEdit.end) : new Date(eventToEdit.start);
        const startDateOnly = new Date(eventToEdit.start.getFullYear(), eventToEdit.start.getMonth(), eventToEdit.start.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const daysDiff = Math.floor((endDateOnly.getTime() - startDateOnly.getTime()) / (24 * 60 * 60 * 1000));
        if (daysDiff <= 1) {
          endDate = new Date(eventToEdit.start);
          endDate.setHours(23, 59, 59, 999);
        } else {
          endDate = new Date(endDate);
          endDate.setDate(endDate.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
        }
        
        setNewEvent({
          title: eventToEdit.title,
          start: new Date(eventToEdit.start),
          end: endDate,
          allDay: true,
          description: eventToEdit.description || '',
          location: '',
          color: eventToEdit.color || '#ef4444',
          attendees: [],
          status: 'published'
        });
      } else {
        setNewEvent({
          title: eventToEdit.title,
          start: new Date(eventToEdit.start),
          end: eventToEdit.end ? new Date(eventToEdit.end) : new Date(eventToEdit.start),
          allDay: eventToEdit.allDay,
          description: eventToEdit.description || '',
          location: eventToEdit.location || '',
          color: eventToEdit.color || '#3b82f6',
          attendees: eventToEdit.attendees || [],
          status: eventToEdit.status || 'published'
        });
      }
    } else {
      const defaultState = defaultEventState(selectedDate);
      if (isHoliday) {
        defaultState.allDay = true;
        defaultState.start.setHours(0, 0, 0, 0);
        if (defaultState.end) {
          defaultState.end = new Date(defaultState.start);
          defaultState.end.setHours(23, 59, 59, 999);
        }
        defaultState.color = '#ef4444';
      }
      setNewEvent({
        ...defaultState,
        attendees: []
      });
    }
    setFormError(null);
    setFieldErrors({});
    setGuestQuery('');
    setGuestSuggestions([]);
  }, [mode, eventToEdit, selectedDate, isOpen, isHoliday]);

  const enforceEndAfterStart = (start: Date, end: Date | null | undefined): Date => {
    if (!end) {
      return new Date(start);
    }
    if (start <= end) {
      return end;
    }
    return new Date(start);
  };

  const handleEventFormSubmit = (e: React.FormEvent, status?: 'published' | 'draft') => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    const finalStatus = status ?? (isEditMode && newEvent.status ? newEvent.status : 'published');

    if (isHoliday) {
      let endDate = newEvent.end || new Date(newEvent.start);
      
      const startDateOnly = new Date(newEvent.start.getFullYear(), newEvent.start.getMonth(), newEvent.start.getDate());
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      if (endDateOnly.getTime() < startDateOnly.getTime()) {
        setFormError('End date must be on or after the start date.');
        return;
      }

      const isSingleDay = endDateOnly.getTime() === startDateOnly.getTime();
      const holidayEndDate = isSingleDay
        ? new Date(startDateOnly)
        : new Date(endDateOnly);
      
      if (isSingleDay) {
        holidayEndDate.setDate(holidayEndDate.getDate() + 1);
        holidayEndDate.setHours(0, 0, 0, 0);
      } else {
        holidayEndDate.setHours(23, 59, 59, 999);
      }
      
      onSubmit({
        title: newEvent.title,
        start: newEvent.start,
        end: holidayEndDate,
        allDay: true,
        description: newEvent.description,
        location: '',
        color: newEvent.color,
        attendees: [],
        status: 'published'
      }, undefined);
      onOpenChange(false);
      setNewEvent(defaultEventState(selectedDate));
      setFormError(null);
      return;
    }

    if (finalStatus === 'published') {
      const now = new Date();
      if (newEvent.start.getTime() < now.getTime()) {
        setFormError('Start date/time must be in the future for published events.');
        return;
      }
    }

    if (!newEvent.allDay && !newEvent.end) {
      setFormError('End date/time is required for timed events.');
      return;
    }
    
    if (newEvent.allDay && !newEvent.end) {
      const endOfDay = new Date(newEvent.start);
      endOfDay.setHours(23, 59, 59, 999);
      newEvent.end = endOfDay;
    }
    
    if (newEvent.allDay) {
      if (newEvent.end.getTime() < newEvent.start.getTime()) {
        setFormError('End date must be on or after the start date.');
        return;
      }
    } else {
      if (newEvent.end.getTime() <= newEvent.start.getTime()) {
        setFormError('End time must be after the start time.');
        return;
      }
    }

    onSubmit({
      title: newEvent.title,
      start: newEvent.start,
      end: newEvent.end,
      allDay: newEvent.allDay,
      description: newEvent.description,
      location: newEvent.location,
      color: newEvent.color,
      attendees: newEvent.attendees,
      status: finalStatus
    }, mode === 'edit' ? eventToEdit?.id : undefined);
    onOpenChange(false);
    setNewEvent(defaultEventState(selectedDate));
    setFormError(null);
  };
  const isEditMode = mode === 'edit';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            {isHoliday 
              ? (isEditMode ? 'Edit Holiday' : 'Create New Holiday') 
              : (isEditMode ? 'Edit Event' : 'Create New Event')
            }
          </DialogTitle>
          <DialogDescription>
            {isHoliday
              ? (isEditMode ? 'Update the holiday details. Holidays are always all-day events.' : 'Add a new holiday to your calendar. Holidays can span multiple days and are always all-day events.')
              : (isEditMode ? 'Update the event details and click save when you are done.' : 'Add a new event to your calendar. Click save when you\'re done.')
            }
          </DialogDescription>
        </DialogHeader>
        {formError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-3 py-2 rounded mb-4 text-sm">
            {formError}
          </div>
        )}
        <form onSubmit={(e) => handleEventFormSubmit(e, 'published')} className="space-y-4">

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-4'>
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={newEvent.title}
                  onChange={(e) => {
                    handleEventFormChange(e);
                    if (fieldErrors.title) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.title;
                        return newErrors;
                      });
                    }
                  }}
                  className={fieldErrors.title ? 'border-red-500 dark:border-red-400' : ''}
                />
                <InputError message={fieldErrors.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newEvent.description}
                  onChange={handleEventFormChange}
                />
              </div>
              {isHoliday ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="start"
                      type="date"
                      name="start"
                      value={formatDateInput(newEvent.start)}
                      onChange={(e) => {
                        const parsed = parseDateInput(e.target.value);
                        if (!parsed) return;
                        setNewEvent(prev => {
                          const newStartDate = new Date(prev.start);
                          newStartDate.setFullYear(parsed.year, parsed.month, parsed.day);
                          newStartDate.setHours(0, 0, 0, 0);
                          let newEnd = prev.end ? new Date(prev.end) : new Date(newStartDate);
                          const newStartDateOnly = new Date(newStartDate.getFullYear(), newStartDate.getMonth(), newStartDate.getDate());
                          const newEndDateOnly = new Date(newEnd.getFullYear(), newEnd.getMonth(), newEnd.getDate());
                          
                          if (newEndDateOnly < newStartDateOnly) {
                            newEnd = new Date(newStartDate);
                            newEnd.setHours(23, 59, 59, 999);
                          } else {
                            newEnd.setHours(23, 59, 59, 999);
                          }
                          return {
                            ...prev,
                            start: newStartDate,
                            end: newEnd,
                            allDay: true,
                          };
                        });
                        if (fieldErrors.startDate || fieldErrors.endDate) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.startDate;
                            delete newErrors.endDate;
                            return newErrors;
                          });
                        }
                      }}
                      className={fieldErrors.startDate ? 'border-red-500 dark:border-red-400' : ''}
                    />
                    <InputError message={fieldErrors.startDate} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="end"
                      type="date"
                      name="end"
                      value={newEvent.end ? formatDateInput(newEvent.end) : ''}
                      onChange={(e) => {
                        const parsed = parseDateInput(e.target.value);
                        if (!parsed) {
                          setNewEvent(prev => {
                            const sameDay = new Date(prev.start);
                            sameDay.setHours(23, 59, 59, 999);
                            return {
                              ...prev,
                              end: sameDay,
                            };
                          });
                          return;
                        }
                        setNewEvent(prev => {
                          const newEndDate = new Date(prev.start);
                          newEndDate.setFullYear(parsed.year, parsed.month, parsed.day);
                          newEndDate.setHours(23, 59, 59, 999);
                          if (newEndDate < prev.start) {
                            newEndDate.setTime(prev.start.getTime());
                            newEndDate.setHours(23, 59, 59, 999);
                          }
                          return {
                            ...prev,
                            end: newEndDate,
                          };
                        });
                        if (fieldErrors.endDate) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.endDate;
                            return newErrors;
                          });
                        }
                      }}
                      className={fieldErrors.endDate ? 'border-red-500 dark:border-red-400' : ''}
                    />
                    <InputError message={fieldErrors.endDate} />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(() => {
                        if (!newEvent.end) return 'Leave empty for single-day holiday';
                        const startDateOnly = new Date(newEvent.start.getFullYear(), newEvent.start.getMonth(), newEvent.start.getDate());
                        const endDateOnly = new Date(newEvent.end.getFullYear(), newEvent.end.getMonth(), newEvent.end.getDate());
                        const daysDiff = Math.floor((endDateOnly.getTime() - startDateOnly.getTime()) / (24 * 60 * 60 * 1000));
                        if (daysDiff === 0) {
                          return '✓ Single-day holiday (start and end are the same)';
                        } else {
                          return `${daysDiff + 1} day${daysDiff > 0 ? 's' : ''} holiday`;
                        }
                      })()}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="start"
                        type="date"
                        name="start"
                        value={formatDateInput(newEvent.start)}
                        onChange={(e) => {
                          const parsed = parseDateInput(e.target.value);
                          if (!parsed) return;
                          setNewEvent(prev => {
                            const newStartDate = new Date(prev.start);
                            newStartDate.setFullYear(parsed.year, parsed.month, parsed.day);
                            return {
                              ...prev,
                              start: newStartDate,
                              end: enforceEndAfterStart(newStartDate, prev.end),
                            };
                          });
                          if (fieldErrors.startDate || fieldErrors.endTime) {
                            setFieldErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.startDate;
                              delete newErrors.endTime;
                              return newErrors;
                            });
                          }
                        }}
                        className={fieldErrors.startDate ? 'border-red-500 dark:border-red-400' : ''}
                      />
                      <InputError message={fieldErrors.startDate} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        name="startTime"
                        value={newEvent.allDay ? '' : newEvent.start.toTimeString().substring(0, 5)}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':');
                          const newStart = new Date(newEvent.start);
                          newStart.setHours(parseInt(hours), parseInt(minutes || '0'));
                          setNewEvent(prev => ({
                            ...prev,
                            start: newStart,
                            end: enforceEndAfterStart(newStart, prev.end),
                          }));
                          if (fieldErrors.endTime) {
                            setFieldErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.endTime;
                              return newErrors;
                            });
                          }
                        }}
                        disabled={newEvent.allDay}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="end"
                        type="date"
                        name="end"
                        value={formatDateInput(newEvent.end)}
                        onChange={(e) => {
                          const parsed = parseDateInput(e.target.value);
                          if (!parsed) return;
                          setNewEvent(prev => {
                            const newEndDate = new Date(prev.end);
                            newEndDate.setFullYear(parsed.year, parsed.month, parsed.day);
                            return {
                              ...prev,
                              end: enforceEndAfterStart(prev.start, newEndDate),
                            };
                          });
                          if (fieldErrors.endDate || fieldErrors.endTime) {
                            setFieldErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.endDate;
                              delete newErrors.endTime;
                              return newErrors;
                            });
                          }
                        }}
                        className={fieldErrors.endDate ? 'border-red-500 dark:border-red-400' : ''}
                      />
                      <InputError message={fieldErrors.endDate} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        name="endTime"
                        value={newEvent.allDay ? '' : newEvent.end.toTimeString().substring(0, 5)}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':');
                          const newEnd = new Date(newEvent.end);
                          newEnd.setHours(parseInt(hours), parseInt(minutes));
                          setNewEvent(prev => ({
                            ...prev,
                            end: enforceEndAfterStart(prev.start, newEnd),
                          }));
                          if (fieldErrors.endTime) {
                            setFieldErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.endTime;
                              return newErrors;
                            });
                          }
                        }}
                        disabled={newEvent.allDay}
                        className={fieldErrors.endTime ? 'border-red-500 dark:border-red-400' : ''}
                      />
                      <InputError message={fieldErrors.endTime} />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className='space-y-4'>
              <div className="space-y-2">
                <Label htmlFor="color">Event Color</Label>
                <div className="flex items-center gap-3 relative">
                  <button
                    ref={colorButtonRef}
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="flex items-center justify-between w-full px-3 py-2 border rounded-md text-sm bg-background hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center">
                      <div
                        className="h-5 w-5 rounded-full mr-2 border"
                        style={{ backgroundColor: newEvent.color }}
                      />
                      <span>{newEvent.color.toUpperCase()}</span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform ${showColorPicker ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  <div
                    className="h-10 w-10 rounded-md border flex-shrink-0"
                    style={{ backgroundColor: newEvent.color }}
                  />

                  {showColorPicker && (
                    <div
                      ref={colorPickerRef}
                      className="absolute top-full left-0 mt-1 w-80 p-4 bg-background border rounded-md shadow-lg z-10"
                    >
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Color Presets</h4>
                          <div className="grid grid-cols-6 gap-2">
                            {COLOR_PRESETS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`h-8 w-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${newEvent.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange(color)}
                                aria-label={`Select color ${color}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <h4 className="font-medium text-sm mb-2">Custom Color</h4>
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-md border"
                              style={{ backgroundColor: newEvent.color }}
                            />
                            <Input
                              type="color"
                              value={newEvent.color}
                              onChange={(e) => handleColorChange(e.target.value)}
                              className="w-20 h-10 p-1"
                            />
                            <Input
                              type="text"
                              value={newEvent.color}
                              onChange={(e) => handleColorChange(e.target.value)}
                              className="flex-1"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end hidden md:flex">
                          <button
                            type="button"
                            onClick={() => setShowColorPicker(false)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!isHoliday && (
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    name="location"
                    value={newEvent.location}
                    onChange={handleEventFormChange}
                  />
                </div>
              )}

              {!isHoliday && (
                <div className="space-y-2">
                  <Label>Guests</Label>
                  <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={guestQuery}
                    onChange={(e) => setGuestQuery(e.target.value)}
                    onFocus={() => {
                      if (guestSuggestions.length === 0 && guestQuery.trim().length === 0) {
                        fetch(`/calendar/users/search`)
                          .then(res => res.json())
                          .then(data => {
                            const currentAttendees = newEvent.attendees || [];
                            const filtered = data.filter((user: any) => !currentAttendees.some(a => a.id === user.id));
                            setGuestSuggestions(filtered);
                            if (filtered.length > 0) {
                              setShowGuestSuggestions(true);
                            }
                          })
                          .catch(err => console.error('Error fetching users:', err));
                      } else if (guestSuggestions.length > 0) {
                        setShowGuestSuggestions(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && guestQuery.trim()) {
                        e.preventDefault();
                        const queryLower = guestQuery.toLowerCase();
                        const match = guestSuggestions.find(u => 
                          u.email?.toLowerCase().includes(queryLower) || 
                          u.name?.toLowerCase().includes(queryLower)
                        );
                        if (match) {
                          addGuest(match);
                        }
                      }
                    }}
                  />
                  {showGuestSuggestions && (
                    <div 
                      ref={guestSuggestionsRef}
                      className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
                    >
                      {guestSuggestions.length > 0 ? (
                        <>
                          {guestQuery.trim() && (
                            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                              {guestSuggestions.length} result{guestSuggestions.length !== 1 ? 's' : ''} found
                            </div>
                          )}
                          {guestSuggestions.map(user => (
                            <div
                              key={user.id}
                              className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer text-sm transition-colors"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                addGuest(user);
                              }}
                            >
                              <div className="font-medium text-gray-900 dark:text-gray-100">{user.name || 'Unknown'}</div>
                              {user.email && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                              )}
                            </div>
                          ))}
                        </>
                      ) : guestQuery.trim() ? (
                        <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                          No users found matching "{guestQuery}"
                        </div>
                      ) : (
                        <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                          Start typing to search users...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {newEvent.attendees && newEvent.attendees.map((attendee, index) => (
                    <div key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center">
                      <span>{attendee.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewEvent(prev => ({
                            ...prev,
                            attendees: prev.attendees?.filter((_, i) => i !== index)
                          }));
                        }}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {!isHoliday && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allDay"
                    name="allDay"
                    checked={newEvent.allDay}
                    onChange={(e) => {
                      const isAllDay = e.target.checked;
                      setNewEvent(prev => {
                        if (isAllDay) {
                          const endDate = new Date(prev.start);
                          endDate.setHours(23, 59, 59, 999);
                          return {
                            ...prev,
                            allDay: true,
                            end: endDate,
                          };
                        } else {
                          const endDate = prev.end || new Date(prev.start);
                          if (endDate.getTime() <= prev.start.getTime()) {
                            endDate.setTime(prev.start.getTime() + 30 * 60 * 1000);
                          }
                          return {
                            ...prev,
                            allDay: false,
                            end: endDate,
                          };
                        }
                      });
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <Label htmlFor="allDay" className="text-sm font-normal">All day event</Label>
                </div>
              )}
              
              {isHoliday && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>ℹ️ Holiday Information:</strong> Holidays are always all-day events. You can set a start date and optional end date for multi-day holidays.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {!isHoliday && (
              <Button type="button" variant="secondary" onClick={(e) => handleEventFormSubmit(e as any, 'draft')}>
                Save as Draft
              </Button>
            )}
            <Button type="submit">
              {isHoliday
                ? (isEditMode ? 'Update Holiday' : 'Create Holiday')
                : (isEditMode ? 'Update Event' : 'Create Event')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventCreationModal;