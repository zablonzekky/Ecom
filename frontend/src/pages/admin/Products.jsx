import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Package, Upload, X } from 'lucide-react';
import { productService } from '../../services';
import { StatusBadge, LoadingState, Pagination, Modal, ConfirmModal, EmptyState } from '../../components/common';
import toast from 'react-hot-toast';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const DEFAULT_COLORS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'];

function ProductForm({ initial, categories, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial || {
    name: '', description: '', category: '', price: '',
    sale_price: '', stock: '', status: 'active',
  });
  const [selectedSizes, setSelectedSizes] = useState(
    initial?.variants?.map(v => v.size).filter(Boolean) || []
  );
  const [selectedColors, setSelectedColors] = useState(
    initial?.variants?.map(v => v.color).filter(Boolean) || []
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initial?.image || null);

  const set = (f) => (e) => setForm(form => ({ ...form, [f]: e.target.value }));

  const toggleSize = (size) => {
    setSelectedSizes(s => s.includes(size) ? s.filter(x => x !== size) : [...s, size]);
  };
  const toggleColor = (color) => {
    setSelectedColors(c => c.includes(color) ? c.filter(x => x !== color) : [...c, color]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const variants = [
      ...selectedSizes.map(s => ({ size: s, color: '', stock: 0, price_adjustment: 0 })),
      ...selectedColors.map(c => ({ size: '', color: c, stock: 0, price_adjustment: 0 })),
    ];
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== '' && fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);
    if (variants.length > 0) fd.append('variants', JSON.stringify(variants));
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Product Info */}
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 16, fontWeight: 600 }}>Product Information</h4>
          <div className="form-group mb-4">
            <label className="form-label">Product Name</label>
            <input className="form-control" value={form.name} onChange={set('name')} placeholder="Product Name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" value={form.description} onChange={set('description')} rows={4} placeholder="Description" />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 16, fontWeight: 600 }}>Pricing & Inventory</h4>
          <div className="form-group mb-4">
            <label className="form-label">Category</label>
            <select className="form-control" value={form.category} onChange={set('category')}>
              <option value="">Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="form-label">Price</label>
              <input type="number" step="0.01" className="form-control" value={form.price} onChange={set('price')} placeholder="Price" required />
            </div>
            <div className="form-group">
              <label className="form-label">Sale Price</label>
              <input type="number" step="0.01" className="form-control" value={form.sale_price} onChange={set('sale_price')} placeholder="Sale Price" />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Inventory Stock</label>
              <input type="number" className="form-control" value={form.stock} onChange={set('stock')} placeholder="Stock" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <label style={{ position: 'relative', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.status === 'active'}
                    onChange={e => setForm(f => ({ ...f, status: e.target.checked ? 'active' : 'inactive' }))}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: form.status === 'active' ? 'var(--primary)' : 'var(--border)',
                    position: 'relative', transition: 'background 0.2s'
                  }}>
                    <div style={{
                      position: 'absolute', top: 3, left: form.status === 'active' ? 23 : 3,
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </label>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{form.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media & Variants */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h4 style={{ marginBottom: 16, fontWeight: 600 }}>Media & Variants</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {/* Image Upload */}
          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>Image Upload Zone</div>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed var(--border)', borderRadius: 10, padding: 20, cursor: 'pointer',
              minHeight: 120, background: 'var(--surface-2)', transition: 'border-color 0.2s',
            }}>
              {imagePreview
                ? <img src={imagePreview} alt="" style={{ maxHeight: 80, maxWidth: '100%', borderRadius: 6 }} />
                : <>
                  <Upload size={24} color="var(--text-muted)" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>Drag-drop or click to upload</span>
                </>
              }
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </label>
          </div>

          {/* Size Selector */}
          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>Sizes</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SIZES.map(s => (
                <button
                  key={s} type="button"
                  className={`btn btn-sm ${selectedSizes.includes(s) ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => toggleSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>Colors</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DEFAULT_COLORS.map(c => (
                <span
                  key={c}
                  onClick={() => toggleColor(c)}
                  style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                    background: selectedColors.includes(c) ? 'var(--primary)' : 'var(--surface-2)',
                    color: selectedColors.includes(c) ? 'white' : 'var(--text-primary)',
                    border: '1px solid ' + (selectedColors.includes(c) ? 'var(--primary)' : 'var(--border)'),
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {c}
                  {selectedColors.includes(c) && <X size={10} />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : (initial ? 'Update Product' : 'Create Product')}
        </button>
      </div>
    </form>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 12 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await productService.list(params);
      setProducts(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    productService.categories().then(r => setCategories(r.data.results || r.data)).catch(() => {});
    productService.stats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const handleCreate = async (fd) => {
    setSaving(true);
    try {
      await productService.create(fd);
      toast.success('Product created');
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('Error creating product');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (fd) => {
    setSaving(true);
    try {
      await productService.update(editProduct.id, fd);
      toast.success('Product updated');
      setEditProduct(null);
      fetchProducts();
    } catch {
      toast.error('Error updating product');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon"><Package size={20} /></div>
          <div className="stat-value">{stats.total || 0}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Package size={20} /></div>
          <div className="stat-value">{stats.active || 0}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><Package size={20} /></div>
          <div className="stat-value">{stats.low_stock || 0}</div>
          <div className="stat-label">Low Stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}><Package size={20} /></div>
          <div className="stat-value">{stats.out_of_stock || 0}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            className="form-control"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ maxWidth: 260 }}
          />
          <select className="form-control" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {loading ? <LoadingState /> : products.length === 0 ? (
          <EmptyState icon={Package} title="No products found" description="Create your first product" action={
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Add Product</button>
          } />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
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
                        {product.image
                          ? <img src={product.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                          : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={18} color="var(--primary)" />
                          </div>
                        }
                        <div>
                          <div style={{ fontWeight: 500 }}>{product.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{product.description?.substring(0, 40)}...</div>
                        </div>
                      </div>
                    </td>
                    <td>{product.category_name || '—'}</td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600 }}>${parseFloat(product.effective_price).toFixed(2)}</span>
                        {product.sale_price && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 6 }}>
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: product.stock === 0 ? 'var(--danger)' : product.stock <= 10 ? 'var(--warning)' : 'inherit' }}>
                        {product.stock}
                      </span>
                    </td>
                    <td><StatusBadge status={product.status} /></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-icon" onClick={() => setEditProduct(product)}><Pencil size={14} /></button>
                        <button className="btn-icon" onClick={() => setDeleteTarget(product)}
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

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Product" width={860}>
        <ProductForm categories={categories} onSubmit={handleCreate} onClose={() => setModalOpen(false)} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" width={860}>
        {editProduct && (
          <ProductForm
            initial={editProduct}
            categories={categories}
            onSubmit={handleUpdate}
            onClose={() => setEditProduct(null)}
            loading={saving}
          />
        )}
      </Modal>

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