import React, { useState } from 'react';
import { ResultsContext } from './ResultsContextObject';

export interface ResultEntry {
  studentName: string;
  studentId: string;
  studentClass: string;
  term: string;
  fileName?: string;
  fileDataUrl?: string;
}

export interface ResultsContextValue {
  results: ResultEntry[];
  addResult: (result: ResultEntry) => void;
}


export const ResultsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<ResultEntry[]>([]);
  const addResult = (result: ResultEntry) => setResults(prev => [...prev, result]);
  return (
    <ResultsContext.Provider value={{ results, addResult }}>
      {children}
    </ResultsContext.Provider>
  );
};

// useResults moved to ResultsContextHook.tsx for Fast Refresh compliance
