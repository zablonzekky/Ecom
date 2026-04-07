import React from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";
const STATUS_STYLES = {
  active: "bg-status-success-bg text-status-success",
  completed: "bg-status-success-bg text-status-success",
  approved: "bg-status-success-bg text-status-success",
  pending: "bg-status-warning-bg text-status-warning",
  processing: "bg-status-warning-bg text-status-warning",
  shipped: "bg-status-info-bg    text-status-info",
  info: "bg-status-info-bg    text-status-info",
  inactive: "bg-admin-border-light text-admin-muted",
  draft: "bg-admin-border-light text-admin-muted",
  refunded: "bg-admin-border-light text-admin-muted",
  cancelled: "bg-status-danger-bg  text-status-danger",
  banned: "bg-status-danger-bg  text-status-danger",
  rejected: "bg-status-danger-bg  text-status-danger",
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.inactive;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap ${style}`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

export function Avatar({ user, size = 32 }) {
  const initials =
    (
      (user?.first_name?.[0] || "") + (user?.last_name?.[0] || "")
    ).toUpperCase() || "?";
  const style = { width: size, height: size, fontSize: size * 0.38 };

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt=""
        className="rounded-full object-cover shrink-0"
        style={style}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-primary-bg text-primary flex items-center justify-center font-bold shrink-0"
      style={style}
    >
      {initials}
    </div>
  );
}
export function Spinner({ size = 24 }) {
  return (
    <div
      className="rounded-full border-2 border-admin-border border-t-primary animate-spin"
      style={{ width: size, height: size }}
    />
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-admin-muted">
      <Spinner size={32} />
      <span className="text-[13px]">Loading...</span>
    </div>
  );
}
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-primary-bg flex items-center justify-center text-primary mb-1">
          <Icon size={28} />
        </div>
      )}
      <div className="text-[15px] font-semibold text-admin-secondary">
        {title}
      </div>
      {description && (
        <div className="text-[13px] text-admin-muted">{description}</div>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
export function StatCard({ icon: Icon, label, value, badge, badgeColor }) {
  return (
    <div className="bg-white border border-admin-border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200">
      <div className="w-10 h-10 rounded-lg bg-primary-bg text-primary flex items-center justify-center mb-3">
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-gray-900 leading-tight mb-1">
        {value}
      </div>
      <div className="text-[13px] text-admin-muted font-medium">{label}</div>
      {badge && (
        <div
          className={`mt-1.5 text-[12px] font-medium ${badgeColor || "text-status-success"}`}
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-[fadeIn_0.15s_ease]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full overflow-y-auto max-h-[90vh] animate-[slideUp_0.2s_ease]"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-admin-border-light">
          <h3 className="text-[16px] font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-admin-border text-admin-muted hover:bg-status-danger-bg hover:text-status-danger hover:border-status-danger-bg transition-all"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-6">{children}</div>
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center mb-5">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-3.5 ${
              danger
                ? "bg-status-danger-bg text-status-danger"
                : "bg-primary-bg text-primary"
            }`}
          >
            {danger ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
          </div>
          <div className="text-[17px] font-bold mb-2">{title}</div>
          <div className="text-[13px] text-admin-secondary">{message}</div>
        </div>
        <div className="flex gap-2.5 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-admin-border text-admin-secondary text-[13.5px] font-semibold hover:bg-surface-2 hover:border-primary hover:text-primary transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white text-[13.5px] font-semibold transition-all ${
              danger
                ? "bg-status-danger hover:bg-red-700"
                : "bg-primary hover:bg-primary-dark"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const btnBase =
    "min-w-[32px] h-8 px-2 flex items-center justify-center rounded-md border text-[13px] transition-all cursor-pointer font-sans ";
  const btnDefault =
    "border-admin-border bg-transparent text-admin-secondary hover:bg-surface-2 hover:border-primary hover:text-primary";
  const btnActive = "border-primary bg-primary text-white font-bold";
  const btnDisabled = "opacity-40 cursor-not-allowed";

  return (
    <div className="flex items-center justify-end gap-1 px-4 py-3.5 border-t border-admin-border-light">
      <button
        className={btnBase + (currentPage === 1 ? btnDisabled : btnDefault)}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>

      {start > 1 && (
        <>
          <button
            className={btnBase + btnDefault}
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {start > 2 && <span className="px-1 text-admin-muted">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={btnBase + (p === currentPage ? btnActive : btnDefault)}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1 text-admin-muted">…</span>
          )}
          <button
            className={btnBase + btnDefault}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className={
          btnBase + (currentPage === totalPages ? btnDisabled : btnDefault)
        }
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    </div>
  );
}
