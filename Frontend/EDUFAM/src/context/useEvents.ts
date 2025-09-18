import { useContext } from 'react';
import { EventsContext } from './EventsContextValue';
import type { EventsContextType } from './EventsContext';

export const useEvents = (): EventsContextType => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
};
