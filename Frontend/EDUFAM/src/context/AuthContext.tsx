import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  user: {
    email: string;
    name: string;
  } | null;
  login: (email: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  const login = (email: string, name: string) => setUser({ email, name });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


