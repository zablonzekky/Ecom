import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('admin_access_token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await Promise.race([
        authService.me(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('auth_timeout')), 8000)
        ),
      ]);
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('admin_access_token', access);
    localStorage.setItem('admin_refresh_token', refresh);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const logout = async () => {
    try {
      await authService.logout(localStorage.getItem('admin_refresh_token'));
    } finally {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      setUser,
      isAuthenticated: !!user,  // ← added
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