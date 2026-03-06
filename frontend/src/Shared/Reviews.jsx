import React, { useState, useEffect, useCallback } from 'react';
import { Star, Check, X, Trash2, Tag, Bell, Activity } from 'lucide-react';
import { reviewService, discountService, notificationService } from '../services';
import { StatusBadge, LoadingState, Pagination, Modal, ConfirmModal, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

// ===================== REVIEWS PAGE =====================
export function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await reviewService.list(params);
      setReviews(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const approve = async (id) => {
    await reviewService.approve(id);
    toast.success('Review approved');
    fetchReviews();
  };

  const reject = async (id) => {
    await reviewService.reject(id);
    toast.success('Review rejected');
    fetchReviews();
  };

  const stars = (n) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={12} fill={i < n ? '#c2621a' : 'none'} color={i < n ? '#c2621a' : 'var(--border)'} />
  ));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Review Moderation</h1>
      </div>
      <div className="card">
        <div className="filter-bar">
          {['pending', 'approved', 'rejected', ''].map(s => (
            <button
              key={s}
              className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
        {loading ? <LoadingState /> : reviews.length === 0 ? (
          <EmptyState icon={Star} title="No reviews" description="No reviews matching this filter" />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Product</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.user_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.product_name}</td>
                    <td><div className="flex gap-1">{stars(r.rating)}</div></td>
                    <td style={{ maxWidth: 200 }}>
                      {r.title && <div style={{ fontWeight: 500, fontSize: 13 }}>{r.title}</div>}
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.body}
                      </div>
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        {r.status !== 'approved' && (
                          <button className="btn btn-outline btn-sm" style={{ color: 'var(--success)', borderColor: 'var(--success-bg)' }} onClick={() => approve(r.id)}>
                            <Check size={12} /> Approve
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }} onClick={() => reject(r.id)}>
                            <X size={12} /> Reject
                          </button>
                        )}
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
  );
}

