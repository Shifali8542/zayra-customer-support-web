import React, {
  createContext, useContext, useState,
  useCallback, ReactNode,
} from 'react';
import type {
  AuthUser, AuthState, LoginCredentials, SignupCredentials,
} from '../schema';

interface AuthContextValue extends AuthState {
  login:    (creds: LoginCredentials)  => Promise<void>;
  signup:   (creds: SignupCredentials) => Promise<void>;
  logout:   () => void;
  skipAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_USER: AuthUser = {
  id: 'agent-priya',
  name: 'Priya S.',
  email: 'priya.s@zayra.health',
  role: 'agent',
  avatarInitials: 'PS',
  status: 'online',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async ({ email, password }: LoginCredentials) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    await new Promise((r) => setTimeout(r, 700)); // simulate network
    if (email && password) {
      setState({ user: MOCK_USER, isAuthenticated: true, isLoading: false, error: null });
    } else {
      setState((s) => ({ ...s, isLoading: false, error: 'Invalid credentials. Please try again.' }));
    }
  }, []);

  const signup = useCallback(async ({ name, email, password, confirmPassword }: SignupCredentials) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    await new Promise((r) => setTimeout(r, 700));
    if (!name || !email || !password) {
      setState((s) => ({ ...s, isLoading: false, error: 'All fields are required.' }));
      return;
    }
    if (password !== confirmPassword) {
      setState((s) => ({ ...s, isLoading: false, error: 'Passwords do not match.' }));
      return;
    }
    setState({ user: MOCK_USER, isAuthenticated: true, isLoading: false, error: null });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const skipAuth = useCallback(() => {
    setState({ user: MOCK_USER, isAuthenticated: true, isLoading: false, error: null });
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
