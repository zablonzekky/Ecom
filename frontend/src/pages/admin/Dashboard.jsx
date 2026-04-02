import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { DollarSign, ShoppingCart, Users, TrendingUp, Eye, Edit } from 'lucide-react';
import { analyticsService, orderService } from '../../services';
import { StatusBadge, LoadingState, StatCard } from '../../components/common';

const COLORS = ['#c2621a', '#e8894a', '#f5b88a', '#2d7a4a', '#1a6fa8'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, salesRes, catRes, custRes, ordersRes] = await Promise.all([
          analyticsService.dashboard(),
          analyticsService.salesChart(30),
          analyticsService.productCategories(),
          analyticsService.topCustomers(),
          orderService.list({ page_size: 5 }),
        ]);
        setStats(statsRes.data);
        setSalesData(salesRes.data);
        setCategoryData(catRes.data);
        setTopCustomers(custRes.data);
        setRecentOrders(ordersRes.data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      {/* Stats Row */}
      <div className="grid-4 mb-6">
        <StatCard
          icon={DollarSign}
          label="Total Sales"
          value={`$${stats?.total_sales?.toLocaleString('en', { minimumFractionDigits: 2 }) || '0.00'}`}
        />
        <StatCard
          icon={ShoppingCart}
          label="Orders Count"
          value={stats?.orders_count || 0}
        />
        <StatCard
          icon={Users}
          label="New Customers"
          value={`${stats?.new_customers_pct || 0}%`}
          badge="Last 30 days"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Order Value"
          value={`$${stats?.avg_order_value?.toFixed(2) || '0.00'}`}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Daily Sales */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Daily Sales</h3>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={v => [`$${v}`, 'Sales']} labelFormatter={l => l} />
                <Line type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Category */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Product Category</h3>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryData} dataKey="count" nameKey="category__name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Top Customers by Revenue</h3>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topCustomers} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="customer__first_name"
                  tick={{ fontSize: 10 }}
                  width={60}
                />
                <Tooltip formatter={v => [`$${v}`, 'Revenue']} />
                <Bar dataKey="total_spent" fill="var(--primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header flex justify-between items-center" style={{ paddingBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Recent Orders</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/orders')}>View All</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Order Status</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}>{order.order_id}</td>
                  <td>{order.customer_name}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td style={{ fontWeight: 600 }}>${parseFloat(order.total).toFixed(2)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/orders/${order.id}`)}>
                        <Eye size={13} /> View
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/orders/${order.id}`)}>
                        <Edit size={13} /> Edit
                      </button>
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