import { api } from './api';

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
}

const getFeesForStudent = (studentId: string): Promise<Fee[]> => {
  return api.get<Fee[]>(`/students/${studentId}/fees`);
};

export const feeService = {
  getFeesForStudent,
};
