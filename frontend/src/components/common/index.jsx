import React from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";
const BADGE_STYLES = {
  active: { background: "#27ae60" },
  completed: { background: "#27ae60" },
  approved: { background: "#27ae60" },
  delivered: { background: "#27ae60" },
  pending: { background: "#f39c12" },
  processing: { background: "#e67e22" },
  shipped: { background: "#2980b9" },
  info: { background: "#2980b9" },
  refunded: { background: "#8e44ad" },
  draft: { background: "#95a5a6" },
  inactive: { background: "#95a5a6" },
  cancelled: { background: "#e74c3c" },
  banned: { background: "#e74c3c" },
  rejected: { background: "#e74c3c" },
};

export function StatusBadge({ status }) {
  const key = status?.toLowerCase() || "inactive";
  const s = BADGE_STYLES[key] || BADGE_STYLES.inactive;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: s.background,
        color: "#ffffff",
        lineHeight: 1.5,
      }}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "—"}
    </span>
  );
}
export function Avatar({ user, size = 32 }) {
  const initials =
    (
      (user?.first_name?.[0] || "") + (user?.last_name?.[0] || "")
    ).toUpperCase() || "?";
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt=""
        className="avatar"
        style={{ width: size, height: size }}
      />
    );
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
export function Spinner({ size = 20 }) {
  return <div className="spinner" style={{ width: size, height: size }} />;
}
export function LoadingState() {
  return (
    <div className="loading-overlay">
      <Spinner size={32} />
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
        Loading...
      </span>
    </div>
  );
}
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      {Icon && (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--primary-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "var(--primary)",
          }}
        >
          <Icon size={28} />
        </div>
      )}
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
        {title}
      </div>
      {description && (
        <div
          style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}
        >
          {description}
        </div>
      )}
      {action}
    </div>
  );
}
export function StatCard({ icon: Icon, label, value, badge, badgeColor }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {badge && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: badgeColor || "var(--success)",
            fontWeight: 500,
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,17,8,0.5)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn 0.15s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "slideUp 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--danger-bg)";
              e.currentTarget.style.color = "var(--danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,17,8,0.5)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          width: "100%",
          maxWidth: 400,
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: danger ? "var(--danger-bg)" : "var(--primary-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              color: danger ? "var(--danger)" : "var(--primary)",
            }}
          >
            {danger ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            {message}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
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

      {start > 1 && (
        <>
          <button className="pagination-btn" onClick={() => onPageChange(1)}>
            1
          </button>
          {start > 2 && (
            <span style={{ padding: "0 4px", color: "var(--text-muted)" }}>
              …
            </span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`pagination-btn ${p === currentPage ? "active" : ""}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          <span style={{ padding: "0 4px", color: "var(--text-muted)" }}>
            …
          </span>
          <button
            className="pagination-btn"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

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
