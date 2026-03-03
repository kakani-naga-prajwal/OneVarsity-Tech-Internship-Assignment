import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  // hide any test products from this page
  const visibleProducts = products.filter(p => !p.name?.toLowerCase().includes('test'));
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', image_url: '', category_id: '' });

  const load = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products', { params: { limit: 100 } }),
        api.get('/categories')
      ]);
      setProducts(prodRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description || '',
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10) || 0,
        image_url: form.image_url || 'https://source.unsplash.com/800x600/?product',
      };
      if (form.category_id) payload.category_id = form.category_id;

      await api.post('/products', payload);
      setForm({ name: '', description: '', price: '', stock: '', image_url: '', category_id: '' });
      load();
    } catch (err) {
      console.error(err);
      alert('Failed to create product');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing) return;
    try {
      const payload = {
        name: form.name,
        description: form.description || '',
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10) || 0,
        image_url: form.image_url || 'https://source.unsplash.com/800x600/?product',
      };
      if (form.category_id) payload.category_id = form.category_id;
      else payload.category_id = null;

      await api.put(`/products/${editing.id}`, payload);
      setEditing(null);
      setForm({ name: '', description: '', price: '', stock: '', image_url: '', category_id: '' });
      load();
    } catch (err) {
      console.error(err);
      alert('Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      stock: String(p.stock),
      image_url: p.image_url || '',
      category_id: p.category_id || '',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">📦 Sell Products</h1>
          <p className="text-slate-600 text-sm mt-1">Manage your {visibleProducts.length} products in inventory</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/orders" className="btn-secondary">📊 Track Orders</Link>
          <Link to="/admin" className="btn-secondary">← Dashboard</Link>
        </div>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-slate-500 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{visibleProducts.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-slate-500 text-sm">Total Inventory Value</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">₹{(visibleProducts.reduce((sum, p) => sum + (p.price * p.stock), 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="card p-4">
          <p className="text-slate-500 text-sm">Low Stock Items</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{visibleProducts.filter(p => p.stock < 5).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="font-semibold mb-4 text-lg">{editing ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
          <form onSubmit={editing ? handleUpdate : handleCreate} className="space-y-3">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
              rows={2}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input"
              required
            />
            <input
              type="number"
              min="0"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="input"
            />
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">Image URL</label>
              <input
                placeholder="https://source.unsplash.com/800x600/?product"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="input mb-2"
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button type="button" onClick={() => setForm({ ...form, image_url: 'https://source.unsplash.com/800x600/?headphones' })} className="text-xs btn-secondary py-1">Headphones</button>
                <button type="button" onClick={() => setForm({ ...form, image_url: 'https://source.unsplash.com/800x600/?watch' })} className="text-xs btn-secondary py-1">Watch</button>
                <button type="button" onClick={() => setForm({ ...form, image_url: 'https://source.unsplash.com/800x600/?sneakers' })} className="text-xs btn-secondary py-1">Sneakers</button>
                <button type="button" onClick={() => setForm({ ...form, image_url: 'https://source.unsplash.com/800x600/?clothing' })} className="text-xs btn-secondary py-1">Clothing</button>
                <button type="button" onClick={() => setForm({ ...form, image_url: 'https://source.unsplash.com/800x600/?electronics' })} className="text-xs btn-secondary py-1">Electronics</button>
                <button type="button" onClick={() => setForm({ ...form, image_url: 'https://source.unsplash.com/800x600/?furniture' })} className="text-xs btn-secondary py-1">Furniture</button>
              </div>
              {form.image_url && (
                <div className="border border-slate-200 rounded p-2 bg-slate-50 max-h-40 overflow-hidden">
                  <img src={form.image_url} alt="Preview" className="w-full h-auto object-cover rounded" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="input"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                {editing ? 'Update' : 'Create'}
              </button>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '', stock: '', image_url: '', category_id: '' }); }} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-3">Your {visibleProducts.length} Products</h3>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {visibleProducts.map((p) => (
              <li key={p.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                  {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-slate-600 text-sm">₹{Number(p.price).toFixed(2)} · Stock: {p.stock}</p>
                  {p.stock < 5 && <p className="text-xs text-red-600 font-medium">⚠️ Low Stock</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="btn-secondary text-sm">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 text-sm hover:bg-red-50 px-2 py-1 rounded">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
