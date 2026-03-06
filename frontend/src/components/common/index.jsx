import React from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

// Status Badge
export function StatusBadge({ status }) {
  const map = {
    active: 'active', inactive: 'inactive', pending: 'pending',
    completed: 'completed', shipped: 'shipped', processing: 'processing',
    cancelled: 'cancelled', refunded: 'refunded', banned: 'banned',
    approved: 'active', rejected: 'cancelled', draft: 'inactive',
  };
  return (
    <span className={`badge badge-${map[status] || 'inactive'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

// Avatar
export function Avatar({ user, size = 32 }) {
  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || '?';
  if (user?.avatar) {
    return <img src={user.avatar} alt="" className="avatar" style={{ width: size, height: size }} />;
  }
  return (
    <div
      className="avatar-placeholder"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

// Loading Spinner
export function Spinner({ size = 20 }) {
  return (
    <div className="spinner" style={{ width: size, height: size }} />
  );
}

// Loading State
export function LoadingState() {
  return (
    <div className="loading-overlay">
      <Spinner size={32} />
    </div>
  );
}

// Empty State
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      {Icon && (
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--primary-bg)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', color: 'var(--primary)'
        }}>
          <Icon size={28} />
        </div>
      )}
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      {description && <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{description}</div>}
      {action}
    </div>
  );
}

// Confirmation Modal
export function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: danger ? 'var(--danger-bg)' : 'var(--primary-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            color: danger ? 'var(--danger)' : 'var(--primary)'
          }}>
            {danger ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{message}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// Pagination
export function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) pages.push(i);

  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>
      {start > 1 && <><button className="pagination-btn" onClick={() => onPageChange(1)}>1</button>{start > 2 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>}</>}
      {pages.map(p => (
        <button
          key={p}
          className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      {end < totalPages && <><span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span><button className="pagination-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button></>}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    </div>
  );
}

// Modal Wrapper
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Stats grid card
export function StatCard({ icon: Icon, label, value, badge, badgeColor }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {badge && (
        <div style={{ marginTop: 6, fontSize: 12, color: badgeColor || 'var(--success)', fontWeight: 500 }}>
          {badge}
        </div>
      )}
    </div>
  );
}