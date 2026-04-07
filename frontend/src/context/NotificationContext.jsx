import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services';
import { useAuth } from './Authcontext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();           // ← consume auth state
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    // ← never fire if not logged in
    if (!isAuthenticated) return;

    try {
      const { data } = await notificationService.list();
      const notifications = data.results || data || [];
      setUnreadCount(
        Array.isArray(notifications)
          ? notifications.filter(n => !n.is_read).length
          : 0
      );
    } catch (e) {
      // Interceptor handles 401 redirect — nothing to do here
      console.error('Failed to fetch notifications:', e);
    }
  }, [isAuthenticated]);                           // ← re-runs when auth changes

  useEffect(() => {
    // ← don't even start the interval until authenticated
    if (!isAuthenticated) {
      setUnreadCount(0);                           // ← reset on logout
      return;
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);