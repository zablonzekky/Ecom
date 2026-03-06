import React, { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, Trash2, Tag, Bell, Activity } from 'lucide-react';
import { reviewService, discountService, notificationService } from '../../src/services';
import { StatusBadge, LoadingState, Pagination, Modal, ConfirmModal, EmptyState } from '../components/common';
import toast from 'react-hot-toast';
// ===================== DISCOUNTS PAGE =====================
function DiscountForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial || {
    code: '', description: '', discount_type: 'percentage',
    value: '', min_order_amount: '0', max_uses: '',
    status: 'active', valid_from: '', valid_until: '',
  });
  const set = (f) => (e) => setForm(form => ({ ...form, [f]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="form-label">Coupon Code</label>
          <input className="form-control" value={form.code} onChange={set('code')} required placeholder="SUMMER20" />
        </div>
        <div className="form-group">
          <label className="form-label">Discount Type</label>
          <select className="form-control" value={form.discount_type} onChange={set('discount_type')}>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>
      </div>
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="form-label">Value</label>
          <input type="number" step="0.01" className="form-control" value={form.value} onChange={set('value')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Min Order Amount</label>
          <input type="number" step="0.01" className="form-control" value={form.min_order_amount} onChange={set('min_order_amount')} />
        </div>
      </div>
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="form-label">Max Uses (empty = unlimited)</label>
          <input type="number" className="form-control" value={form.max_uses} onChange={set('max_uses')} />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-control" value={form.status} onChange={set('status')}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="grid-2 mb-4">
        <div className="form-group">
          <label className="form-label">Valid From</label>
          <input type="datetime-local" className="form-control" value={form.valid_from} onChange={set('valid_from')} />
        </div>
        <div className="form-group">
          <label className="form-label">Valid Until</label>
          <input type="datetime-local" className="form-control" value={form.valid_until} onChange={set('valid_until')} />
        </div>
      </div>
      <div className="form-group mb-4">
        <label className="form-label">Description</label>
        <textarea className="form-control" value={form.description} onChange={set('description')} rows={2} />
      </div>
      <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : (initial ? 'Update' : 'Create Discount')}
        </button>
      </div>
    </form>
  );
}

export function DiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDiscount, setEditDiscount] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await discountService.list({ page, page_size: 15 });
      setDiscounts(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch { toast.error('Failed to load discounts'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await discountService.create(form);
      toast.success('Discount created');
      setModalOpen(false);
      fetchDiscounts();
    } catch { toast.error('Error creating discount'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      await discountService.update(editDiscount.id, form);
      toast.success('Discount updated');
      setEditDiscount(null);
      fetchDiscounts();
    } catch { toast.error('Error updating discount'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await discountService.delete(deleteTarget.id);
      toast.success('Discount deleted');
      setDeleteTarget(null);
      fetchDiscounts();
    } catch { toast.error('Error deleting discount'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Discounts</h1>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Tag size={16} /> Add Discount
        </button>
      </div>
      <div className="card">
        {loading ? <LoadingState /> : discounts.length === 0 ? (
          <EmptyState icon={Tag} title="No discounts" description="Create your first discount code" action={
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Add Discount</button>
          } />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Uses</th>
                  <th>Status</th>
                  <th>Valid Until</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 600, fontSize: 13 }}>{d.code}</div>
                      {d.description && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.description}</div>}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{d.discount_type}</td>
                    <td style={{ fontWeight: 600 }}>
                      {d.discount_type === 'percentage' ? `${d.value}%` : `$${parseFloat(d.value).toFixed(2)}`}
                    </td>
                    <td>{d.uses_count}{d.max_uses ? ` / ${d.max_uses}` : ''}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {d.valid_until ? new Date(d.valid_until).toLocaleDateString() : 'No expiry'}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-icon" onClick={() => setEditDiscount(d)}><Tag size={14} /></button>
                        <button className="btn-icon" onClick={() => setDeleteTarget(d)}
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}>
                          <Trash2 size={14} />
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Discount">
        <DiscountForm onSubmit={handleCreate} onClose={() => setModalOpen(false)} loading={saving} />
      </Modal>
      <Modal open={!!editDiscount} onClose={() => setEditDiscount(null)} title="Edit Discount">
        {editDiscount && <DiscountForm initial={editDiscount} onSubmit={handleUpdate} onClose={() => setEditDiscount(null)} loading={saving} />}
      </Modal>
      <ConfirmModal open={!!deleteTarget} title="Delete Discount"
        message={`Delete discount "${deleteTarget?.code}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger />
    </div>
  );
}

