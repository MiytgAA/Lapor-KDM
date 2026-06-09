// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';
import { storage } from '@/lib/storage';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nama: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    const restore = async () => {
      try {
        const token = await storage.getAccessToken();
        if (token) {
          const { data } = await authApi.getProfile();
          setUser(data.data);
        }
      } catch {
        await storage.clear();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    const { access_token, refresh_token, user: u } = data.data;
    await storage.setTokens(access_token, refresh_token);
    await storage.setUser(u);
    setUser(u);
  }, []);

  const register = useCallback(async (nama: string, email: string, password: string) => {
    await authApi.register({ nama, email, password });
    // Auto-login after register
    await login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    await storage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
