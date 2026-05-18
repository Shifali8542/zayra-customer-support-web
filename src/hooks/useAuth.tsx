// src/hooks/useAuth.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { AuthUser, AuthState, LoginCredentials, SignupCredentials } from '../schema';
import { authApi } from '../services/api';

interface AuthContextValue extends AuthState {
  login:    (creds: LoginCredentials)  => Promise<void>;
  signup:   (creds: SignupCredentials) => Promise<void>;
  logout:   () => void;
  skipAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY   = 'zayra-access-token';
const REFRESH_KEY = 'zayra-refresh-token';
const USER_KEY    = 'zayra-user';

function saveSession(access: string, refresh: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY,   access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(USER_KEY,    JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function mapProfile(profile: Record<string, any>): AuthUser {
  const firstName = profile.first_name ?? '';
  const lastName  = profile.last_name  ?? '';
  const fullName  = `${firstName} ${lastName}`.trim() || profile.username || profile.email;
  const initials  = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || '??';
  const roleMap: Record<string, AuthUser['role']> = {
    support_agent: 'agent', support_supervisor: 'supervisor', admin: 'admin',
  };
  return {
    id:             String(profile.id),
    name:           fullName,
    email:          profile.email,
    role:           roleMap[profile.role] ?? 'agent',
    avatarInitials: initials,
    status:         'online',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const user = loadUser();
    return { user, isAuthenticated: !!user, isLoading: false, error: null };
  });

  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await authApi.login({ email, password });
      const user = mapProfile(data.user ?? data);
      saveSession(data.access, data.refresh, user);
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message ?? 'Login failed. Please check your credentials.' }));
    }
  }, []);

  const signup = useCallback(async (creds: SignupCredentials) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    if (!creds.name || !creds.email || !creds.password) {
      setState(s => ({ ...s, isLoading: false, error: 'All fields are required.' }));
      return;
    }
    if (creds.password !== creds.confirmPassword) {
      setState(s => ({ ...s, isLoading: false, error: 'Passwords do not match.' }));
      return;
    }
   try {
      await authApi.signup(creds);
      setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
      window.location.href = '/login';
    } catch (err: any) {
      setState(s => ({ ...s, isLoading: false, error: err.message ?? 'Signup failed.' }));
    }
  }, []);

  const logout = useCallback(() => {
    const refresh = localStorage.getItem(REFRESH_KEY) ?? '';
    if (refresh) authApi.logout(refresh).catch(() => {});
    clearSession();
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const skipAuth = useCallback(() => {
    const mockUser: AuthUser = {
      id: 'skip', name: 'Demo Agent', email: 'demo@zayra.health',
      role: 'agent', avatarInitials: 'DA', status: 'online',
    };
    setState({ user: mockUser, isAuthenticated: true, isLoading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, skipAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
