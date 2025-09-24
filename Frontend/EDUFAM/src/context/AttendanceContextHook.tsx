import { useContext } from 'react';
import { AttendanceContext } from './AttendanceContextObject';

export const useAttendance = () => {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error('useAttendance must be used within an AttendanceProvider');
  return ctx;
};