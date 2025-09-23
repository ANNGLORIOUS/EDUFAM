import React, { useState } from 'react';
import { ResultsContext } from './ResultsContextObject';

export interface ResultEntry {
  studentName: string;
  studentId: string;
  studentClass: string;
  term: string;
  grade: string;
  parentEmail: string;
  fileName?: string;
  fileDataUrl?: string;
}

export interface ResultsContextValue {
  results: ResultEntry[];
  addResult: (result: ResultEntry) => void;
}


export const ResultsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage on init
  const [results, setResults] = useState<ResultEntry[]>(() => {
    const stored = localStorage.getItem('edufam_results');
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage whenever results change
  React.useEffect(() => {
    localStorage.setItem('edufam_results', JSON.stringify(results));
  }, [results]);

  const addResult = (result: ResultEntry) => setResults(prev => [...prev, result]);
  return (
    <ResultsContext.Provider value={{ results, addResult }}>
      {children}
    </ResultsContext.Provider>
  );
};

// useResults moved to ResultsContextHook.tsx for Fast Refresh compliance
