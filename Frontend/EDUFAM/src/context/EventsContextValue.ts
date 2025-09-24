import { createContext } from 'react';
import type { EventsContextType } from './EventsContext';

export const EventsContext = createContext<EventsContextType | undefined>(undefined);