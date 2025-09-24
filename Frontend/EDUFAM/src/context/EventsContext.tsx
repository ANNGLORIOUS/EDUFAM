import React, { useState } from 'react';
import { EventsContext } from './EventsContextValue';

export interface EdufamEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description: string;

}

export interface EventsContextType {
  events: EdufamEvent[];
  addEvent: (event: Omit<EdufamEvent, 'id'>) => void;
}



export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Load from localStorage or use default events
  const defaultEvents: EdufamEvent[] = [
    {
      id: 1,
      title: 'Maths Contest',
      start: new Date(2025, 8, 23, 10, 0), // September 23, 2025
      end: new Date(2025, 8, 23, 12, 0),
      description: 'Annual maths contest for all grades.',
    },
    {
      id: 2,
      title: 'Parents Meeting',
      start: new Date(2025, 8, 25, 14, 0), // September 25, 2025
      end: new Date(2025, 8, 25, 16, 0),
      description: 'Meet with teachers to discuss your child progress.',
    },
    {
      id: 3,
      title: 'School Holiday',
      start: new Date(2025, 8, 28, 0, 0), // September 28, 2025
      end: new Date(2025, 8, 28, 23, 59),
      description: 'School will be closed for a public holiday.',
    },
    {
      id: 4,
      title: 'Science Fair',
      start: new Date(2025, 9, 2, 9, 0), // October 2, 2025
      end: new Date(2025, 9, 2, 15, 0),
      description: 'Annual science fair for all students.',
    },
    {
      id: 5,
      title: 'Sports Day',
      start: new Date(2025, 9, 10, 8, 0), // October 10, 2025
      end: new Date(2025, 9, 10, 17, 0),
      description: 'Annual sports day competition.',
    },
  ];
  const [events, setEvents] = useState<EdufamEvent[]>(() => {
    const stored = localStorage.getItem('edufam_events');
    if (stored) {
      // Dates are stored as strings, so convert them back to Date objects
      return (JSON.parse(stored) as EdufamEvent[]).map((e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }));
    }
    return defaultEvents;
  });

  // Persist events to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('edufam_events', JSON.stringify(events));
  }, [events]);

  const addEvent = (event: Omit<EdufamEvent, 'id'>) => {
    setEvents(prev => [
      ...prev,
      { ...event, id: prev.length ? Math.max(...prev.map(e => e.id)) + 1 : 1 }
    ]);
  };

  // In the future, replace setEvents/addEvent with backend API calls

  return (
    <EventsContext.Provider value={{ events, addEvent }}>
      {children}
    </EventsContext.Provider>
  );
};

