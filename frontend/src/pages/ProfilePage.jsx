import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import {
  User, Lock, ShoppingBag, MapPin,
  Camera, CheckCircle, Eye, EyeOff, Save, Package
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://ecom-426a.onrender.com/api";

/* ─── Tab definitions ────────────────────────────────────────── */
const TABS = [
  { id: "profile",  icon: User,       label: "Profile"  },
  { id: "password", icon: Lock,       label: "Password" },
  { id: "address",  icon: MapPin,     label: "Address"  },
  { id: "orders",   icon: ShoppingBag,label: "My Orders" },
];

/* ─── Shared input style ─────────────────────────────────────── */
const inputStyle = {
  width: "100%",
  padding: "10px 13px",
  border: "1px solid #e8e2db",
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "inherit",
  color: "#1a1108",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelStyle = {
  fontSize: 12.5,
  fontWeight: 600,
  color: "#4a3f35",
  marginBottom: 6,
  display: "block",
  letterSpacing: "0.01em",
};

const formGroupStyle = {
  display: "flex",
  flexDirection: "column",
  marginBottom: 20,
};

/* ─── Profile Tab ────────────────────────────────────────────── */
function ProfileTab({ user, onSaved }) {
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name:  user?.last_name  || "",
    phone:      user?.phone      || "",
  });
  const [loading, setLoading] = useState(false);
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/api/accounts/profile/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { toast.success("Profile updated"); onSaved?.(); }
      else toast.error("Could not update profile");
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  const initials = ((user?.first_name?.[0] || "") + (user?.last_name?.[0] || "")).toUpperCase() || "?";

  return (
    <form onSubmit={handleSubmit}>
      {/* Avatar section */}
      <div style={{
        display: "flex", alignItems: "center", gap: 20,
        padding: "20px 0 24px",
        borderBottom: "1px solid #f0ebe4",
        marginBottom: 24,
      }}>
        <div style={{ position: "relative" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, #c2621a, #e8894a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 800, color: "#fff",
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: 24, height: 24, borderRadius: "50%",
            background: "#1a1108", border: "2px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}>
            <Camera size={11} color="#fff" />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1108" }}>
            {user?.first_name || user?.email?.split("@")[0] || "User"}
          </div>
          <div style={{ fontSize: 13, color: "#9a8878", marginTop: 2 }}>{user?.email}</div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            marginTop: 6, padding: "2px 10px", borderRadius: 20,
            background: "#eaf5ee", color: "#2d7a4a",
            fontSize: 11, fontWeight: 700,
          }}>
            <CheckCircle size={10} />
            {user?.role || "Customer"}
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>First Name</label>
          <input
            style={inputStyle}
            value={form.first_name}
            onChange={set("first_name")}
            placeholder="First name"
            onFocus={e => { e.target.style.borderColor = "#c2621a"; e.target.style.boxShadow = "0 0 0 3px rgba(194,98,26,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#e8e2db"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Last Name</label>
          <input
            style={inputStyle}
            value={form.last_name}
            onChange={set("last_name")}
            placeholder="Last name"
            onFocus={e => { e.target.style.borderColor = "#c2621a"; e.target.style.boxShadow = "0 0 0 3px rgba(194,98,26,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#e8e2db"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Email Address</label>
        <input
          style={{ ...inputStyle, background: "#f9f8f6", color: "#9a8878", cursor: "not-allowed" }}
          value={user?.email || ""}
          disabled
        />
        <span style={{ fontSize: 11, color: "#9a8878", marginTop: 5 }}>Email cannot be changed</span>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Phone Number</label>
        <input
          style={inputStyle}
          value={form.phone}
          onChange={set("phone")}
          placeholder="+254 700 000 000"
          onFocus={e => { e.target.style.borderColor = "#c2621a"; e.target.style.boxShadow = "0 0 0 3px rgba(194,98,26,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "#e8e2db"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 22px", borderRadius: 10,
          background: loading ? "#d97c3a" : "#c2621a",
          color: "#fff", border: "none",
          fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "inherit", transition: "background 0.2s",
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#a34f12"; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#c2621a"; }}
      >
        <Save size={14} />
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

/* ─── Password Tab ───────────────────────────────────────────── */
function PasswordTab() {
  const [form, setForm] = useState({ old_password: "", new_password1: "", new_password2: "" });
  const [show, setShow]   = useState({ old: false, new1: false, new2: false });
  const [loading, setLoading] = useState(false);
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password1 !== form.new_password2) { toast.error("Passwords don't match"); return; }
    if (form.new_password1.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/api/accounts/auth/password/change/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Password updated successfully");
        setForm({ old_password: "", new_password1: "", new_password2: "" });
      } else {
        const err = await res.json();
        toast.error(Object.values(err).flat().join(", ") || "Failed to update password");
      }
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  const PasswordField = ({ label, field, showKey }) => (
    <div style={formGroupStyle}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show[showKey] ? "text" : "password"}
          style={{ ...inputStyle, paddingRight: 44 }}
          value={form[field]}
          onChange={set(field)}
          required
          onFocus={e => { e.target.style.borderColor = "#c2621a"; e.target.style.boxShadow = "0 0 0 3px rgba(194,98,26,0.1)"; }}
          onBlur={e => { e.target.style.borderColor = "#e8e2db"; e.target.style.boxShadow = "none"; }}
        />
        <button
          type="button"
          onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))}
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "#9a8878", padding: 0, display: "flex",
          }}
        >
          {show[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        padding: "14px 16px", borderRadius: 10,
        background: "#fdf8f4", border: "1px solid #f5e8d8",
        marginBottom: 24, fontSize: 13, color: "#4a3f35",
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <Lock size={14} color="#c2621a" style={{ marginTop: 2, flexShrink: 0 }} />
        <span>For your security, use a strong password with at least 8 characters including numbers and symbols.</span>
      </div>

      <PasswordField label="Current Password"    field="old_password"  showKey="old"  />
      <PasswordField label="New Password"        field="new_password1" showKey="new1" />
      <PasswordField label="Confirm New Password" field="new_password2" showKey="new2" />

      {/* Strength hint */}
      {form.new_password1 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#9a8878", marginBottom: 6 }}>Password strength</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4].map(i => {
              const score = [
                form.new_password1.length >= 8,
                /[A-Z]/.test(form.new_password1),
                /[0-9]/.test(form.new_password1),
                /[^A-Za-z0-9]/.test(form.new_password1),
              ].filter(Boolean).length;
              const colors = ["#e74c3c", "#e67e22", "#f39c12", "#27ae60"];
              return (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i <= score ? colors[score - 1] : "#e8e2db",
                  transition: "background 0.2s",
                }} />
              );
            })}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 22px", borderRadius: 10,
          background: loading ? "#d97c3a" : "#c2621a",
          color: "#fff", border: "none",
          fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "inherit", transition: "background 0.2s",
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#a34f12"; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#c2621a"; }}
      >
        <Lock size={14} />
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}

/* ─── Address Tab ────────────────────────────────────────────── */
function AddressTab({ user }) {
  const [form, setForm] = useState({
    full_name:     user?.full_name     || `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
    phone_number:  user?.phone         || "",
    address_line1: "",
    address_line2: "",
    city:          "",
    county:        "",
    postal_code:   "",
  });
  const [loading, setLoading] = useState(false);
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const focusStyle = (e) => { e.target.style.borderColor = "#c2621a"; e.target.style.boxShadow = "0 0 0 3px rgba(194,98,26,0.1)"; };
  const blurStyle  = (e) => { e.target.style.borderColor = "#e8e2db"; e.target.style.boxShadow = "none"; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/api/orders/addresses/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, is_default: true }),
      });
      if (res.ok) toast.success("Address saved");
      else toast.error("Could not save address");
    } catch { toast.error("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle} value={form.full_name} onChange={set("full_name")} placeholder="Full name" onFocus={focusStyle} onBlur={blurStyle} />
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Phone Number</label>
          <input style={inputStyle} value={form.phone_number} onChange={set("phone_number")} placeholder="+254 700 000 000" onFocus={focusStyle} onBlur={blurStyle} />
        </div>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Address Line 1</label>
        <input style={inputStyle} value={form.address_line1} onChange={set("address_line1")} placeholder="Street address, P.O. box" required onFocus={focusStyle} onBlur={blurStyle} />
      </div>
      <div style={formGroupStyle}>
        <label style={labelStyle}>Address Line 2 <span style={{ color: "#9a8878", fontWeight: 400 }}>(optional)</span></label>
        <input style={inputStyle} value={form.address_line2} onChange={set("address_line2")} placeholder="Apartment, suite, unit" onFocus={focusStyle} onBlur={blurStyle} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px" }}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>City</label>
          <input style={inputStyle} value={form.city} onChange={set("city")} placeholder="Nairobi" required onFocus={focusStyle} onBlur={blurStyle} />
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle}>County</label>
          <input style={inputStyle} value={form.county} onChange={set("county")} placeholder="Nairobi County" onFocus={focusStyle} onBlur={blurStyle} />
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Postal Code</label>
          <input style={inputStyle} value={form.postal_code} onChange={set("postal_code")} placeholder="00100" onFocus={focusStyle} onBlur={blurStyle} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 22px", borderRadius: 10,
          background: loading ? "#d97c3a" : "#c2621a",
          color: "#fff", border: "none",
          fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "inherit", transition: "background 0.2s",
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#a34f12"; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#c2621a"; }}
      >
        <MapPin size={14} />
        {loading ? "Saving..." : "Save Address"}
      </button>
    </form>
  );
}

/* ─── Status badge for orders ────────────────────────────────── */
const ORDER_STATUS = {
  pending:    { label: "Pending",    bg: "#f39c12" },
  processing: { label: "Processing", bg: "#e67e22" },
  shipped:    { label: "Shipped",    bg: "#2980b9" },
  delivered:  { label: "Delivered",  bg: "#27ae60" },
  completed:  { label: "Completed",  bg: "#27ae60" },
  cancelled:  { label: "Cancelled",  bg: "#e74c3c" },
  refunded:   { label: "Refunded",   bg: "#8e44ad" },
};

const nv  = (v) => Number(v) || 0;
const kes = (v) => `KES ${nv(v).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

const PAGE_SIZE_PROFILE = 4;

/* ─── Orders Tab — embedded, no redirect ────────────────────── */
function OrdersTab() {
  const { orders, fetchUserOrders } = useAppContext();
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchUserOrders(); }, []);

  const totalPages = Math.ceil((orders?.length || 0) / PAGE_SIZE_PROFILE);
  const paginated  = (orders || []).slice((page - 1) * PAGE_SIZE_PROFILE, page * PAGE_SIZE_PROFILE);

  if (!orders || orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "#fdf0e6", border: "1px solid #f5d9c0",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <ShoppingBag size={24} color="#c2621a" />
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1108", marginBottom: 6 }}>No orders yet</div>
        <div style={{ fontSize: 13, color: "#9a8878" }}>Your purchases will appear here.</div>
      </div>
    );
  }

  return (
    <div>
      {/* Summary row */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12, marginBottom: 20,
      }}>
        {[
          { label: "Total Orders", value: orders.length },
          { label: "Active", value: orders.filter(o => ["pending","processing","shipped"].includes(o.status?.toLowerCase())).length },
          { label: "Completed", value: orders.filter(o => ["completed","delivered"].includes(o.status?.toLowerCase())).length },
        ].map(s => (
          <div key={s.label} style={{
            padding: "12px 16px", borderRadius: 10,
            border: "1px solid #ede8e0", background: "#fdfaf7",
            display: "flex", flexDirection: "column", gap: 2,
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1108", letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#9a8878", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Orders list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {paginated.map(order => {
          const cfg = ORDER_STATUS[order.status?.toLowerCase()] || ORDER_STATUS.pending;
          const isOpen = expanded === order.id;
          const date = order.created_at
            ? new Date(order.created_at).toLocaleString("en", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
            : "—";

          return (
            <div key={order.id} style={{
              border: "1px solid #ede8e0", borderRadius: 12,
              overflow: "hidden", background: "#fff",
              transition: "box-shadow 0.2s",
            }}>
              {/* Row */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", flexWrap: "wrap",
                gap: 10, padding: "13px 16px",
                background: isOpen ? "#fdfaf7" : "#fff",
                borderBottom: isOpen ? "1px solid #f0ebe4" : "none",
                cursor: "pointer",
              }}
                onClick={() => setExpanded(isOpen ? null : order.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: "#fdf0e6", border: "1px solid #f5d9c0",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Package size={15} color="#c2621a" />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, color: "#1a1108" }}>
                      {order.order_number ?? "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "#9a8878", marginTop: 1 }}>{date}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "3px 10px", borderRadius: 20,
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                    textTransform: "uppercase", background: cfg.bg, color: "#fff",
                  }}>
                    {cfg.label}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 800, color: "#1a1108" }}>
                    {kes(order.total)}
                  </span>
                  <span style={{ fontSize: 18, color: "#9a8878", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", lineHeight: 1 }}>‹</span>
                </div>
              </div>

              {/* Expanded items */}
              {isOpen && (
                <div style={{ padding: "12px 16px" }}>
                  {(order.items || []).map((item, i) => (
                    <div key={item.id ?? i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 0",
                      borderBottom: i < (order.items.length - 1) ? "1px solid #f5f0ea" : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#c2621a", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "#1a1108" }}>{item.product_name ?? item.product ?? "—"}</span>
                        <span style={{ fontSize: 11, color: "#9a8878", background: "#f5f0ea", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>×{item.quantity}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#1a1108" }}>{kes(item.price)}</span>
                    </div>
                  ))}
                  {(!order.items || order.items.length === 0) && (
                    <div style={{ fontSize: 13, color: "#9a8878", padding: "6px 0" }}>No items</div>
                  )}
                  {nv(order.shipping_cost) > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid #f5f0ea" }}>
                      <span style={{ fontSize: 12, color: "#9a8878" }}>Shipping</span>
                      <span style={{ fontSize: 12, color: "#9a8878", fontFamily: "'DM Mono', monospace" }}>{kes(order.shipping_cost)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e8e2db", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, fontSize: 16, color: "#4a3f35" }}
          >‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${p === page ? "#c2621a" : "#e8e2db"}`,
              background: p === page ? "#c2621a" : "#fff",
              color: p === page ? "#fff" : "#4a3f35",
              fontSize: 13, fontWeight: p === page ? 700 : 500, cursor: "pointer",
            }}>{p}</button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e8e2db", background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1, fontSize: 16, color: "#4a3f35" }}
          >›</button>
        </div>
      )}
    </div>
  );
}

/* ─── Main ProfilePage ───────────────────────────────────────── */
export default function ProfilePage() {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div style={{
      maxWidth: "100%",
      padding: "36px clamp(16px, 4vw, 48px) 60px",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1108", margin: "0 0 4px", letterSpacing: "-0.03em" }}>
          Account Settings
        </h1>
        <p style={{ fontSize: 13, color: "#9a8878", margin: 0 }}>
          Manage your profile, security and preferences
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, alignItems: "start" }}>

        {/* ── Sidebar nav ── */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #ede8e0",
          padding: 12,
          boxShadow: "0 1px 4px rgba(26,17,8,0.05)",
        }}>
          {/* User summary */}
          <div style={{
            padding: "12px 10px 16px",
            borderBottom: "1px solid #f0ebe4",
            marginBottom: 8,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(135deg, #c2621a, #e8894a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0,
            }}>
              {((user?.first_name?.[0] || "") + (user?.last_name?.[0] || "")).toUpperCase() || "?"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1108", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.first_name || "User"}
              </div>
              <div style={{ fontSize: 11, color: "#9a8878", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email}
              </div>
            </div>
          </div>

          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 12px", borderRadius: 9,
                border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 13.5, fontWeight: 500,
                marginBottom: 3,
                background: activeTab === tab.id ? "#fdf0e6" : "transparent",
                color: activeTab === tab.id ? "#c2621a" : "#4a3f35",
                transition: "all 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "#faf6f2"; }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "transparent"; }}
            >
              <tab.icon size={15} />
              {tab.label}
              {activeTab === tab.id && (
                <div style={{
                  marginLeft: "auto", width: 6, height: 6,
                  borderRadius: "50%", background: "#c2621a",
                }} />
              )}
            </button>
          ))}
        </div>

        {/* ── Content card ── */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #ede8e0",
          boxShadow: "0 1px 4px rgba(26,17,8,0.05)",
          overflow: "hidden",
        }}>
          {/* Card header */}
          <div style={{
            padding: "18px 24px 16px",
            borderBottom: "1px solid #f0ebe4",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            {(() => { const t = TABS.find(t => t.id === activeTab); return t ? <t.icon size={16} color="#c2621a" /> : null; })()}
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1108", margin: 0 }}>
              {TABS.find(t => t.id === activeTab)?.label}
            </h3>
          </div>

          {/* Card body */}
          <div style={{ padding: 24 }}>
            {activeTab === "profile"  && <ProfileTab user={user} />}
            {activeTab === "password" && <PasswordTab />}
            {activeTab === "address"  && <AddressTab user={user} />}
            {activeTab === "orders"   && <OrdersTab />}
          </div>
        </div>
      </div>
    </div>
  );
}