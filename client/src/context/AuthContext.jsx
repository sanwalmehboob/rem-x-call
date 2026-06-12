import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../lib/api';

const TOKEN_KEY = 'remxcall_access_token';
const USER_KEY = 'remxcall_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!storedToken) {
        if (!cancelled) setIsReady(true);
        return;
      }

      setAuthToken(storedToken);
      setToken(storedToken);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          /* ignore corrupt cache */
        }
      }

      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled && data?.user) {
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      } catch (error) {
        // Only clear session when token is truly invalid/expired/revoked.
        // Keep session on temporary backend/network failures to avoid forced logout on refresh.
        const status = error?.response?.status;
        if (!cancelled && (status === 401 || status === 403)) {
          clearSession();
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const accessToken = data?.tokens?.access?.token;
    if (!accessToken) {
      throw new Error('Invalid response from server');
    }
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setAuthToken(accessToken);
    setToken(accessToken);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } finally {
      clearSession();
    }
  }, [clearSession, token]);

  const refreshMe = useCallback(async () => {
    if (!token) return null;
    const { data } = await api.get('/auth/me');
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    }
    return null;
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshMe,
    }),
    [user, token, isReady, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
