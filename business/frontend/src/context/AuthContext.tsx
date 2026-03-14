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
    
    const checkSession = async (authToken: string) => {
      try {
        const res = await fetch('http://localhost:8080/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to fetch user profile', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      checkSession(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = () => {
    const clientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'test-client';
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:4000/api/auth/callback');
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
