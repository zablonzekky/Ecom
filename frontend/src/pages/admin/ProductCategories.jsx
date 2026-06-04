import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Tag, Upload, X } from 'lucide-react';
import { productService } from '../../services';
import { LoadingState, EmptyState, ConfirmModal, Modal } from '../../components/common';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/media')) return `${API_URL}${path}`;
  return `${API_URL}/media/${path}`;
};

const GENDER_CHOICES = [
  { value: 'M', label: 'Men' },
  { value: 'W', label: 'Women' },
  { value: 'U', label: 'Unisex' },
];

function CategoryForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial ? {
    name:        initial.name        || '',
    gender:      initial.gender      || 'U',
    description: initial.description || '',
    is_active:   initial.is_active   ?? true,   // ← was is_featured, now is_active
  } : { name: '', gender: 'U', description: '', is_active: true });

  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(getImageUrl(initial?.image));

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const slug = form.name.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    onSubmit({ ...form, slug }, imageFile);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group mb-4">
        <label className="form-label">Category Name *</label>
        <input
          className="form-control"
          value={form.name}
          onChange={set('name')}
          placeholder="e.g. Shirts"
          required
        />
      </div>

      <div className="form-group mb-4">
        <label className="form-label">Gender</label>
        <select className="form-control" value={form.gender} onChange={set('gender')}>
          {GENDER_CHOICES.map(g => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group mb-4">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          value={form.description}
          onChange={set('description')}
          rows={3}
          placeholder="Optional description…"
        />
      </div>

      {/* Category Image */}
      <div className="form-group mb-4">
        <label className="form-label">Category Image</label>
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', border: '2px dashed var(--border)',
          borderRadius: 10, padding: 16, cursor: 'pointer',
          minHeight: 110, background: 'var(--surface-2)',
          transition: 'border-color 0.2s',
        }}>
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="preview"
              style={{ maxHeight: 80, maxWidth: '100%', borderRadius: 6, objectFit: 'cover' }}
              onError={(e) => { e.target.onerror = null; setImagePreview(null); }}
            />
          ) : (
            <>
              <Upload size={22} color="var(--text-muted)" />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                Click or drag to upload category image
              </span>
            </>
          )}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
        </label>
        {imagePreview && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginTop: 6, width: '100%' }}
            onClick={() => { setImagePreview(null); setImageFile(null); }}
          >
            <X size={12} /> Remove image
          </button>
        )}
      </div>

      {/* Is Active toggle */}
      <div className="form-group mb-6">
        <label className="form-label">Status</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <label style={{ position: 'relative', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              style={{ display: 'none' }}
            />
            <div style={{
              width: 44, height: 24, borderRadius: 12,
              background: form.is_active ? 'var(--primary)' : 'var(--border)',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 3,
                left: form.is_active ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </label>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {form.is_active ? 'Active (visible in store)' : 'Inactive (hidden from store)'}
          </span>
        </div>
      </div>

      <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}

const GENDER_LABEL = { M: 'Men', W: 'Women', U: 'Unisex' };

export default function ProductCategories() {
  const [categories,   setCategories]  = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [saving,       setSaving]      = useState(false);
  const [modalOpen,    setModalOpen]   = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const r = await productService.categories();
      setCategories(r.data.results || r.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const buildFormData = (data, imageFile) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      fd.append(k, typeof v === 'boolean' ? String(v) : v);
    });
    if (imageFile) fd.append('image', imageFile);
    return fd;
  };

  const handleCreate = async (data, imageFile) => {
    setSaving(true);
    try {
      const fd = buildFormData(data, imageFile);
      await productService.createCategory(fd);
      toast.success('Category created');
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data
        ? Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ')
        : 'Error creating category';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data, imageFile) => {
    setSaving(true);
    try {
      const fd = buildFormData(data, imageFile);
      await productService.updateCategory(editCategory.id, fd);
      toast.success('Category updated');
      setEditCategory(null);
      fetchCategories();
    } catch {
      toast.error('Error updating category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await productService.deleteCategory(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      toast.error('Error deleting category');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="card">
        {loading ? <LoadingState /> : categories.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No categories yet"
            description="Create your first category to organise products"
            action={
              <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                Add Category
              </button>
            }
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Slug</th>
                  <th>Gender</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => {
                  const imgUrl = getImageUrl(cat.image);
                  return (
                    <tr key={cat.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 8,
                            background: 'var(--primary-bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', flexShrink: 0,
                          }}>
                            {imgUrl
                              ? <img
                                  src={imgUrl}
                                  alt={cat.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                              : <Tag size={15} color="var(--primary)" />
                            }
                          </div>
                          <span style={{ fontWeight: 500 }}>{cat.name}</span>
                        </div>
                      </td>
                      <td>
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={cat.name}
                            style={{
                              width: 48, height: 48, borderRadius: 6,
                              objectFit: 'cover', border: '1px solid var(--border)',
                            }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No image</span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                        {cat.slug}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', padding: '2px 10px', borderRadius: 20,
                          fontSize: 12, fontWeight: 600,
                          background: 'var(--primary-bg)', color: 'var(--primary)',
                        }}>
                          {GENDER_LABEL[cat.gender] || cat.gender}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', padding: '2px 10px', borderRadius: 20,
                          fontSize: 12, fontWeight: 600,
                          background: cat.is_active ? 'var(--success-bg, #d1fae5)' : 'var(--surface-2)',
                          color: cat.is_active ? 'var(--success, #059669)' : 'var(--text-muted)',
                        }}>
                          {cat.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {cat.description
                          ? cat.description.substring(0, 50) + (cat.description.length > 50 ? '…' : '')
                          : '—'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {cat.products_count ?? cat.product_count ?? '—'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn-icon" onClick={() => setEditCategory(cat)} title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => setDeleteTarget(cat)}
                            title="Delete"
                            style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Category" width={480}>
        <CategoryForm
          onSubmit={handleCreate}
          onClose={() => setModalOpen(false)}
          loading={saving}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editCategory} onClose={() => setEditCategory(null)} title="Edit Category" width={480}>
        {editCategory && (
          <CategoryForm
            initial={editCategory}
            onSubmit={handleUpdate}
            onClose={() => setEditCategory(null)}
            loading={saving}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? Products in this category may be affected.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}