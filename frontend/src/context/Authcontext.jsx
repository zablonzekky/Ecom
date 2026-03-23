import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Restore session on mount ────────────────────────────────────────────────
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');

    // FIX: no token → nothing to fetch, clear loading immediately
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // FIX: race the API call against a 8-second timeout so that if the
      // backend is down or unreachable, loading never stays true forever
      // and every admin page remains usable (will redirect to login).
      const res = await Promise.race([
        authService.me(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('auth_timeout')), 8000)
        ),
      ]);
      setUser(res.data);
    } catch (err) {
      // FIX: on any error (network, 401, timeout) clear the stale tokens
      // so the user gets redirected to login cleanly instead of hanging.
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      // FIX: this ALWAYS runs — loading is never left as true
      // which is what was causing the blur overlay on all three admin pages.
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  // ─── Login ───────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  // ─── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authService.logout(localStorage.getItem('refresh_token'));
    } finally {
      ['access_token', 'refresh_token', 'user'].forEach((k) => localStorage.removeItem(k));
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}