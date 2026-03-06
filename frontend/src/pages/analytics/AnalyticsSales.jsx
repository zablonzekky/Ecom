import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { DollarSign, ShoppingBag, Clock, TrendingUp } from 'lucide-react';
import { analyticsService } from '../../services';
import { LoadingState } from '../../components/common';
import {
  KpiCard, ChartCard, PeriodSelector, SectionHeader,
  CHART_COLORS, COLORS, fmt, EmptyChart,
} from './analyticsUtils';

export default function AnalyticsSales() {
  const [period, setPeriod]       = useState(30);
  const [granularity, setGran]    = useState('day');
  const [stats, setStats]         = useState(null);
  const [chartData, setChartData] = useState([]);
  const [hourly, setHourly]       = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, chart, hr, bd] = await Promise.all([
          analyticsService.dashboard({ period }),
          analyticsService.salesChart(period, granularity),
          analyticsService.hourlySales(period),
          analyticsService.salesBreakdown(period),
        ]);
        setStats(s.data);
        setChartData(chart.data);
        setHourly(hr.data);
        setBreakdown(bd.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period, granularity]);

  if (loading) return <LoadingState />;

  const peakHour = hourly.reduce((max, h) => h.revenue > (max?.revenue || 0) ? h : max, null);

  return (
    <div>
      <SectionHeader
        title="Sales Analytics"
        subtitle="Deep-dive into your revenue, order volume, and sales patterns"
      >
        <PeriodSelector period={period} onChange={setPeriod} />
      </SectionHeader>

      {/* KPIs */}
      <div className="grid-4 mb-6">
        <KpiCard icon={DollarSign} label="Total Revenue" value={fmt.short(stats?.revenue)} change={stats?.revenue_change} color="#c2621a" />
        <KpiCard icon={ShoppingBag} label="Total Orders" value={fmt.number(stats?.orders)} change={stats?.orders_change} color="#1a6fa8" />
        <KpiCard icon={TrendingUp} label="Avg Order Value" value={fmt.currency(stats?.aov)} change={stats?.aov_change} color="#2d7a4a" />
        <KpiCard
          icon={Clock}
          label="Peak Sales Hour"
          value={peakHour ? peakHour.label : '—'}
          color="#b8860b"
        />
      </div>

      {/* Revenue Area Chart */}
      <div className="mb-5">
        <ChartCard
          title="Revenue Over Time"
          subtitle={`Showing ${granularity === 'day' ? 'daily' : granularity === 'week' ? 'weekly' : 'monthly'} totals`}
          action={
            <div style={{ display: 'flex', gap: 6 }}>
              {['day', 'week', 'month'].map(g => (
                <button
                  key={g}
                  className={`btn btn-sm ${granularity === g ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setGran(g)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {g}
                </button>
              ))}
            </div>
          }
        >
          {chartData.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 4, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c2621a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#c2621a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmt.short(v)} />
                <Tooltip
                  formatter={(v) => [fmt.currency(v), 'Revenue']}
                  contentStyle={{
                    background: 'var(--sidebar-bg)', color: 'white',
                    border: 'none', borderRadius: 8, fontSize: 12,
                  }}
                />
                <Area
                  type="monotone" dataKey="revenue"
                  stroke="#c2621a" strokeWidth={2.5}
                  fill="url(#revenueGrad)" activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Orders Bar Chart */}
        <ChartCard title="Order Volume" subtitle="Number of orders per period">
          {chartData.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v) => [v, 'Orders']}
                  contentStyle={{ background: 'var(--sidebar-bg)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="orders" fill={CHART_COLORS.orders} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Revenue by Status */}
        <ChartCard title="Revenue by Status" subtitle="Which statuses contribute most">
          {breakdown.length === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={breakdown} margin={{ top: 4, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} tickFormatter={s => s.charAt(0).toUpperCase() + s.slice(1)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmt.short(v)} />
                <Tooltip
                  formatter={(v) => [fmt.currency(v), 'Revenue']}
                  contentStyle={{ background: 'var(--sidebar-bg)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Hourly Heatmap */}
      <ChartCard
        title="Sales by Hour of Day"
        subtitle="Identify peak selling hours to plan campaigns and staffing"
      >
        {hourly.length === 0 ? <EmptyChart /> : (
          <div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={hourly} margin={{ top: 4, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={1} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmt.short(v)} />
                <Tooltip
                  formatter={(v, n) => [n === 'revenue' ? fmt.currency(v) : v, n]}
                  contentStyle={{ background: 'var(--sidebar-bg)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="revenue" name="Revenue" radius={[3, 3, 0, 0]}>
                  {hourly.map((h, i) => (
                    <Cell
                      key={i}
                      fill={h.label === peakHour?.label ? '#c2621a' : 'rgba(194,98,26,0.35)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {peakHour && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--primary-bg)', borderRadius: 8, fontSize: 13 }}>
                🔥 Peak hour: <strong>{peakHour.label}</strong> — {fmt.currency(peakHour.revenue)} revenue, {peakHour.count} orders
              </div>
            )}
          </div>
        )}
      </ChartCard>
    </div>
  );
}
