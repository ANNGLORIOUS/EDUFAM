import { api } from './api';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

const getCalendarEvents = (): Promise<CalendarEvent[]> => {
  return api.get<CalendarEvent[]>('/calendar/events');
};

export const calendarService = {
  getCalendarEvents,
};
