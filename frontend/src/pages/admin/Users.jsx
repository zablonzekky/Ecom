import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Pencil, Trash2, Clock } from 'lucide-react';
import { userService } from '../../services';
import {
  StatusBadge, Avatar, LoadingState, ConfirmModal,
  Pagination, Modal, StatCard, EmptyState
} from '../../components/common';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';

const ROLES = ['', 'admin', 'editor', 'customer'];
const STATUSES = ['', 'active', 'inactive', 'pending', 'banned'];

function UserForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial || {
    email: '', first_name: '', last_name: '',
    role: 'customer', status: 'active', phone: '', address: '',
    password: '', confirm_password: ''
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input className="form-control" value={form.first_name} onChange={set('first_name')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input className="form-control" value={form.last_name} onChange={set('last_name')} required />
        </div>
      </div>
      <div className="form-group mb-4">
        <label className="form-label">Email</label>
        <input type="email" className="form-control" value={form.email} onChange={set('email')} required />
      </div>
      {!initial && (
        <div className="grid-2 mb-4">
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={form.password} onChange={set('password')} required={!initial} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-control" value={form.confirm_password} onChange={set('confirm_password')} required={!initial} />
          </div>
        </div>
      )}
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-control" value={form.role} onChange={set('role')}>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>
      <div className="form-group mb-4">
        <label className="form-label">Phone</label>
        <input className="form-control" value={form.phone} onChange={set('phone')} />
      </div>
      <div className="form-group mb-4">
        <label className="form-label">Address</label>
        <textarea className="form-control" value={form.address} onChange={set('address')} rows={2} />
      </div>
      <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : (initial ? 'Update User' : 'Create User')}
        </button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await userService.list(params);
      setUsers(data.results || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.count || 0);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    userService.stats().then(r => setStats(r.data)).catch(() => {});
    userService.recentActivity().then(r => setActivity(r.data)).catch(() => {});
  }, []);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await userService.create(form);
      toast.success('User created');
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      const msg = Object.values(err.response?.data || {}).flat().join(', ') || 'Error creating user';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      await userService.update(editUser.id, form);
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch {
      toast.error('Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await userService.delete(deleteTarget.id);
      toast.success('User deleted');
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error('Error deleting user');
    }
  };

  const formatTime = (dt) => {
    if (!dt) return 'Never';
    const d = new Date(dt);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
      {/* Main Column */}
      <div>
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <UserPlus size={16} /> Add New User
          </button>
        </div>

        {/* Stats */}
        <div className="grid-3 mb-6">
          <div className="stat-card">
            <div className="stat-icon"><Users size={20} /></div>
            <div className="stat-value">{stats.total_users?.toLocaleString() || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Users size={20} /></div>
            <div className="stat-value">{stats.active_users?.toLocaleString() || 0}</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><UserPlus size={20} /></div>
            <div className="stat-value">{stats.new_today || 0}</div>
            <div className="stat-label">New Users Today</div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="filter-bar">
            <div className="search-box" style={{ maxWidth: 260 }}>
              <Search size={15} className="search-icon" />
              <input
                className="form-control"
                placeholder="Search..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: 34 }}
              />
            </div>
            <select className="form-control" style={{ width: 'auto' }} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="">Role Filter</option>
              {ROLES.filter(Boolean).map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">Status Filter</option>
              {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>

          {loading ? <LoadingState /> : users.length === 0 ? (
            <EmptyState icon={Users} title="No users found" description="Try adjusting your filters" />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th><input type="checkbox" /></th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td><input type="checkbox" /></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar user={user} size={30} />
                          <span style={{ fontWeight: 500 }}>{user.full_name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                      <td><StatusBadge status={user.status} /></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatTime(user.last_login)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-icon" onClick={() => setEditUser(user)} title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button className="btn-icon" onClick={() => setDeleteTarget(user)} title="Delete"
                            style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Activity Feed */}
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 14, fontWeight: 600 }}>Recent Activity Feed</h3></div>
          <div className="card-body" style={{ paddingTop: 12 }}>
            {activity.length === 0
              ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent activity</div>
              : activity.slice(0, 6).map(log => (
                <div key={log.id} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <div className="avatar-placeholder" style={{ width: 28, height: 28, fontSize: 11, flexShrink: 0 }}>
                    {log.user_name?.[0] || 'S'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{log.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(log.created_at)}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 14, fontWeight: 600 }}>Quick Stats</h3></div>
          <div className="card-body" style={{ paddingTop: 12 }}>
            {[
              { icon: Clock, label: 'Recent logins', value: stats.total_users || 0 },
              { icon: UserPlus, label: 'New today', value: stats.new_today || 0 },
              { icon: Clock, label: 'Active sessions', value: stats.active_users || 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div className="stat-icon" style={{ width: 36, height: 36, marginBottom: 0, borderRadius: 8 }}>
                  <Icon size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{value?.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New User" width={560}>
        <UserForm onSubmit={handleCreate} onClose={() => setModalOpen(false)} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User" width={560}>
        {editUser && (
          <UserForm
            initial={editUser}
            onSubmit={handleUpdate}
            onClose={() => setEditUser(null)}
            loading={saving}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.full_name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}