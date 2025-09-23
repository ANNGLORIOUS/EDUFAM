import { createContext } from 'react';
import type { ResultsContextValue } from './ResultsContext';
export const ResultsContext = createContext<ResultsContextValue | undefined>(undefined);