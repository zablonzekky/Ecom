import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, ExternalLink } from 'lucide-react';
import { LoadingState, EmptyState, Pagination, ConfirmModal, Avatar } from '../../components/common';
import toast from 'react-hot-toast';

// Adjust this import path to wherever your axios instance / service lives
import api from '../../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ── provider badge colours ────────────────────────────────────────────────────
const PROVIDER_STYLE = {
  google: { bg: '#fce8e6', color: '#c5221f', label: 'Google' },
  facebook: { bg: '#e7f0ff', color: '#1877f2', label: 'Facebook' },
  twitter: { bg: '#e8f5fe', color: '#1da1f2', label: 'Twitter' },
  github: { bg: '#f0f0f0', color: '#24292e', label: 'GitHub' },
};

const providerStyle = (p) =>
  PROVIDER_STYLE[p?.toLowerCase()] || { bg: 'var(--surface-2)', color: 'var(--text-primary)', label: p };

function ProviderBadge({ provider }) {
  const s = providerStyle(provider);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

// ── service helpers ───────────────────────────────────────────────────────────
// These call Django-allauth's REST endpoints that expose social accounts.
// Adjust the URLs to match whatever your backend exposes.
const socialAccountService = {
  list: (params) => api.get('/api/admin/social-accounts/', { params }),
  delete: (id)   => api.delete(`/api/admin/social-accounts/${id}/`),
};

// ── main component ────────────────────────────────────────────────────────────
export default function SocialAccountsPage() {
  const [accounts,    setAccounts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [provider,    setProvider]    = useState('');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 15 };
      if (search)   params.search   = search;
      if (provider) params.provider = provider;
      const { data } = await socialAccountService.list(params);
      setAccounts(data.results || data || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.count       || 0);
    } catch {
      toast.error('Failed to load social accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, provider]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleDelete = async () => {
    try {
      await socialAccountService.delete(deleteTarget.id);
      toast.success('Social account disconnected');
      setDeleteTarget(null);
      fetchAccounts();
    } catch {
      toast.error('Error disconnecting account');
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Social Accounts</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Users who signed in via Google, Facebook, or other OAuth providers
            {totalCount > 0 && ` · ${totalCount} total`}
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 16px', borderRadius: 10, marginBottom: 20,
        background: 'var(--primary-bg, #fdf3e7)',
        border: '1px solid var(--primary-border, #f5cfa0)',
        fontSize: 13, color: 'var(--text-secondary)',
      }}>
        <span style={{ fontSize: 16 }}>ℹ️</span>
        <div>
          These accounts are managed by <strong>django-allauth</strong>. You can view and
          disconnect them here. Disconnecting removes the OAuth link — the user's account
          itself is not deleted. To manage individual users, visit the{' '}
          <a href="/admin/users" style={{ color: 'var(--primary)' }}>Users page</a>.
        </div>
      </div>

      {/* Table card */}
      <div className="card">
        {/* Filters */}
        <div className="filter-bar">
          <div className="search-box" style={{ maxWidth: 280 }}>
            <Search size={15} className="search-icon" />
            <input
              className="form-control"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: 34 }}
            />
          </div>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={provider}
            onChange={e => { setProvider(e.target.value); setPage(1); }}
          >
            <option value="">All Providers</option>
            <option value="google">Google</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
            <option value="github">GitHub</option>
          </select>
        </div>

        {loading ? (
          <LoadingState />
        ) : accounts.length === 0 ? (
          <EmptyState
            icon={ExternalLink}
            title="No social accounts"
            description={
              search || provider
                ? 'No accounts match your filters'
                : 'No users have signed in via social OAuth yet'
            }
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Provider</th>
                  <th>Provider UID</th>
                  <th>Connected On</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(account => (
                  <tr key={account.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Try to show the user's social avatar */}
                        {account.extra_data?.picture || account.extra_data?.avatar_url ? (
                          <img
                            src={account.extra_data.picture || account.extra_data.avatar_url}
                            alt=""
                            style={{
                              width: 30, height: 30, borderRadius: '50%',
                              objectFit: 'cover', flexShrink: 0,
                            }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Avatar user={account.user} size={30} />
                        )}
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>
                            {account.user?.full_name ||
                             account.user?.get_full_name ||
                             `${account.user?.first_name || ''} ${account.user?.last_name || ''}`.trim() ||
                             account.extra_data?.name ||
                             '—'}
                          </div>
                          {account.user?.username && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              @{account.user.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {account.user?.email || account.extra_data?.email || '—'}
                    </td>
                    <td>
                      <ProviderBadge provider={account.provider} />
                    </td>
                    <td style={{
                      fontFamily: 'DM Mono, monospace', fontSize: 11,
                      color: 'var(--text-muted)', maxWidth: 160,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {account.uid || '—'}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {formatDate(account.date_joined || account.created_at)}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {formatDate(account.user?.last_login)}
                    </td>
                    <td>
                      <button
                        className="btn-icon"
                        title="Disconnect social account"
                        onClick={() => setDeleteTarget(account)}
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Confirm disconnect */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Disconnect Social Account"
        message={`Disconnect the ${deleteTarget?.provider} account for ${
          deleteTarget?.user?.full_name || deleteTarget?.user?.email || 'this user'
        }? Their account will remain but they won't be able to log in via ${deleteTarget?.provider} until they reconnect.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
