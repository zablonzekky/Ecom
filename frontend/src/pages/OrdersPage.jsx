import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  ShoppingBag, Package, Clock, CheckCircle, XCircle,
  Truck, RefreshCw, ChevronLeft, ChevronRight,
  MapPin, Calendar, Hash, ArrowRight
} from "lucide-react";

/* ─── Constants ─────────────────────────────────────────────── */
const PAGE_SIZE = 5;

const STATUS_CONFIG = {
  pending:    { label: "Pending",    icon: Clock,       bg: "#f39c12" },
  processing: { label: "Processing", icon: RefreshCw,   bg: "#e67e22" },
  shipped:    { label: "Shipped",    icon: Truck,       bg: "#2980b9" },
  delivered:  { label: "Delivered",  icon: CheckCircle, bg: "#27ae60" },
  completed:  { label: "Completed",  icon: CheckCircle, bg: "#27ae60" },
  cancelled:  { label: "Cancelled",  icon: XCircle,     bg: "#e74c3c" },
  refunded:   { label: "Refunded",   icon: RefreshCw,   bg: "#8e44ad" },
};

const n   = (v) => Number(v) || 0;
const kes = (v) => `KES ${n(v).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

/* ─── Status Badge ───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 20,
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase",
      background: cfg.bg, color: "#fff",
      whiteSpace: "nowrap",
    }}>
      <Icon size={10} strokeWidth={3} />
      {cfg.label}
    </span>
  );
}

/* ─── Summary Stat Card ──────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      border: "1px solid #ede8e0",
      padding: "18px 20px",
      display: "flex", alignItems: "center", gap: 14,
      boxShadow: "0 1px 4px rgba(26,17,8,0.05)",
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,17,8,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(26,17,8,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${accent}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={20} color={accent} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1108", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{value}</div>
        <div style={{ fontSize: 12, color: "#9a8878", marginTop: 3, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

/* ─── Order Card ─────────────────────────────────────────────── */
function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const items = order.items || [];
  const date = order.created_at
    ? new Date(order.created_at).toLocaleString("en", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

  const addr = order.address;
  const addrLine = addr
    ? `${addr.address_line1}${addr.city ? ", " + addr.city : ""}`
    : null;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #ede8e0",
      boxShadow: "0 1px 4px rgba(26,17,8,0.05)",
      overflow: "hidden",
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(26,17,8,0.09)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(26,17,8,0.05)"}
    >
      {/* ── Header ── */}
      <div style={{
        display: "flex", flexWrap: "wrap",
        alignItems: "center", justifyContent: "space-between",
        gap: 12, padding: "16px 20px",
        borderBottom: expanded ? "1px solid #f5f0ea" : "none",
        background: "#fdfaf7",
      }}>
        {/* Left — order number + date */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "#fdf0e6", border: "1px solid #f5d9c0",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Package size={17} color="#c2621a" />
          </div>
          <div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 13, fontWeight: 700, color: "#1a1108",
              letterSpacing: "0.02em",
            }}>
              {order.order_number ?? "—"}
            </div>
            <div style={{ fontSize: 11, color: "#9a8878", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={10} />
              {date}
            </div>
          </div>
        </div>

        {/* Right — status + total + expand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <StatusBadge status={order.status} />
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 15, fontWeight: 800, color: "#1a1108",
            letterSpacing: "-0.02em",
          }}>
            {kes(order.total)}
          </div>
          <button
            onClick={() => setExpanded(p => !p)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 12px", borderRadius: 8,
              border: "1px solid #e8e2db",
              background: expanded ? "#fdf0e6" : "#fff",
              color: expanded ? "#c2621a" : "#4a3f35",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#c2621a"; e.currentTarget.style.color = "#c2621a"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e2db"; e.currentTarget.style.color = expanded ? "#c2621a" : "#4a3f35"; }}
          >
            {expanded ? "Hide" : "Details"}
            <ArrowRight size={11} style={{ transform: expanded ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }} />
          </button>
        </div>
      </div>

      {/* ── Expandable details ── */}
      {expanded && (
        <div style={{ padding: "0 20px 20px" }}>

          {/* Items */}
          <div style={{ marginTop: 16, marginBottom: addrLine ? 16 : 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9a8878", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              Items
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {items.map((item, i) => (
                <div key={item.id ?? i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "9px 0",
                  borderBottom: i < items.length - 1 ? "1px solid #f5f0ea" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#c2621a", flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 13, color: "#1a1108", fontWeight: 500 }}>
                      {item.product_name ?? item.product ?? "—"}
                    </span>
                    <span style={{
                      fontSize: 11, color: "#9a8878",
                      background: "#f5f0ea", borderRadius: 4,
                      padding: "1px 6px", fontWeight: 600,
                    }}>
                      ×{item.quantity}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1108", fontFamily: "'DM Mono', monospace" }}>
                    {kes(item.price)}
                  </span>
                </div>
              ))}
              {items.length === 0 && (
                <div style={{ padding: "10px 0", fontSize: 13, color: "#9a8878" }}>No items</div>
              )}
            </div>
          </div>

          {/* Delivery address */}
          {addrLine && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px", borderRadius: 10,
              background: "#fdf8f4", border: "1px solid #f5e8d8",
            }}>
              <MapPin size={13} color="#c2621a" />
              <span style={{ fontSize: 12, color: "#4a3f35", fontWeight: 500 }}>{addrLine}</span>
            </div>
          )}

          {/* Totals row */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 14, paddingTop: 14, borderTop: "1px solid #f5f0ea",
          }}>
            <div style={{ fontSize: 12, color: "#9a8878" }}>
              {items.length} {items.length === 1 ? "item" : "items"}
              {n(order.shipping_cost) > 0 && (
                <span style={{ marginLeft: 10 }}>
                  + {kes(order.shipping_cost)} shipping
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 12, color: "#9a8878" }}>Total</span>
              <span style={{
                fontSize: 17, fontWeight: 800, color: "#1a1108",
                fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em",
              }}>
                {kes(order.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────────────── */
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  const pages = [];
  const start = Math.max(1, current - 2);
  const end   = Math.min(total, current + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const btnStyle = (active) => ({
    minWidth: 34, height: 34, borderRadius: 8,
    border: `1px solid ${active ? "#c2621a" : "#e8e2db"}`,
    background: active ? "#c2621a" : "#fff",
    color: active ? "#fff" : "#4a3f35",
    fontSize: 13, fontWeight: active ? 700 : 500,
    cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center",
    transition: "all 0.15s", padding: "0 8px",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 28 }}>
      <button
        style={{ ...btnStyle(false), opacity: current === 1 ? 0.4 : 1 }}
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
      >
        <ChevronLeft size={15} />
      </button>

      {start > 1 && (
        <>
          <button style={btnStyle(false)} onClick={() => onChange(1)}>1</button>
          {start > 2 && <span style={{ color: "#9a8878", padding: "0 2px" }}>…</span>}
        </>
      )}

      {pages.map(p => (
        <button key={p} style={btnStyle(p === current)} onClick={() => onChange(p)}>{p}</button>
      ))}

      {end < total && (
        <>
          {end < total - 1 && <span style={{ color: "#9a8878", padding: "0 2px" }}>…</span>}
          <button style={btnStyle(false)} onClick={() => onChange(total)}>{total}</button>
        </>
      )}

      <button
        style={{ ...btnStyle(false), opacity: current === total ? 0.4 : 1 }}
        onClick={() => onChange(current + 1)}
        disabled={current === total}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

/* ─── Filter Tab ─────────────────────────────────────────────── */
function FilterTab({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px", borderRadius: 8,
        border: `1px solid ${active ? "#c2621a" : "#e8e2db"}`,
        background: active ? "#fdf0e6" : "#fff",
        color: active ? "#c2621a" : "#4a3f35",
        fontSize: 13, fontWeight: active ? 700 : 500,
        cursor: "pointer", display: "flex",
        alignItems: "center", gap: 6,
        transition: "all 0.15s", whiteSpace: "nowrap",
      }}
    >
      {label}
      {count > 0 && (
        <span style={{
          background: active ? "#c2621a" : "#e8e2db",
          color: active ? "#fff" : "#4a3f35",
          borderRadius: 10, fontSize: 10,
          fontWeight: 700, padding: "1px 6px",
          minWidth: 18, textAlign: "center",
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function OrdersPage() {
  const { orders, fetchUserOrders } = useAppContext();
  const [page, setPage]           = useState(1);
  const [filter, setFilter]       = useState("all");

  useEffect(() => { fetchUserOrders(); }, []);
  useEffect(() => { setPage(1); }, [filter]);

  const totalSpend   = orders.reduce((sum, o) => sum + n(o.total), 0);
  const activeOrders = orders.filter(o => ["pending", "processing", "shipped"].includes(o.status?.toLowerCase()));

  const FILTERS = [
    { key: "all",        label: "All Orders" },
    { key: "active",     label: "Active",     statuses: ["pending", "processing", "shipped"] },
    { key: "completed",  label: "Completed",  statuses: ["completed", "delivered"] },
    { key: "cancelled",  label: "Cancelled",  statuses: ["cancelled", "refunded"] },
  ];

  const filtered = filter === "all"
    ? orders
    : orders.filter(o => {
        const cfg = FILTERS.find(f => f.key === filter);
        return cfg?.statuses?.includes(o.status?.toLowerCase());
      });

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{
      maxWidth: 780, margin: "0 auto",
      padding: "36px 16px 60px",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "#fdf0e6", border: "1px solid #f5d9c0",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ShoppingBag size={18} color="#c2621a" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1108", margin: 0, letterSpacing: "-0.03em" }}>
            My Orders
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "#9a8878", margin: 0, paddingLeft: 48 }}>
          Track and manage all your purchases
        </p>
      </div>

      {/* ── Stats ── */}
      {orders.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14, marginBottom: 28,
        }}>
          <StatCard icon={ShoppingBag} label="Total Orders"  value={orders.length}         accent="#c2621a" />
          <StatCard icon={Truck}       label="Active"        value={activeOrders.length}    accent="#2980b9" />
          <StatCard icon={CheckCircle} label="Total Spend"   value={`KES ${n(totalSpend).toLocaleString()}`} accent="#27ae60" />
        </div>
      )}

      {/* ── Filter tabs ── */}
      {orders.length > 0 && (
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap",
          marginBottom: 20,
        }}>
          {FILTERS.map(f => {
            const count = f.key === "all"
              ? orders.length
              : orders.filter(o => f.statuses?.includes(o.status?.toLowerCase())).length;
            return (
              <FilterTab
                key={f.key}
                label={f.label}
                count={f.key === "all" ? 0 : count}
                active={filter === f.key}
                onClick={() => setFilter(f.key)}
              />
            );
          })}
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#9a8878", alignSelf: "center" }}>
            {filtered.length} {filtered.length === 1 ? "order" : "orders"}
          </div>
        </div>
      )}

      {/* ── Orders list ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {paginated.length > 0
          ? paginated.map(order => <OrderCard key={order.id} order={order} />)
          : (
            <div style={{
              background: "#fff", border: "1px solid #ede8e0",
              borderRadius: 16, padding: "56px 24px",
              textAlign: "center",
              boxShadow: "0 1px 4px rgba(26,17,8,0.04)",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "#fdf0e6", border: "1px solid #f5d9c0",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <ShoppingBag size={24} color="#c2621a" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1108", marginBottom: 6 }}>
                {filter === "all" ? "No orders yet" : `No ${filter} orders`}
              </div>
              <div style={{ fontSize: 13, color: "#9a8878" }}>
                {filter === "all"
                  ? "Your purchases will appear here once you place an order."
                  : "Try a different filter to see your orders."}
              </div>
            </div>
          )
        }
      </div>

      {/* ── Pagination ── */}
      <Pagination current={page} total={totalPages} onChange={setPage} />

    </div>
  );
}