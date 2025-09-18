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
  const [events, setEvents] = useState<EdufamEvent[]>([
    {
      id: 1,
      title: 'Maths Contest',
      start: new Date(2025, 8, 22, 10, 0),
      end: new Date(2025, 8, 22, 12, 0),
      description: 'Annual maths contest for all grades.',
    },
    {
      id: 2,
      title: 'Parents Meeting',
      start: new Date(2025, 8, 25, 14, 0),
      end: new Date(2025, 8, 25, 16, 0),
      description: 'Meet with teachers to discuss your child’s progress.',
    },
    {
      id: 3,
      title: 'School Holiday',
      start: new Date(2025, 8, 28, 0, 0),
      end: new Date(2025, 8, 28, 23, 59),
      description: 'School will be closed for a public holiday.',
    },
  ]);

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

