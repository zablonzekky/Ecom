import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../services/api";
import { showError, showSuccess } from "../services/toast";

export default function AdminPanelPage() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("access_token");

  const load = async () => {
    try {
      const [s, p, o, u] = await Promise.all([
        fetch(`${API_BASE_URL}/accounts/admin/dashboard/`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${API_BASE_URL}/accounts/admin/products/`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${API_BASE_URL}/accounts/admin/orders/`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${API_BASE_URL}/accounts/admin/users/`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);
      setStats(s); setProducts(p.results || p); setOrders(o.results || o); setUsers(u.results || u);
    } catch {
      showError("Failed to load admin data");
    }
  };

  useEffect(() => { load(); }, []);

  const setOrderStatus = async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/accounts/admin/orders/${id}/`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
    if (res.ok) { showSuccess("Order updated"); load(); }
  };

  const setStock = async (id, stock) => {
    const res = await fetch(`${API_BASE_URL}/accounts/admin/products/${id}/`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ stock, is_active: stock > 0 }) });
    if (res.ok) { showSuccess("Product updated"); load(); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      {stats && <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{Object.entries(stats).map(([k,v]) => <div key={k} className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">{k}</p><p className="text-xl font-semibold">{v}</p></div>)}</div>}
      <section className="bg-white border rounded-lg p-4"><h2 className="font-semibold mb-2">Products</h2>{products.map((p)=><div key={p.id} className="flex justify-between border-t py-2"><span>{p.name}</span><input type="number" defaultValue={p.stock} className="w-24 border" onBlur={(e)=>setStock(p.id, Number(e.target.value))} /></div>)}</section>
      <section className="bg-white border rounded-lg p-4"><h2 className="font-semibold mb-2">Orders</h2>{orders.map((o)=><div key={o.id} className="flex justify-between border-t py-2"><span>{o.order_number} ({o.user_name})</span><select defaultValue={o.status} onChange={(e)=>setOrderStatus(o.id,e.target.value)}><option>pending</option><option>processing</option><option>shipped</option><option>delivered</option><option>cancelled</option></select></div>)}</section>
      <section className="bg-white border rounded-lg p-4"><h2 className="font-semibold mb-2">Users</h2>{users.map((u)=><div key={u.id} className="border-t py-2">{u.username} - {u.email}</div>)}</section>
    </div>
  );
}
