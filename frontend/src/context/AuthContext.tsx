'use client';
// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const initialized = useRef(false);

  const refreshUser = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const { data } = await authApi.getProfile();
      setUser(data.data);
    } catch {
      if (typeof window !== 'undefined') localStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hanya jalankan sekali saat mount awal
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    const tokens = data.data;

    // Simpan token
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);

    // Set user SEBELUM redirect — pastikan state sudah update
    setUser(tokens.user);
    setIsLoading(false);

    // Gunakan replace agar back button tidak balik ke login
    const dest = tokens.user.role === 'user' ? '/dashboard' : '/admin';
    router.replace(dest);
  };

  const logout = useCallback(() => {
    // Coba call logout API (tidak blocking)
    try { authApi.logout(); } catch { /* ignore */ }
    localStorage.clear();
    setUser(null);
    setIsLoading(false);
    router.replace('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
