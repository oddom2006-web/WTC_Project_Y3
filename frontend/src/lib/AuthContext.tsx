'use client';
// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, ApiError, getToken, setToken, clearToken } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user:     User | null;
  loading:  boolean;
  login:    (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Cookie helpers (so middleware can read role) — unchanged from the Firebase version ──
function setCookie(name: string, value: string, days = 7) {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value};expires=${exp};path=/;SameSite=Strict`;
}
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUserState] = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);

  // Restores the session on page load/refresh — the equivalent of Firebase's
  // onAuthStateChanged, but driven by a token in localStorage instead of the
  // SDK's own IndexedDB-backed persistence.
  useEffect(() => {
    async function restore() {
      const token = getToken();
      if (!token) { setLoading(false); return; }

      try {
        const { user: profile } = await api<{ user: User }>('/me');
        setUserState(profile);
        setCookie('dom_role', profile.role);
      } catch {
        clearToken();
        setUserState(null);
        deleteCookie('dom_role');
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { token, user: profile } = await api<{ token: string; user: User }>('/login', {
        method: 'POST',
        body: { email, password },
      });
      setToken(token);
      setUserState(profile);
      setCookie('dom_role', profile.role);
    } catch (e) {
      if (e instanceof ApiError && e.status === 422) throw new Error('Invalid credentials.');
      throw e;
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const { token, user: profile } = await api<{ token: string; user: User }>('/register', {
      method: 'POST',
      body: { username: name, email, phone, password },
    });
    setToken(token);
    setUserState(profile);
    setCookie('dom_role', 'customer');
  };

  const logout = async () => {
    try { await api('/logout', { method: 'POST' }); } catch { /* token may already be invalid — fine */ }
    clearToken();
    setUserState(null);
    deleteCookie('dom_role');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
