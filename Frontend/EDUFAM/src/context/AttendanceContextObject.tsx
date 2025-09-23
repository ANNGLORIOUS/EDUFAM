import { createContext } from 'react';
import type { AttendanceContextValue } from './AttendanceContext';
export const AttendanceContext = createContext<AttendanceContextValue | undefined>(undefined);
