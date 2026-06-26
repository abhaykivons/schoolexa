import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarEvent } from './full-calendar';

export interface EventDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEvent: CalendarEvent | null;
  enableEventDeletion?: boolean;
  enableEventEditing?: boolean;
  onDelete?: (eventId: number | string, event?: CalendarEvent) => void;
  onEdit?: (event: CalendarEvent) => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onOpenChange,
  selectedEvent,
  enableEventDeletion = true,
  enableEventEditing = true,
  onDelete,
  onEdit
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
        </DialogHeader>

        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: selectedEvent.color || '#3b82f6' }}
                ></div>
                <h4 className="text-xl font-medium">{selectedEvent.title}</h4>
              </div>
              {selectedEvent.is_holiday && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full border border-red-200 dark:border-red-800">
                  🎉 Public Holiday
                </span>
              )}
              {selectedEvent.status === 'draft' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full border border-amber-200 dark:border-amber-800">
                  Draft
                </span>
              )}
              {selectedEvent.creator && !selectedEvent.is_holiday && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full border border-blue-200 dark:border-blue-800">
                  Created by: {selectedEvent.creator.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">Date & Time</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {formatDate(new Date(selectedEvent.start))}
                    {!selectedEvent.allDay && `, ${formatTime(new Date(selectedEvent.start))}`}
                    {selectedEvent.end && ` - ${formatTime(new Date(selectedEvent.end))}`}
                    {selectedEvent.allDay && <span className="ml-1">(All day)</span>}
                  </div>
                </div>
              </div>

              {selectedEvent.location && (
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-300">Location</div>
                    <div className="text-gray-600 dark:text-gray-400">{selectedEvent.location}</div>
                  </div>
                </div>
              )}

              {selectedEvent.description && (
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-300">Description</div>
                    <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedEvent.description}</div>
                  </div>
                </div>
              )}

              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-300">Attendees</div>
                    <div className="mt-1">
                      {selectedEvent.attendees.map((attendee, index) => (
                        <span key={index} className="inline-block bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 mr-1 mb-1">
                          {attendee.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedEvent.creator && !selectedEvent.is_holiday && (
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-300">Created By</div>
                    <div className="text-gray-600 dark:text-gray-400">{selectedEvent.creator.name}</div>
                    {selectedEvent.creator.email && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">{selectedEvent.creator.email}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-end space-x-2">
          {enableEventDeletion && selectedEvent && (
            <Button
              onClick={() => {
                if (onDelete) onDelete(selectedEvent.id, selectedEvent);
                onOpenChange(false);
              }}
              variant="destructive"
            >
              {selectedEvent.is_holiday ? 'Delete Holiday' : 'Delete Event'}
            </Button>
          )}

          {enableEventEditing && selectedEvent && (
            <Button
              onClick={() => {
                if (onEdit) onEdit(selectedEvent);
                onOpenChange(false);
              }}
            >
              {selectedEvent.is_holiday ? 'Edit Holiday' : 'Edit Event'}
            </Button>
          )}

          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;