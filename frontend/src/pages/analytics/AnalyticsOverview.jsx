import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { analyticsService } from '../../services';
import { LoadingState } from '../../components/common';
import {
  KpiCard, ChartCard, PeriodSelector, SectionHeader,
  CHART_COLORS, fmt, EmptyChart,
} from './analyticsUtils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--sidebar-bg)', color: 'white',
      padding: '10px 14px', borderRadius: 8, fontSize: 12,
    }}>
      <div style={{ marginBottom: 6, opacity: 0.7 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span>{p.name}: </span>
          <strong>{p.dataKey === 'revenue' ? fmt.currency(p.value) : fmt.number(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsOverview() {
  const [period, setPeriod]         = useState(30);
  const [stats, setStats]           = useState(null);
  const [chartData, setChartData]   = useState([]);
  const [breakdown, setBreakdown]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, chart, bd] = await Promise.all([
          analyticsService.dashboard({ period }),
          analyticsService.salesChart(period),
          analyticsService.salesBreakdown(period),
        ]);
        setStats(s.data);
        setChartData(chart.data);
        setBreakdown(bd.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  if (loading) return <LoadingState />;

  const statusColors = {
    completed: '#2d7a4a', pending: '#b8860b', processing: '#1a6fa8',
    shipped: '#6a1a8a', cancelled: '#c0392b', refunded: '#9c8572',
  };

  return (
    <div>
      <SectionHeader
        title="Analytics Overview"
        subtitle="Track your store performance across all key metrics"
      >
        <PeriodSelector period={period} onChange={setPeriod} />
      </SectionHeader>

      {/* KPI Cards */}
      <div className="grid-4 mb-6">
        <KpiCard
          icon={DollarSign}
          label="Revenue"
          value={fmt.short(stats?.revenue)}
          change={stats?.revenue_change}
          color="#c2621a"
        />
        <KpiCard
          icon={ShoppingBag}
          label="Orders"
          value={fmt.number(stats?.orders)}
          change={stats?.orders_change}
          color="#1a6fa8"
        />
        <KpiCard
          icon={Users}
          label="New Customers"
          value={fmt.number(stats?.new_customers)}
          change={stats?.new_customers_change}
          color="#2d7a4a"
        />
        <KpiCard
          icon={TrendingUp}
          label="Avg Order Value"
          value={fmt.currency(stats?.aov)}
          change={stats?.aov_change}
          color="#6a1a8a"
        />
      </div>

      {/* Revenue + Orders combo chart */}
      <ChartCard
        title="Revenue & Orders Over Time"
        subtitle={`Last ${period} days`}
        height={280}
      >
        {chartData.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 4, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={v => fmt.short(v)} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="left" type="monotone" dataKey="revenue"
                stroke={CHART_COLORS.revenue} strokeWidth={2.5}
                dot={false} activeDot={{ r: 5 }} name="Revenue"
              />
              <Line
                yAxisId="right" type="monotone" dataKey="orders"
                stroke={CHART_COLORS.orders} strokeWidth={2}
                dot={false} activeDot={{ r: 4 }} name="Orders" strokeDasharray="5 3"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Order breakdown by status */}
      <div style={{ marginTop: 20 }}>
        <ChartCard title="Orders by Status" subtitle="Distribution of order statuses this period">
          {breakdown.length === 0 ? <EmptyChart /> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={breakdown} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis
                    type="category" dataKey="status" tick={{ fontSize: 11 }}
                    width={80} tickFormatter={s => s.charAt(0).toUpperCase() + s.slice(1)}
                  />
                  <Tooltip formatter={(v, n) => [n === 'revenue' ? fmt.currency(v) : v, n]} />
                  <Bar dataKey="count" name="Orders" radius={[0, 4, 4, 0]}
                    fill={CHART_COLORS.orders} />
                </BarChart>
              </ResponsiveContainer>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {breakdown.map(b => (
                  <div key={b.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: statusColors[b.status] || 'var(--primary)',
                      }} />
                      <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{b.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{b.count}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 70, textAlign: 'right' }}>
                        {fmt.currency(b.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
