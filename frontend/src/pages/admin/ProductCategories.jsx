import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Tag } from 'lucide-react';
import { productService } from '../../services';
import { LoadingState, EmptyState, ConfirmModal, Modal } from '../../components/common';
import toast from 'react-hot-toast';

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
  } : { name: '', gender: 'U', description: '' });

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Auto-generate slug from name
    const slug = form.name.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    onSubmit({ ...form, slug });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group mb-4">
        <label className="form-label">Category Name *</label>
        <input className="form-control" value={form.name} onChange={set('name')} placeholder="e.g. Shirts" required />
      </div>
      <div className="form-group mb-4">
        <label className="form-label">Gender</label>
        <select className="form-control" value={form.gender} onChange={set('gender')}>
          {GENDER_CHOICES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>
      <div className="form-group mb-6">
        <label className="form-label">Description</label>
        <textarea className="form-control" value={form.description} onChange={set('description')} rows={3} placeholder="Optional description…" />
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
  const [categories,    setCategories]   = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [saving,        setSaving]       = useState(false);
  const [modalOpen,     setModalOpen]    = useState(false);
  const [editCategory,  setEditCategory] = useState(null);
  const [deleteTarget,  setDeleteTarget] = useState(null);

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

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await productService.createCategory(data);
      toast.success('Category created');
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : 'Error creating category';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await productService.updateCategory(editCategory.id, data);
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
                  <th>Slug</th>
                  <th>Gender</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 8,
                          background: 'var(--primary-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Tag size={15} color="var(--primary)" />
                        </div>
                        <span style={{ fontWeight: 500 }}>{cat.name}</span>
                      </div>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Category" width={480}>
        <CategoryForm onSubmit={handleCreate} onClose={() => setModalOpen(false)} loading={saving} />
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
