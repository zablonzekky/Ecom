import React, { useEffect, useState, useCallback } from "react";

import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart2, Tag, Bell,
  Settings, LogOut, Search, Menu, X, ChevronDown, ChevronRight, TrendingUp,
  TrendingDown, DollarSign, ShoppingBag, Star, AlertCircle, CheckCircle,
  Clock, Truck, RefreshCw, Eye, Edit2, Trash2, Plus, Filter, Download,
  Upload, Image, ToggleLeft, ToggleRight, Megaphone, MessageSquare,
  Activity, Shield, Globe, Palette, Layout, Navigation, Sliders, ArrowUpRight,
  ArrowDownRight, MoreHorizontal, ChevronLeft, Home, Layers, Percent,
  CreditCard, MapPin, Phone, Mail, Calendar, Hash, Zap, AlertTriangle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const API_BASE_URL = (typeof window !== "undefined" && window.__API_BASE_URL__) || "/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const fmt = (n) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` :
  n >= 1_000    ? `$${(n / 1_000).toFixed(1)}K` : `$${n}`;

const statusColor = {
  pending:    "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-red-100 text-red-700",
  refunded:   "bg-gray-100 text-gray-600",
};

const roleColor = {
  admin:    "bg-rose-100 text-rose-700",
  manager:  "bg-indigo-100 text-indigo-700",
  customer: "bg-slate-100 text-slate-600",
};

// ─── Mock / seed data (used when API isn't reachable) ──────────────────────
const MOCK_STATS = {
  total_revenue: 284500, total_orders: 1243, total_users: 8741,
  total_products: 312, pending_orders: 87, refunds_today: 4,
};

const MOCK_REVENUE = [
  { month: "Jan", revenue: 32000, orders: 210 },
  { month: "Feb", revenue: 28500, orders: 195 },
  { month: "Mar", revenue: 41000, orders: 278 },
  { month: "Apr", revenue: 38200, orders: 260 },
  { month: "May", revenue: 52000, orders: 341 },
  { month: "Jun", revenue: 47800, orders: 315 },
  { month: "Jul", revenue: 61200, orders: 404 },
];

const MOCK_CATEGORIES = [
  { name: "Electronics", value: 38 },
  { name: "Clothing", value: 27 },
  { name: "Home & Garden", value: 18 },
  { name: "Sports", value: 11 },
  { name: "Other", value: 6 },
];

const CAT_COLORS = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#64748b"];

const MOCK_PRODUCTS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: ["Wireless Headphones Pro", "Running Shoes Elite", "Smart Watch Series 5",
    "Yoga Mat Premium", "Coffee Maker Deluxe", "Laptop Stand Adjustable",
    "Bluetooth Speaker Portable", "Gaming Mouse RGB", "Desk Lamp LED",
    "Backpack Travel Pro", "Water Bottle Insulated", "Mechanical Keyboard"][i],
  category: ["Electronics", "Clothing", "Electronics", "Sports", "Home & Garden",
    "Electronics", "Electronics", "Electronics", "Home & Garden", "Clothing",
    "Sports", "Electronics"][i],
  price: [129.99, 89.99, 299.99, 45.99, 79.99, 59.99, 69.99, 49.99, 35.99, 79.99, 29.99, 149.99][i],
  stock: [42, 0, 15, 88, 23, 67, 34, 19, 104, 56, 201, 8][i],
  is_active: [true, false, true, true, true, true, true, false, true, true, true, true][i],
  sales: [312, 89, 204, 156, 98, 445, 278, 301, 122, 187, 534, 67][i],
}));

const MOCK_ORDERS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  order_number: `ORD-${10234 + i}`,
  user_name: ["Alice Johnson", "Bob Smith", "Carol White", "David Brown",
    "Eve Davis", "Frank Wilson", "Grace Lee", "Henry Martin",
    "Iris Clark", "Jack Turner"][i],
  total: [149.99, 89.50, 320.00, 55.99, 205.00, 78.49, 430.00, 99.99, 175.50, 62.00][i],
  status: ["delivered", "shipped", "processing", "pending", "delivered",
    "cancelled", "processing", "shipped", "pending", "delivered"][i],
  date: `2025-07-${String(i + 1).padStart(2, "0")}`,
  items: i + 1,
}));

const MOCK_USERS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  username: ["alice_j", "bobsmith", "carol_w", "david_b", "eve_d", "frank_w", "grace_l", "henry_m"][i],
  email: [`user${i + 1}@example.com`],
  role: ["customer", "customer", "manager", "customer", "admin", "customer", "manager", "customer"][i],
  joined: `2024-${String((i % 12) + 1).padStart(2, "0")}-15`,
  orders: [12, 3, 8, 1, 0, 7, 5, 2][i],
  is_active: [true, true, true, false, true, true, true, true][i],
}));

const MOCK_ACTIVITY = [
  { id: 1, type: "order",   msg: "New order #ORD-10244 placed",            time: "2m ago",  icon: ShoppingCart, color: "text-blue-500" },
  { id: 2, type: "user",    msg: "New user grace_l registered",            time: "15m ago", icon: Users,        color: "text-emerald-500" },
  { id: 3, type: "product", msg: 'Product "Running Shoes Elite" restocked',time: "1h ago",  icon: Package,      color: "text-amber-500" },
  { id: 4, type: "refund",  msg: "Refund processed for ORD-10198",         time: "2h ago",  icon: CreditCard,   color: "text-rose-500" },
  { id: 5, type: "review",  msg: "New 5★ review on Wireless Headphones",   time: "3h ago",  icon: Star,         color: "text-yellow-500" },
  { id: 6, type: "promo",   msg: 'Campaign "Summer Sale" went live',       time: "5h ago",  icon: Megaphone,    color: "text-purple-500" },
];

// ─── Sub-components ────────────────────────────────────────────────────────

// Stat card
function StatCard({ label, value, delta, icon: Icon, color, prefix = "" }) {
  const up = delta >= 0;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800">{prefix}{typeof value === "number" && value > 999 ? value.toLocaleString() : value}</div>
      {delta !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600" : "text-rose-500"}`}>
          {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(delta)}% vs last month
        </div>
      )}
    </div>
  );
}

// Badge
function Badge({ label, color }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{label}</span>;
}

// Modal
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Section components ────────────────────────────────────────────────────

function OverviewSection({ stats, revenue, categories }) {
  const cards = [
    { label: "Total Revenue", value: stats?.total_revenue || 0, prefix: "$", delta: 12.4, icon: DollarSign, color: "bg-indigo-50 text-indigo-600" },
    { label: "Total Orders",  value: stats?.total_orders || 0,  delta: 8.1,  icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
    { label: "Total Users",   value: stats?.total_users || 0,   delta: 5.3,  icon: Users, color: "bg-emerald-50 text-emerald-600" },
    { label: "Products",      value: stats?.total_products || 0,delta: -2.1, icon: Package, color: "bg-amber-50 text-amber-600" },
    { label: "Pending Orders",value: stats?.pending_orders || 0,             icon: Clock, color: "bg-rose-50 text-rose-600" },
    { label: "Today's Refunds",value: stats?.refunds_today || 0,             icon: RefreshCw, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Revenue & Orders</h3>
            <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600">
              <option>Last 7 months</option><option>Last 12 months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip formatter={(v, n) => [n === "revenue" ? fmt(v) : v, n === "revenue" ? "Revenue" : "Orders"]} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#rev)" />
              <Line type="monotone" dataKey="orders" stroke="#f43f5e" strokeWidth={2} dot={false} yAxisId={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categories} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {categories.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categories.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CAT_COLORS[i] }} />
                  <span className="text-slate-600">{c.name}</span>
                </div>
                <span className="font-semibold text-slate-700">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {MOCK_ACTIVITY.map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className={`w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center ${a.color}`}>
                <a.icon size={14} />
              </div>
              <span className="flex-1 text-sm text-slate-700">{a.msg}</span>
              <span className="text-xs text-slate-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsSection({ products, setProducts, token }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", category: "", price: "", stock: "", is_active: true });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock, is_active: p.is_active });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (editing) {
      try {
        const res = await fetch(`${API_BASE_URL}/accounts/admin/products/${editing}/`, {
          method: "PATCH", headers: authHeaders(token), body: JSON.stringify(form),
        });
        if (res.ok) {
          setProducts((prev) => prev.map((p) => p.id === editing ? { ...p, ...form } : p));
        }
      } catch {
        setProducts((prev) => prev.map((p) => p.id === editing ? { ...p, ...form } : p));
      }
    } else {
      const newP = { id: Date.now(), ...form, sales: 0 };
      setProducts((prev) => [newP, ...prev]);
    }
    setShowModal(false); setEditing(null);
  };

  const toggleActive = (id) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_active: !p.is_active } : p));
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
            <Filter size={14} /> Filter
          </button>
          <button onClick={() => { setEditing(null); setForm({ name: "", category: "", price: "", stock: "", is_active: true }); setShowModal(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                {["Product", "Category", "Price", "Stock", "Sales", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.category}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">${p.price}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${p.stock === 0 ? "text-rose-500" : p.stock < 20 ? "text-amber-500" : "text-emerald-600"}`}>
                      {p.stock === 0 ? "Out of stock" : p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.sales}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p.id)} className="flex items-center gap-1.5 text-xs font-medium">
                      {p.is_active
                        ? <><ToggleRight size={18} className="text-emerald-500" /><span className="text-emerald-600">Active</span></>
                        : <><ToggleLeft size={18} className="text-slate-400" /><span className="text-slate-400">Inactive</span></>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editing ? "Edit Product" : "Add New Product"} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {[["Product Name", "name", "text"], ["Category", "category", "text"], ["Price ($)", "price", "number"], ["Stock", "stock", "number"]].map(([label, key, type]) => (
              <div key={key}>
                <label className="text-sm font-medium text-slate-700 mb-1 block">{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <button onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))} className="flex items-center gap-2 text-sm text-slate-700">
                {form.is_active ? <ToggleRight size={22} className="text-emerald-500" /> : <ToggleLeft size={22} className="text-slate-400" />}
                {form.is_active ? "Active" : "Inactive"}
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function OrdersSection({ orders, setOrders, token }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = orders.filter((o) => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || o.user_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE_URL}/accounts/admin/orders/${id}/`, {
        method: "PATCH", headers: authHeaders(token), body: JSON.stringify({ status }),
      });
    } catch { /* mock */ }
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders…"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors capitalize
                ${filterStatus === s ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {["Order #", "Customer", "Items", "Total", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-indigo-600 font-semibold">{o.order_number}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{o.user_name}</td>
                  <td className="px-4 py-3 text-slate-500">{o.items} item{o.items > 1 ? "s" : ""}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">${o.total}</td>
                  <td className="px-4 py-3 text-slate-500">{o.date}</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 ${statusColor[o.status] || "bg-gray-100"}`}>
                      {["pending", "processing", "shipped", "delivered", "cancelled", "refunded"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Eye size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500"><RefreshCw size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersSection({ users, setUsers, token }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", role: "customer", is_active: true });

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    String(u.email).toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (u) => {
    setEditing(u.id); setForm({ username: u.username, email: u.email, role: u.role, is_active: u.is_active });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editing) {
      setUsers((prev) => prev.map((u) => u.id === editing ? { ...u, ...form } : u));
    } else {
      setUsers((prev) => [{ id: Date.now(), ...form, joined: new Date().toISOString().slice(0, 10), orders: 0 }, ...prev]);
    }
    setShowModal(false); setEditing(null);
  };

  const toggleActive = (id) => setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_active: !u.is_active } : u));
  const handleDelete = (id) => { if (window.confirm("Delete this user?")) setUsers((prev) => prev.filter((u) => u.id !== id)); };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <button onClick={() => { setEditing(null); setForm({ username: "", email: "", role: "customer", is_active: true }); setShowModal(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={14} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {["User", "Email", "Role", "Orders", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">@{u.username}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3"><Badge label={u.role} color={roleColor[u.role] || "bg-gray-100 text-gray-600"} /></td>
                  <td className="px-4 py-3 text-slate-600">{u.orders}</td>
                  <td className="px-4 py-3 text-slate-500">{u.joined}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(u.id)} className="flex items-center gap-1.5 text-xs font-medium">
                      {u.is_active
                        ? <><ToggleRight size={18} className="text-emerald-500" /><span className="text-emerald-600">Active</span></>
                        : <><ToggleLeft size={18} className="text-slate-400" /><span className="text-slate-400">Disabled</span></>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(u)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={editing ? "Edit User" : "Add New User"} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {[["Username", "username", "text"], ["Email", "email", "email"]].map(([label, key, type]) => (
              <div key={key}>
                <label className="text-sm font-medium text-slate-700 mb-1 block">{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Role</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="customer">Customer</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AnalyticsSection({ revenue }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Order Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }} />
              <Line type="monotone" dataKey="orders" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: "#f43f5e", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Top Performing Products</h3>
        <div className="space-y-3">
          {MOCK_PRODUCTS.sort((a, b) => b.sales - a.sales).slice(0, 5).map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="w-5 text-xs font-bold text-slate-400">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{p.name}</div>
                <div className="text-xs text-slate-400">{p.category}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">{p.sales} sales</div>
                <div className="text-xs text-slate-400">${(p.price * p.sales).toLocaleString()}</div>
              </div>
              <div className="w-24">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(p.sales / 534) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiscountsSection() {
  const [coupons, setCoupons] = useState([
    { id: 1, code: "SUMMER25", type: "percent", value: 25, uses: 143, max_uses: 500, expires: "2025-08-31", active: true },
    { id: 2, code: "WELCOME10", type: "fixed", value: 10, uses: 892, max_uses: null, expires: null, active: true },
    { id: 3, code: "FLASH50", type: "percent", value: 50, uses: 312, max_uses: 312, expires: "2025-07-15", active: false },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", max_uses: "", expires: "" });

  const handleCreate = () => {
    setCoupons((prev) => [...prev, { id: Date.now(), ...form, uses: 0, active: true }]);
    setShowModal(false); setForm({ code: "", type: "percent", value: "", max_uses: "", expires: "" });
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Coupons & Promotions</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          <Plus size={14} /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${c.active ? "border-slate-100" : "border-slate-100 opacity-60"}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-mono text-lg font-bold text-indigo-600">{c.code}</div>
                <div className="text-sm text-slate-500 mt-0.5">
                  {c.type === "percent" ? `${c.value}% off` : `$${c.value} off`}
                </div>
              </div>
              <Badge label={c.active ? "Active" : "Expired"} color={c.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"} />
            </div>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between"><span>Uses</span><span className="font-semibold text-slate-700">{c.uses}{c.max_uses ? ` / ${c.max_uses}` : ""}</span></div>
              {c.expires && <div className="flex justify-between"><span>Expires</span><span className="font-semibold text-slate-700">{c.expires}</span></div>}
              {c.max_uses && (
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(c.uses / c.max_uses) * 100}%` }} />
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setCoupons((prev) => prev.map((x) => x.id === c.id ? { ...x, active: !x.active } : x))}
                className="flex-1 text-xs py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">
                {c.active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => setCoupons((prev) => prev.filter((x) => x.id !== c.id))}
                className="p-1.5 border border-rose-100 text-rose-500 rounded-lg hover:bg-rose-50"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Create Coupon" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Coupon Code</label>
              <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER25"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="percent">Percentage</option><option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Value</label>
                <input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === "percent" ? "25" : "10"}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Max Uses (optional)</label>
                <input type="number" value={form.max_uses} onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Expiry (optional)</label>
                <input type="date" value={form.expires} onChange={(e) => setForm((f) => ({ ...f, expires: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Create</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ReviewsSection() {
  const [reviews, setReviews] = useState([
    { id: 1, user: "Alice J.", product: "Wireless Headphones Pro", rating: 5, text: "Absolutely love these! Crystal clear sound and super comfortable.", date: "2025-07-02", status: "approved" },
    { id: 2, user: "Bob S.", product: "Running Shoes Elite", rating: 2, text: "Sizing runs small. Disappointed with the quality for the price.", date: "2025-07-01", status: "pending" },
    { id: 3, user: "Carol W.", product: "Smart Watch Series 5", rating: 4, text: "Great features, battery could be better but overall satisfied.", date: "2025-06-30", status: "approved" },
    { id: 4, user: "David B.", product: "Yoga Mat Premium", rating: 1, text: "This is spam. Buy now at ...", date: "2025-06-29", status: "flagged" },
  ]);

  const setStatus = (id, status) => setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));

  const reviewStatus = { approved: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", flagged: "bg-rose-100 text-rose-700" };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Product Reviews Moderation</h2>
      {reviews.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-slate-800">{r.user}</span>
                <span className="text-slate-400 text-sm">on</span>
                <span className="text-indigo-600 text-sm font-medium">{r.product}</span>
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-1">{r.text}</p>
              <p className="text-xs text-slate-400 mt-2">{r.date}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge label={r.status} color={reviewStatus[r.status]} />
              <div className="flex gap-1">
                {r.status !== "approved" && <button onClick={() => setStatus(r.id, "approved")} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100">Approve</button>}
                {r.status !== "flagged" && <button onClick={() => setStatus(r.id, "flagged")} className="px-2 py-1 text-xs bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100">Flag</button>}
                <button onClick={() => setReviews((prev) => prev.filter((x) => x.id !== r.id))} className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PersonalizationSection() {
  const [settings, setSettings] = useState({
    theme: "light", primaryColor: "#6366f1", heroTitle: "Shop the Latest Trends",
    heroSubtitle: "Discover amazing products at unbeatable prices.",
    showBanner: true, bannerText: "🎉 Free shipping on orders over $50!",
    featuredCategory: "Electronics", showNewArrivals: true, showBestSellers: true,
    navItems: ["Home", "Products", "Sale", "About", "Contact"],
  });

  const update = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-slate-800">Website Personalization</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Theme */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Palette size={16} className="text-indigo-500" /> Theme Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Color Mode</label>
              <div className="flex gap-2">
                {["light", "dark"].map((m) => (
                  <button key={m} onClick={() => update("theme", m)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border capitalize transition-colors
                      ${settings.theme === m ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Primary Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.primaryColor} onChange={(e) => update("primaryColor", e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
                <span className="text-sm font-mono text-slate-600">{settings.primaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Megaphone size={16} className="text-indigo-500" /> Announcement Banner</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-600">Show Banner</label>
              <button onClick={() => update("showBanner", !settings.showBanner)}>
                {settings.showBanner ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-slate-300" />}
              </button>
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1.5 block">Banner Text</label>
              <input value={settings.bannerText} onChange={(e) => update("bannerText", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Layout size={16} className="text-indigo-500" /> Homepage Hero</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-600 mb-1.5 block">Headline</label>
              <input value={settings.heroTitle} onChange={(e) => update("heroTitle", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1.5 block">Subtitle</label>
              <textarea value={settings.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Layers size={16} className="text-indigo-500" /> Homepage Sections</h3>
          <div className="space-y-3">
            {[["Show New Arrivals", "showNewArrivals"], ["Show Best Sellers", "showBestSellers"]].map(([label, key]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-slate-600">{label}</label>
                <button onClick={() => update(key, !settings[key])}>
                  {settings[key] ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-slate-300" />}
                </button>
              </div>
            ))}
            <div>
              <label className="text-sm text-slate-600 mb-1.5 block">Featured Category</label>
              <select value={settings.featuredCategory} onChange={(e) => update("featuredCategory", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                {["Electronics", "Clothing", "Home & Garden", "Sports"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const [notifs, setNotifs] = useState([
    { id: 1, title: "Low stock alert", body: 'Product "Smart Watch Series 5" has only 15 units left.', type: "warning", time: "10m ago", read: false },
    { id: 2, title: "New order placed", body: "Order #ORD-10244 placed by Alice Johnson for $149.99.", type: "info", time: "25m ago", read: false },
    { id: 3, title: "Refund processed", body: "Refund of $89.50 processed for order #ORD-10198.", type: "success", time: "1h ago", read: true },
    { id: 4, title: "Coupon usage spike", body: 'Coupon "FLASH50" has reached 90% of max uses.', type: "warning", time: "2h ago", read: true },
    { id: 5, title: "New user registered", body: "grace_l created an account.", type: "info", time: "3h ago", read: true },
  ]);

  const typeConfig = {
    warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
    info:    { icon: Bell, color: "text-blue-500", bg: "bg-blue-50" },
    success: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
  };

  const markRead = (id) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const deleteN = (id) => setNotifs((prev) => prev.filter((n) => n.id !== id));
  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
        <button onClick={markAllRead} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Mark all as read</button>
      </div>
      {notifs.map((n) => {
        const cfg = typeConfig[n.type];
        return (
          <div key={n.id} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-4 transition-opacity ${n.read ? "opacity-60" : ""}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
              <cfg.icon size={16} className={cfg.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 text-sm">{n.title}</span>
                {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
              <p className="text-xs text-slate-400 mt-1">{n.time}</p>
            </div>
            <div className="flex gap-1">
              {!n.read && <button onClick={() => markRead(n.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><CheckCircle size={14} /></button>}
              <button onClick={() => deleteN(n.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><X size={14} /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sidebar nav config ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview",        label: "Overview",        icon: LayoutDashboard },
  { id: "analytics",       label: "Analytics",       icon: BarChart2 },
  { id: "orders",          label: "Orders",          icon: ShoppingCart },
  { id: "products",        label: "Products",        icon: Package },
  { id: "users",           label: "Users",           icon: Users },
  { id: "discounts",       label: "Discounts",       icon: Percent },
  { id: "reviews",         label: "Reviews",         icon: Star },
  { id: "notifications",   label: "Notifications",   icon: Bell },
  { id: "personalization", label: "Personalization", icon: Palette },
];

// ─── Main export ──────────────────────────────────────────────────────────────
export default function AdminPanelPage() {
  const [section, setSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats]       = useState(MOCK_STATS);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orders, setOrders]     = useState(MOCK_ORDERS);
  const [users, setUsers]       = useState(MOCK_USERS);
  const [revenue]               = useState(MOCK_REVENUE);
  const [categories]            = useState(MOCK_CATEGORIES);
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("access_token") : null;

  // Try real API, fall back to mock gracefully
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [s, p, o, u] = await Promise.all([
          fetch(`${API_BASE_URL}/accounts/admin/dashboard/`, { headers: authHeaders(token) }).then((r) => r.json()),
          fetch(`${API_BASE_URL}/accounts/admin/products/`,  { headers: authHeaders(token) }).then((r) => r.json()),
          fetch(`${API_BASE_URL}/accounts/admin/orders/`,    { headers: authHeaders(token) }).then((r) => r.json()),
          fetch(`${API_BASE_URL}/accounts/admin/users/`,     { headers: authHeaders(token) }).then((r) => r.json()),
        ]);
        setStats(s);
        if (Array.isArray(p?.results || p)) setProducts(p.results || p);
        if (Array.isArray(o?.results || o)) setOrders(o.results || o);
        if (Array.isArray(u?.results || u)) setUsers(u.results || u);
      } catch { /* silently use mock data */ }
    })();
  }, [token]);

  const current = NAV_ITEMS.find((n) => n.id === section);
  const unreadNotifs = 2;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} flex-shrink-0 bg-white border-r border-slate-100 flex flex-col transition-all duration-300 overflow-hidden`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-slate-800 text-lg whitespace-nowrap">ShopAdmin</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = section === item.id;
            return (
              <button key={item.id} onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors relative
                  ${active ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />}
                <item.icon size={18} className="flex-shrink-0" />
                {sidebarOpen && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
                {item.id === "notifications" && unreadNotifs > 0 && sidebarOpen && (
                  <span className="ml-auto bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{unreadNotifs}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button className={`w-full flex items-center gap-3 px-2 py-2 text-sm text-slate-500 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors`}>
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center gap-4 px-5 flex-shrink-0">
          <button onClick={() => setSidebarOpen((s) => !s)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <Menu size={18} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Admin</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="font-semibold text-slate-800">{current?.label}</span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input placeholder="Quick search…"
              className="pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-56 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50" />
          </div>

          {/* Notification bell */}
          <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500">
            <Bell size={18} />
            {unreadNotifs > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />}
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
            <span className="text-sm font-medium text-slate-700 hidden md:block">Admin</span>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {section === "overview"        && <OverviewSection stats={stats} revenue={revenue} categories={categories} />}
          {section === "analytics"       && <AnalyticsSection revenue={revenue} />}
          {section === "orders"          && <OrdersSection orders={orders} setOrders={setOrders} token={token} />}
          {section === "products"        && <ProductsSection products={products} setProducts={setProducts} token={token} />}
          {section === "users"           && <UsersSection users={users} setUsers={setUsers} token={token} />}
          {section === "discounts"       && <DiscountsSection />}
          {section === "reviews"         && <ReviewsSection />}
          {section === "notifications"   && <NotificationsSection />}
          {section === "personalization" && <PersonalizationSection />}
        </main>
      </div>
    </div>
  );
}