import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services';
import { StatusBadge, LoadingState, Pagination, ConfirmModal, EmptyState } from '../../components/common';
import toast from 'react-hot-toast';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats]           = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 5 };
      if (search)       params.search    = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter === 'active')   params.is_active = 'true';
      else if (statusFilter === 'inactive') params.is_active = 'false';
      const { data } = await productService.list(params);
      setProducts(data.results || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.count || 0);
    } catch {
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    productService.categories().then(r => setCategories(r.data.results || r.data || [])).catch(() => {});
    productService.stats().then(r => setStats(r.data || {})).catch(() => {});
  }, []);

  const handleDelete = async () => {
    try {
      await productService.delete(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast.error('Error deleting product');
    }
  };

  const price = (val) => parseFloat(val || 0).toFixed(2);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product List</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {totalCount} product{totalCount !== 1 ? 's' : ''} total
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/products/create')}>
          + Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-6">
        {[
          { label: 'Total',       value: Number(stats.total)        || 0, color: null },
          { label: 'Active',      value: Number(stats.active)       || 0, color: null },
          { label: 'Low Stock',   value: Number(stats.low_stock)    || 0, color: 'warning' },
          { label: 'Out of Stock',value: Number(stats.out_of_stock) || 0, color: 'danger' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={s.color ? {
              background: `var(--${s.color}-bg)`, color: `var(--${s.color})`
            } : {}}>
              <Package size={20} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Filters */}
        <div className="filter-bar">
          <input
            className="form-control"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ maxWidth: 260 }}
          />
          <select
            className="form-control" style={{ width: 'auto' }}
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            className="form-control" style={{ width: 'auto' }}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(search || statusFilter || categoryFilter) && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); setPage(1); }}
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? <LoadingState /> : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={search || statusFilter ? "Try adjusting your filters" : "Create your first product"}
            action={
              !search && !statusFilter && (
                <button className="btn btn-primary" onClick={() => navigate('/admin/products/create')}>
                  Add Product
                </button>
              )
            }
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {product.images?.[0]?.image || product.image
                          ? <img
                              src={product.images?.[0]?.image || product.image}
                              alt=""
                              style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                            />
                          : <div style={{
                              width: 40, height: 40, borderRadius: 8,
                              background: 'var(--primary-bg)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Package size={18} color="var(--primary)" />
                            </div>
                        }
                        <div>
                          <div style={{ fontWeight: 500 }}>{product.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {product.description?.substring(0, 40)}{product.description?.length > 40 ? '…' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category_name || '—'}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: 12 }}>
                      {product.product_type || '—'}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        ${price(product.current_price ?? product.price)}
                      </span>
                      {product.discount_price && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 6 }}>
                          ${price(product.price)}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        color: product.stock === 0
                          ? 'var(--danger)'
                          : product.stock <= 10
                          ? 'var(--warning)'
                          : 'inherit',
                        fontWeight: product.stock <= 10 ? 600 : 400,
                      }}>
                        {product.stock ?? 0}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={product.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn-icon"
                          title="Edit product"
                          onClick={() => navigate('/admin/products/create', { state: { editProduct: product } })}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Delete product"
                          onClick={() => setDeleteTarget(product)}
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                        >
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

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Product"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
