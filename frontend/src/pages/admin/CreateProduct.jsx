import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, X, ArrowLeft } from 'lucide-react';
import { productService } from '../../services';
import toast from 'react-hot-toast';

const PRODUCT_TYPES = [
  { value: 'clothing',    label: 'Clothing' },
  { value: 'shoes',       label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
];
const NO_SIZE_TYPES    = ['accessories'];
const CLOTHING_SIZES   = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES       = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
const DEFAULT_COLORS   = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'];

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/media')) return `${API_URL}${path}`;
  return `${API_URL}/media/${path}`;
};

export default function CreateProduct() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const initial   = location.state?.editProduct || null;
  const isEditing = !!initial;

  const [categories, setCategories] = useState([]);
  const [saving, setSaving]         = useState(false);

  const [form, setForm] = useState(initial ? {
    name:         initial.name         || '',
    description:  initial.description  || '',
    category:     initial.category     || '',
    product_type: initial.product_type || 'clothing',
    price:        initial.price        || '',
    sale_price:   initial.discount_price || '',
    stock:        initial.stock        || '',
    status: initial.is_active !== undefined
      ? (initial.is_active ? 'active' : 'inactive')
      : 'active',
  } : {
    name: '', description: '', category: '', product_type: 'clothing',
    price: '', sale_price: '', stock: '', status: 'active',
  });

  const [selectedSizes,  setSelectedSizes]  = useState(initial?.sizes?.map(v => v.value).filter(Boolean) || []);
  const [selectedColors, setSelectedColors] = useState([]);
  const [imageFile,      setImageFile]      = useState(null);
  const [imagePreview,   setImagePreview]   = useState(
    getImageUrl(initial?.images?.[0]?.image || initial?.image)
  );

  useEffect(() => {
    productService.categories()
      .then(r => setCategories(r.data.results || r.data || []))
      .catch(() => {});
  }, []);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v === '') return;
        if (k === 'status')          fd.append('is_active', v === 'active' ? 'true' : 'false');
        else if (k === 'sale_price') fd.append('discount_price', v);
        else fd.append(k, v);
      });

      const slug = form.name.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      fd.append('slug', slug);

      if (imageFile) fd.append('image', imageFile);

      if (!NO_SIZE_TYPES.includes(form.product_type) && selectedSizes.length > 0) {
        selectedSizes.forEach((s, i) => {
          fd.append(`sizes[${i}]size_type`, form.product_type);
          fd.append(`sizes[${i}]value`, s);
          fd.append(`sizes[${i}]stock`, '0');
        });
      }

      if (isEditing) {
        await productService.update(initial.id, fd);
        toast.success('Product updated');
      } else {
        await productService.create(fd);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      const msg = err.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
        : 'Error saving product';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/admin/products')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h1 className="page-title">{isEditing ? 'Edit Product' : 'Create Product'}</h1>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {isEditing ? `Editing: ${initial.name}` : 'Add a new product to your store'}
            </div>
          </div>
        </div>
        <button
          type="submit"
          form="product-form"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? 'Saving…' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>

      <form id="product-form" onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Product Information */}
          <div className="card" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 18, fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Product Information
            </h4>
            <div className="form-group mb-4">
              <label className="form-label">Product Name *</label>
              <input className="form-control" value={form.name} onChange={set('name')} placeholder="e.g. Classic White Shirt" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={form.description} onChange={set('description')} rows={5} placeholder="Describe the product…" />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="card" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 18, fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pricing & Inventory
            </h4>
            <div className="grid-2 mb-4">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={form.category} onChange={set('category')}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Product Type *</label>
                <select
                  className="form-control"
                  value={form.product_type}
                  onChange={e => { set('product_type')(e); setSelectedSizes([]); }}
                  required
                >
                  {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2 mb-4">
              <div className="form-group">
                <label className="form-label">Price *</label>
                <input type="number" step="0.01" min="0" className="form-control" value={form.price} onChange={set('price')} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label className="form-label">Sale Price</label>
                <input type="number" step="0.01" min="0" className="form-control" value={form.sale_price} onChange={set('sale_price')} placeholder="0.00" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Stock</label>
                <input type="number" min="0" className="form-control" value={form.stock} onChange={set('stock')} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
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
                      position: 'relative', transition: 'background 0.2s',
                    }}>
                      <div style={{
                        position: 'absolute', top: 3,
                        left: form.status === 'active' ? 23 : 3,
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'white', transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  </label>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    {form.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media & Variants */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h4 style={{ marginBottom: 18, fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Media & Variants
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>

            {/* Image upload */}
            <div>
              <div className="form-label" style={{ marginBottom: 8 }}>Product Image</div>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed var(--border)', borderRadius: 10, padding: 20,
                cursor: 'pointer', minHeight: 130,
                background: 'var(--surface-2)', transition: 'border-color 0.2s',
              }}>
                {imagePreview
                  ? <img
                      src={imagePreview}
                      alt=""
                      style={{ maxHeight: 90, maxWidth: '100%', borderRadius: 6, objectFit: 'cover' }}
                      onError={(e) => { e.target.onerror = null; setImagePreview(null); }}
                    />
                  : <>
                      <Upload size={24} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                        Click or drag to upload
                      </span>
                    </>
                }
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: 8, width: '100%' }}
                  onClick={() => { setImagePreview(null); setImageFile(null); }}
                >
                  Remove image
                </button>
              )}
            </div>

            {/* Sizes */}
            <div>
              <div className="form-label" style={{ marginBottom: 8 }}>
                Sizes
                {!NO_SIZE_TYPES.includes(form.product_type) && selectedSizes.length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                    {selectedSizes.length} selected
                  </span>
                )}
              </div>
              {NO_SIZE_TYPES.includes(form.product_type) ? (
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  fontSize: 12, color: 'var(--text-muted)',
                }}>
                  Accessories don't use sizes
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(form.product_type === 'shoes' ? SHOE_SIZES : CLOTHING_SIZES).map(s => (
                    <button
                      key={s} type="button"
                      className={`btn btn-sm ${selectedSizes.includes(s) ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setSelectedSizes(prev =>
                        prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Colors */}
            <div>
              <div className="form-label" style={{ marginBottom: 8 }}>
                Colors
                {selectedColors.length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                    {selectedColors.length} selected
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DEFAULT_COLORS.map(c => (
                  <span
                    key={c}
                    onClick={() => setSelectedColors(prev =>
                      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                    )}
                    style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                      background: selectedColors.includes(c) ? 'var(--primary)' : 'var(--surface-2)',
                      color:      selectedColors.includes(c) ? 'white' : 'var(--text-primary)',
                      border: '1px solid ' + (selectedColors.includes(c) ? 'var(--primary)' : 'var(--border)'),
                      display: 'flex', alignItems: 'center', gap: 4,
                      transition: 'all 0.15s',
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

        {/* Bottom action bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
