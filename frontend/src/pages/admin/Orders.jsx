import React, { useState, useEffect, useCallback } from 'react';
import { Eye, RefreshCw, ShoppingCart, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services';
import { StatusBadge, LoadingState, Pagination, Modal, EmptyState } from '../../components/common';
import toast from 'react-hot-toast';

// Must match Order.STATUS_CHOICES in orders/models.py exactly
const STATUSES = ['', 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'];
const DATE_RANGES = [
  { label: 'All Time', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

function OrderTimeline({ timeline }) {
  const icons = {
    pending: '📋', processing: '⚙️', shipped: '📦', completed: '✅',
    cancelled: '❌', refunded: '↩️',
  };
  return (
    <div>
      {timeline.map((event, i) => (
        <div key={event.id} style={{ display: 'flex', gap: 12, marginBottom: i < timeline.length - 1 ? 16 : 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--primary-bg)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
          }}>
            {icons[event.status] || '📌'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{event.status ?? '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {event.created_at ? new Date(event.created_at).toLocaleString() : '—'}
            </div>
            {event.note && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{event.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function UpdateStatusModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order?.status || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // order.id is the integer DB primary key — used in the URL
      // order.order_number (e.g. "ORD-0001") is display only, never used as URL pk
      const pk = order.id;
      await orderService.updateStatus(pk, { status, note });
      toast.success('Status updated');
      onUpdate();
      onClose();
    } catch {
      toast.error('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group mb-4">
        <label className="form-label">New Status</label>
        <select className="form-control" value={status} onChange={e => setStatus(e.target.value)} required>
          {STATUSES.filter(Boolean).map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="form-group mb-4">
        <label className="form-label">Note (optional)</label>
        <textarea className="form-control" value={note} onChange={e => setNote(e.target.value)} rows={2} />
      </div>
      <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating...' : 'Update Status'}
        </button>
      </div>
    </form>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewOrder, setViewOrder] = useState(null);
  const [updateOrder, setUpdateOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (dateRange) params.date_range = dateRange;
      const { data } = await orderService.list(params);
      setOrders(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, dateRange]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    orderService.stats().then(r => setStats(r.data || {})).catch(() => {});
  }, []);

  // Safe number helpers — prevent NaN from crashing the render
  const n = (val) => Number(val) || 0;
  const money = (val) => n(val).toFixed(2);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
      <div>
        {/* Stats */}
        <div className="grid-4 mb-6">
          <div className="stat-card">
            <div className="stat-icon"><ShoppingCart size={20} /></div>
            <div className="stat-value">{n(stats.total_orders).toLocaleString()}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Clock size={20} /></div>
            <div className="stat-value">{n(stats.pending)}</div>
            <div className="stat-label">Pending</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Avg wait: 2 hrs</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><DollarSign size={20} /></div>
            <div className="stat-value">${money(stats.revenue_today)}</div>
            <div className="stat-label">Revenue Today</div>
            <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>
              {n(stats.revenue_change_percent) > 0 ? '+' : ''}{n(stats.revenue_change_percent)}% vs yesterday
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><TrendingUp size={20} /></div>
            <div className="stat-value">${money(stats.revenue_sales)}</div>
            <div className="stat-label">Revenue Sales</div>
          </div>
        </div>

        {/* Order Management Table */}
        <div className="card">
          <div className="card-header flex justify-between items-center" style={{ paddingBottom: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Order Management</h3>
          </div>
          <div className="filter-bar">
            <div className="search-box" style={{ maxWidth: 220 }}>
              <input
                className="form-control"
                placeholder="Search..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: 12 }}
              />
            </div>
            <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              {STATUSES.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Status'}</option>)}
            </select>
            <select className="form-control" style={{ width: 'auto' }} value={dateRange} onChange={e => { setDateRange(e.target.value); setPage(1); }}>
              {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          {loading ? <LoadingState /> : orders.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="No orders found" />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th><input type="checkbox" /></th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td><input type="checkbox" /></td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, fontWeight: 600 }}>
                        {/* order_number is the human-readable field e.g. "ORD-0001" */}
                        {order.order_number ?? '—'}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar-placeholder" style={{ width: 28, height: 28, fontSize: 11 }}>
                            {order.customer_name?.[0] ?? '?'}
                          </div>
                          <span style={{ fontSize: 13 }}>{order.customer_name ?? '—'}</span>
                        </div>
                      </td>
                      <td>{n(order.item_count)} {n(order.item_count) === 1 ? 'item' : 'items'}</td>
                      <td style={{ fontWeight: 600 }}>${money(order.total)}</td>
                      <td>
                        {/* FIX: normalise status to lowercase so StatusBadge always
                            receives a value it can match regardless of API casing */}
                        <StatusBadge status={(order.status ?? 'pending').toLowerCase()} />
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString('en', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-outline btn-sm" onClick={() => setViewOrder(order)}>
                            <Eye size={12} /> View
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => setUpdateOrder(order)}>
                            <RefreshCw size={12} /> Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Order Tracking Timeline</h3>
            {viewOrder && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Selected {viewOrder.order_number ?? '—'}
              </div>
            )}
          </div>
          <div className="card-body" style={{ paddingTop: 12 }}>
            {viewOrder?.timeline?.length > 0
              ? <OrderTimeline timeline={viewOrder.timeline} />
              : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Select an order to view timeline</div>
            }
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 14, fontWeight: 600 }}>High Value Orders</h3></div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => n(o.total) > 300).slice(0, 5).map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
                      {/* strip prefix for compact display e.g. "ORD-0001" → "0001" */}
                      {(o.order_number ?? '').replace(/^[A-Z]+-/, '') || '—'}
                    </td>
                    <td style={{ fontSize: 12 }}>{o.customer_name ?? '—'}</td>
                    <td>
                      {/* FIX: normalise status casing here too */}
                      <StatusBadge status={(o.status ?? 'pending').toLowerCase()} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal open={!!updateOrder} onClose={() => setUpdateOrder(null)} title="Update Order Status">
        {updateOrder && (
          <UpdateStatusModal
            order={updateOrder}
            onClose={() => setUpdateOrder(null)}
            onUpdate={fetchOrders}
          />
        )}
      </Modal>
    </div>
  );
}