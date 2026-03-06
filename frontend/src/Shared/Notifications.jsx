import React, { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, Trash2, Tag, Bell, Activity } from 'lucide-react';
import { reviewService, discountService, notificationService } from '../services';
import { StatusBadge, LoadingState, Pagination, Modal, ConfirmModal, EmptyState } from '../components/common';
import toast from 'react-hot-toast';
// ===================== NOTIFICATIONS PAGE =====================
export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        if (activeTab === 'notifications') {
          const { data } = await notificationService.list();
          setNotifications(data.results || data || []);
        } else {
          const { data } = await notificationService.activityLogs();
          setLogs(data.results || data || []);
        }
      } catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [activeTab]);

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications(n => n.map(x => ({ ...x, is_read: true })));
  };

  const typeColor = { info: 'var(--info)', success: 'var(--success)', warning: 'var(--warning)', error: 'var(--danger)' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        {activeTab === 'notifications' && (
          <button className="btn btn-outline" onClick={markAllRead}>Mark All Read</button>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        {['notifications', 'activity'].map(tab => (
          <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab(tab)}>
            {tab === 'notifications' ? <><Bell size={15} /> Notifications</> : <><Activity size={15} /> Activity Log</>}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <LoadingState /> : activeTab === 'notifications' ? (
          notifications.length === 0
            ? <EmptyState icon={Bell} title="No notifications" />
            : notifications.map(n => (
              <div key={n.id} style={{
                display: 'flex', gap: 14, padding: '14px 20px',
                borderBottom: '1px solid var(--border-light)',
                background: n.is_read ? 'transparent' : 'var(--primary-bg)',
                opacity: n.is_read ? 0.7 : 1,
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50', marginTop: 5,
                  background: typeColor[n.notification_type] || 'var(--info)', flexShrink: 0,
                  borderRadius: '50%',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))
        ) : (
          logs.length === 0
            ? <EmptyState icon={Activity} title="No activity logs" />
            : <div className="table-container">
              <table>
                <thead>
                  <tr><th>User</th><th>Action</th><th>Description</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td>{log.user_name || 'System'}</td>
                      <td><StatusBadge status={log.action} /></td>
                      <td style={{ maxWidth: 300, fontSize: 13 }}>{log.description}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  );
}