
import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContextObject';


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


