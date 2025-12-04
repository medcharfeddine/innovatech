'use client';

import { useState, useCallback, ReactNode, useEffect } from 'react';
import { createContext, useContext } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'user' | 'admin' | null;
  userId: string | null;
  login: (token: string, role: string, userId: string, user?: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Load auth from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole') as 'user' | 'admin' | null;
    const id = localStorage.getItem('userId');
    
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
      setUserId(id);
    }
  }, []);

  const login = useCallback((token: string, role: string, userId: string, user?: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', userId);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    setIsAuthenticated(true);
    setUserRole(role as 'user' | 'admin');
    setUserId(userId);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
