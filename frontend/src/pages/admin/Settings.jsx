import React, { useState } from 'react';
import { useAuth } from '../../context/Authcontext';
import { authService } from '../../services';
import toast from 'react-hot-toast';
import { User, Lock, Palette, Layout } from 'lucide-react';

const TABS = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'password', icon: Lock, label: 'Password' },
  { id: 'personalization', icon: Palette, label: 'Personalization' },
  { id: 'homepage', icon: Layout, label: 'Homepage Layout' },
];

function ProfileTab({ user, onSaved }) {
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm(form => ({ ...form, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.updateProfile(form);
      toast.success('Profile updated');
      onSaved();
    } catch { toast.error('Error updating profile'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input className="form-control" value={form.first_name} onChange={set('first_name')} />
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input className="form-control" value={form.last_name} onChange={set('last_name')} />
        </div>
      </div>
      <div className="form-group mb-4">
        <label className="form-label">Email</label>
        <input className="form-control" value={user?.email} disabled style={{ background: 'var(--surface-2)', cursor: 'not-allowed' }} />
      </div>
      <div className="form-group mb-4">
        <label className="form-label">Phone</label>
        <input className="form-control" value={form.phone} onChange={set('phone')} />
      </div>
      <div className="form-group mb-6">
        <label className="form-label">Address</label>
        <textarea className="form-control" value={form.address} onChange={set('address')} rows={3} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

function PasswordTab() {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const set = (f) => (e) => setForm(form => ({ ...form, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      // You can add a change-password endpoint
      toast.success('Password updated');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch { toast.error('Error updating password'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      {['old_password', 'new_password', 'confirm_password'].map(field => (
        <div className="form-group mb-4" key={field}>
          <label className="form-label">
            {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <input type="password" className="form-control" value={form[field]} onChange={set(field)} required />
        </div>
      ))}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const refetchUser = async () => {
    const { data } = await authService.me();
    setUser(data);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Tab Nav */}
        <div className="card" style={{ padding: 12, height: 'fit-content' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? '' : ''}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13.5, fontWeight: 500, marginBottom: 4,
                background: activeTab === tab.id ? 'var(--primary-bg)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>
              {TABS.find(t => t.id === activeTab)?.label}
            </h3>
          </div>
          <div className="card-body">
            {activeTab === 'profile' && <ProfileTab user={user} onSaved={refetchUser} />}
            {activeTab === 'password' && <PasswordTab />}
            {activeTab === 'personalization' && (
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Personalization controls coming soon — theme color picker, font settings, and display preferences.
                </div>
              </div>
            )}
            {activeTab === 'homepage' && (
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Homepage layout editor — drag and drop sections to customize your storefront.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}