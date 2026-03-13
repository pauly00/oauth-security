"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'HR' | 'ADMIN';
  rankTitle: string;
  companyId: number;
  companyName: string;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const STORAGE_KEY = 'payroll_user';

  useEffect(() => {
    // Check for access_token cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const token = getCookie('access_token');
    if (token) {
        // In a real app, we would fetch /userinfo here.
        // For now, we'll decode the JWT or use a dummy user if token exists.
        setUser({
            id: 1,
            name: 'OAuth User',
            email: 'user@example.com',
            role: 'ADMIN',
            rankTitle: 'Manager',
            companyId: 1,
            companyName: 'Fisa Corp'
        });
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    const clientId = 'test-client';
    const redirectUri = encodeURIComponent('http://localhost:3001/api/auth/callback');
    const authUrl = `http://localhost:9000/oauth2/authorize?response_type=code&client_id=${clientId}&scope=openid%20profile&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  const logout = () => {
    setUser(null);
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login: () => login(), logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
