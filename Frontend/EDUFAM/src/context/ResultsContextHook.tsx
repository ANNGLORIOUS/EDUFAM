import { useContext } from 'react';
import { ResultsContext } from './ResultsContextObject';
import type { ResultsContextValue } from './ResultsContext';

export const useResults = (): ResultsContextValue => {
  const ctx = useContext(ResultsContext);
  if (!ctx) throw new Error('useResults must be used within a ResultsProvider');
  return ctx;
};