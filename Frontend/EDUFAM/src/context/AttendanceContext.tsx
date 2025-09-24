import React, { useState } from 'react';
import { AttendanceContext } from './AttendanceContextObject';

export interface AttendanceEntry {
  studentId: string;
  studentName: string;
  studentClass: string;
  term: string;
  parentEmail: string;
  attendancePercent: number;
}

export interface AttendanceContextValue {
  attendance: AttendanceEntry[];
  addAttendance: (entry: AttendanceEntry) => void;
}


export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage on init
  const [attendance, setAttendance] = useState<AttendanceEntry[]>(() => {
    const stored = localStorage.getItem('edufam_attendance');
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage whenever attendance changes
  React.useEffect(() => {
    localStorage.setItem('edufam_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const addAttendance = (entry: AttendanceEntry) => setAttendance(prev => [...prev, entry]);
  return (
    <AttendanceContext.Provider value={{ attendance, addAttendance }}>
      {children}
    </AttendanceContext.Provider>
  );
};

// useAttendance moved to AttendanceContextHook.tsx for Fast Refresh compliance
