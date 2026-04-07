/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Activity } from 'lucide-react';
import { notificationService } from '../services';
import { useNotifications } from '../context/NotificationContext';
import { StatusBadge, LoadingState, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const { setUnreadCount } = useNotifications();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'notifications') {
        const { data } = await notificationService.list();
        const list = data.results || data || [];
        setNotifications(Array.isArray(list) ? list : []);
      } else {
        const { data } = await notificationService.activityLogs();
        const list = data.results || data || [];
        setLogs(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
      setNotifications([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const markOneRead = async (n) => {
    // Already read — do nothing
    if (n.is_read) return;
    try {
      await notificationService.markRead(n.id);
      setNotifications(prev =>
        prev.map(item => item.id === n.id ? { ...item, is_read: true } : item)
      );
      // Decrement bell count by 1
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const typeColor = {
    info: 'var(--info)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--danger)'
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notifications & Activity</h1>
        {activeTab === 'notifications' && notifications.length > 0 && (
          <button className="btn btn-outline" onClick={markAllRead}>
            Mark All Read
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        <button
          className={`btn ${activeTab === 'notifications' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={15} /> Notifications
        </button>
        <button
          className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('activity')}
        >
          <Activity size={15} /> Activity Log
        </button>
      </div>

      <div className="card">
        {loading ? (
          <LoadingState />
        ) : activeTab === 'notifications' ? (
          notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" />
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markOneRead(n)}
                style={{
                  display: 'flex', gap: 14, padding: '14px 20px',
                  borderBottom: '1px solid var(--border-light)',
                  background: n.is_read ? 'transparent' : 'var(--primary-bg)',
                  opacity: n.is_read ? 0.7 : 1,
                  cursor: n.is_read ? 'default' : 'pointer',
                  transition: 'background 0.2s',
                }}
                title={n.is_read ? '' : 'Click to mark as read'}
              >
                <div style={{
                  width: 10, height: 10, marginTop: 5,
                  background: typeColor[n.notification_type] || 'var(--info)',
                  flexShrink: 0,
                  borderRadius: '50%',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
                    {!n.is_read && (
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        background: 'var(--primary)',
                        color: '#fff',
                        borderRadius: 999,
                        padding: '2px 8px',
                        flexShrink: 0,
                      }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          logs.length === 0 ? (
            <EmptyState icon={Activity} title="No activity logs" />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td>{log.user_name || 'System'}</td>
                      <td><StatusBadge status={log.action} /></td>
                      <td style={{ maxWidth: 300, fontSize: 13 }}>{log.description}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}