import { createContext } from 'react';

export interface AuthContextType {
  user: {
    email: string;
    name: string;
  } | null;
  login: (email: string, name: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
