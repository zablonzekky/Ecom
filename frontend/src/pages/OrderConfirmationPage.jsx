import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import { CheckCircle, Clock, XCircle, Download, ShoppingBag, Home } from "lucide-react";

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);

  const token = localStorage.getItem("access_token");
  const BASE = `${API_BASE_URL}/api`;

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15;

    const poll = async () => {
      try {
        const res = await fetch(`${BASE}/payments/status/${orderId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setData(json);
        setLoading(false);

        if (json.status === "completed" || json.status === "failed") {
          setPolling(false);
          return;
        }

        attempts += 1;
        if (attempts >= maxAttempts) {
          setPolling(false);
          return;
        }

        setTimeout(poll, 3000);
      } catch {
        setLoading(false);
        setPolling(false);
      }
    };

    poll();
  }, [orderId]);

  const handleDownloadReceipt = () => {
    window.open(`${BASE}/payments/receipt/${orderId}/`, "_blank");
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <p style={{ color: "#6b7280", marginTop: 16 }}>Checking payment status...</p>
        </div>
      </div>
    );
  }

  const isCompleted = data?.status === "completed";
  const isFailed = data?.status === "failed";
  const isPending = !isCompleted && !isFailed;

  return (
    <div style={styles.center}>
      <div style={styles.card}>

        {/* Icon */}
        <div style={styles.iconWrap(isCompleted ? "#dcfce7" : isFailed ? "#fee2e2" : "#fef9c3")}>
          {isCompleted
            ? <CheckCircle size={48} color="#16a34a" />
            : isFailed
            ? <XCircle size={48} color="#dc2626" />
            : <Clock size={48} color="#ca8a04" />}
        </div>

        {/* Title */}
        <h1 style={styles.title}>
          {isCompleted ? "Payment Successful!" : isFailed ? "Payment Failed" : "Payment Pending"}
        </h1>

        {/* Subtitle */}
        <p style={styles.subtitle}>
          {isCompleted
            ? "Your order has been confirmed and is being processed."
            : isFailed
            ? "Your payment could not be completed. Please try again."
            : polling
            ? "We're waiting for your payment confirmation. This may take a moment..."
            : "Payment is still being confirmed. Check your orders for the latest status."}
        </p>

        {/* Polling indicator */}
        {isPending && polling && (
          <div style={styles.pendingBar}>
            <div style={styles.dot} />
            <span style={{ fontSize: 13, color: "#92400e" }}>Waiting for M-PESA confirmation...</span>
          </div>
        )}

        {/* Order details */}
        <div style={styles.detailsBox}>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Order ID</span>
            <span style={styles.detailValue}>#{orderId}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Payment Method</span>
            <span style={styles.detailValue}>{data?.provider?.toUpperCase() ?? "—"}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Status</span>
            <span style={{
              ...styles.detailValue,
              color: isCompleted ? "#16a34a" : isFailed ? "#dc2626" : "#ca8a04",
              fontWeight: 700,
              textTransform: "capitalize",
            }}>
              {data?.status ?? "pending"}
            </span>
          </div>
          {data?.result_desc && (
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Note</span>
              <span style={styles.detailValue}>{data.result_desc}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          {isCompleted && data?.has_receipt && (
            <button style={styles.btnPrimary} onClick={handleDownloadReceipt}>
              <Download size={16} /> Download Receipt
            </button>
          )}
          <Link to="/orders" style={styles.btnOutline}>
            <ShoppingBag size={16} /> My Orders
          </Link>
          <Link to="/" style={styles.btnGhost}>
            <Home size={16} /> Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}

const styles = {
  center: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    background: "#f9fafb",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "48px 40px",
    maxWidth: 480,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  iconWrap: (bg) => ({
    width: 88,
    height: 88,
    borderRadius: "50%",
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
  }),
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 10,
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
    lineHeight: 1.6,
  },
  pendingBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "#fef3c7",
    borderRadius: 8,
    padding: "10px 16px",
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#f59e0b",
    animation: "pulse 1.5s infinite",
  },
  detailsBox: {
    background: "#f9fafb",
    borderRadius: 10,
    padding: "16px 20px",
    marginBottom: 28,
    textAlign: "left",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  detailLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "12px 20px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  btnOutline: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "12px 20px",
    fontWeight: 600,
    fontSize: 14,
    color: "#374151",
    textDecoration: "none",
  },
  btnGhost: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    padding: "12px 20px",
    fontWeight: 600,
    fontSize: 14,
    color: "#6b7280",
    textDecoration: "none",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
};