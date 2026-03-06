import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Users, UserCheck, UserPlus, RepeatIcon } from 'lucide-react';
import { analyticsService } from '../../services';
import { LoadingState, Avatar } from '../../components/common';
import {
  KpiCard, ChartCard, PeriodSelector, SectionHeader,
  COLORS, CHART_COLORS, fmt, EmptyChart,
} from './analyticsUtils';

const RETENTION_COLORS = ['#2d7a4a', '#c2621a'];

export default function AnalyticsCustomers() {
  const [period, setPeriod]         = useState(30);
  const [topCustomers, setTop]      = useState([]);
  const [growth, setGrowth]         = useState([]);
  const [retention, setRetention]   = useState(null);
  const [byRole, setByRole]         = useState({});
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tc, g, r, br] = await Promise.all([
          analyticsService.topCustomers(period, 10),
          analyticsService.customerGrowth(period),
          analyticsService.customerRetention(period),
          analyticsService.customersByRole(),
        ]);
        setTop(tc.data);
        setGrowth(g.data);
        setRetention(r.data);
        setByRole(br.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  if (loading) return <LoadingState />;

  return (
    <div>
      <SectionHeader
        title="Customer Analytics"
        subtitle="Understand your customer base, growth trends, and buying behaviour"
      >
        <PeriodSelector period={period} onChange={setPeriod} />
      </SectionHeader>

      {/* KPIs */}
      <div className="grid-4 mb-6">
        <KpiCard icon={Users}      label="Total Buyers"      value={fmt.number(retention?.total)}           color="#c2621a" />
        <KpiCard icon={UserPlus}   label="New Signups"       value={fmt.number(growth.reduce((a, d) => a + d.new_customers, 0))} color="#2d7a4a" />
        <KpiCard icon={UserCheck}  label="Repeat Buyers"     value={fmt.number(retention?.repeat)}          color="#1a6fa8" />
        <KpiCard icon={RepeatIcon} label="Repeat Rate"       value={`${retention?.repeat_rate ?? 0}%`}      color="#6a1a8a" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Customer Growth */}
        <ChartCard title="New Customer Signups" subtitle={`Daily signups over last ${period} days`}>
          {growth.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growth} margin={{ top: 4, right: 10 }}>
                <defs>
                  <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2d7a4a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2d7a4a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  formatter={v => [v, 'New Customers']}
                  contentStyle={{ background: 'var(--sidebar-bg)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12 }}
                />
                <Area
                  type="monotone" dataKey="new_customers"
                  stroke="#2d7a4a" strokeWidth={2.5}
                  fill="url(#custGrad)" activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Retention Pie */}
        <ChartCard title="Customer Retention" subtitle="One-time vs repeat buyers">
          {!retention || retention.total === 0 ? <EmptyChart /> : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={retention.segments} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={70} innerRadius={40}
                  >
                    {retention.segments.map((_, i) => <Cell key={i} fill={RETENTION_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--sidebar-bg)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 20, fontSize: 12, marginTop: 6 }}>
                {retention.segments.map((s, i) => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: RETENTION_COLORS[i] }} />
                    <span>{s.name}: <strong>{s.value}</strong></span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 12, padding: '8px 16px',
                background: 'var(--primary-bg)', borderRadius: 8,
                fontSize: 13, fontWeight: 600, color: 'var(--primary)',
              }}>
                {retention.repeat_rate}% repeat rate
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Users by Role */}
      {byRole?.by_role && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <ChartCard title="Users by Role" subtitle="Breakdown of user roles in the system">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byRole.by_role} margin={{ top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="role" tick={{ fontSize: 11 }} tickFormatter={r => r.charAt(0).toUpperCase() + r.slice(1)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'var(--sidebar-bg)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]}>
                  {byRole.by_role.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Users by Status" subtitle="Active, inactive, pending, and banned accounts">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byRole.by_status} margin={{ top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} tickFormatter={s => s.charAt(0).toUpperCase() + s.slice(1)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'var(--sidebar-bg)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]}>
                  {byRole.by_status?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Top Customers Table */}
      <ChartCard title="Top Customers by Revenue" subtitle={`Highest spending customers in the last ${period} days`}>
        {topCustomers.length === 0 ? <EmptyChart message="No completed orders this period" /> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Orders</th>
                  <th>Avg Order</th>
                  <th>Total Spent</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalAll = topCustomers.reduce((s, c) => s + c.total_spent, 0);
                  return topCustomers.map((c, i) => {
                    const share = totalAll > 0 ? (c.total_spent / totalAll * 100) : 0;
                    return (
                      <tr key={c.id}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{i + 1}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="avatar-placeholder" style={{ width: 30, height: 30, fontSize: 12 }}>
                              {c.name?.[0] || '?'}
                            </div>
                            <span style={{ fontWeight: 500 }}>{c.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.email}</td>
                        <td>{c.order_count}</td>
                        <td>{fmt.currency(c.avg_order)}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{fmt.currency(c.total_spent)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 60, height: 5, background: 'var(--border)', borderRadius: 3 }}>
                              <div style={{
                                width: `${share}%`, height: '100%',
                                background: 'var(--primary)', borderRadius: 3,
                              }} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {share.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
