import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Package, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import { analyticsService } from '../../services';
import { LoadingState } from '../../components/common';
import {
  KpiCard, ChartCard, PeriodSelector, SectionHeader,
  COLORS, CHART_COLORS, fmt, EmptyChart,
} from './analyticsUtils';

const STOCK_COLORS = { ok: '#2d7a4a', low: '#b8860b', critical: '#c0392b' };

const CustomPieLabel = ({ cx, cy, midAngle, outerRadius, name, value, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = outerRadius + 22;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="var(--text-secondary)" textAnchor={x > cx ? 'start' : 'end'} fontSize={11}>
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

export default function AnalyticsProducts() {
  const [period, setPeriod]         = useState(30);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories]   = useState([]);
  const [stock, setStock]             = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tp, cat, st] = await Promise.all([
          analyticsService.topProducts(period, 10),
          analyticsService.productCategories(period),
          analyticsService.productStock(),
        ]);
        setTopProducts(tp.data);
        setCategories(cat.data);
        setStock(st.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  if (loading) return <LoadingState />;

  const totalProducts = stock.length;
  const lowStock      = stock.filter(p => p.stock_level === 'low').length;
  const outOfStock    = stock.filter(p => p.stock_level === 'critical').length;
  const topRevProduct = topProducts[0];

  return (
    <div>
      <SectionHeader
        title="Product Analytics"
        subtitle="Monitor your top performers, category distribution, and inventory health"
      >
        <PeriodSelector period={period} onChange={setPeriod} />
      </SectionHeader>

      {/* KPIs */}
      <div className="grid-4 mb-6">
        <KpiCard icon={Package}      label="Products Tracked"  value={totalProducts}          color="#c2621a" />
        <KpiCard icon={TrendingUp}   label="Top Product Revenue" value={fmt.short(topRevProduct?.revenue)} color="#2d7a4a" />
        <KpiCard icon={AlertTriangle} label="Low Stock Items"  value={lowStock}   color="#b8860b" />
        <KpiCard icon={XCircle}      label="Out of Stock"       value={outOfStock} color="#c0392b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
        {/* Top Products by Revenue */}
        <ChartCard title="Top Products by Revenue" subtitle={`Last ${period} days`}>
          {topProducts.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => fmt.short(v)} />
                <YAxis
                  type="category" dataKey="name" tick={{ fontSize: 11 }} width={130}
                  tickFormatter={n => n.length > 18 ? n.slice(0, 18) + '…' : n}
                />
                <Tooltip
                  formatter={(v, n) => [n === 'revenue' ? fmt.currency(v) : v, n]}
                  contentStyle={{ background: 'var(--sidebar-bg)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                  {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Category Pie */}
        <ChartCard title="Sales by Category" subtitle="Revenue distribution across categories">
          {categories.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categories} dataKey="count"
                  nameKey="name" cx="50%" cy="45%"
                  outerRadius={90} innerRadius={45}
                  labelLine={false}
                  label={CustomPieLabel}
                >
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--sidebar-bg)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Units Sold */}
      <div className="mb-5">
        <ChartCard title="Top Products by Units Sold" subtitle="Volume leaders this period">
          {topProducts.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts.slice(0, 8)} margin={{ top: 4, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis
                  dataKey="name" tick={{ fontSize: 10 }}
                  tickFormatter={n => n.length > 12 ? n.slice(0, 12) + '…' : n}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--sidebar-bg)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="units_sold" name="Units Sold" fill="#c2621a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Stock Health Table */}
      <ChartCard title="Inventory Health" subtitle="Products ordered by current stock level">
        {stock.length === 0 ? <EmptyChart message="No products found" /> : (
          <div>
            {/* Summary pills */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'In Stock', key: 'ok',       color: '#2d7a4a' },
                { label: 'Low Stock (≤10)', key: 'low', color: '#b8860b' },
                { label: 'Out of Stock', key: 'critical', color: '#c0392b' },
              ].map(({ label, key, color }) => (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 20,
                  background: color + '15', color, fontSize: 12, fontWeight: 500,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  {label}: {stock.filter(p => p.stock_level === key).length}
                </div>
              ))}
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Health</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.category}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 80, height: 6, borderRadius: 3,
                            background: 'var(--border)',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${Math.min((p.stock / 100) * 100, 100)}%`,
                              height: '100%',
                              background: STOCK_COLORS[p.stock_level],
                              borderRadius: 3,
                            }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 30 }}>{p.stock}</span>
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{p.status}</td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                          background: STOCK_COLORS[p.stock_level] + '20',
                          color: STOCK_COLORS[p.stock_level],
                        }}>
                          {p.stock_level === 'critical' ? 'Out of Stock' : p.stock_level === 'low' ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
