'use client';

import { useState, useEffect } from 'react';
import type { Product, ProductCategory } from '@/modules/services/types';
import { getProducts } from '@/modules/services/actions';
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import Link from 'next/link';

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'merchandise', label: 'Сувенир' },
  { value: 'food', label: 'Хоол' },
  { value: 'ticket', label: 'Тасалбар' },
  { value: 'other', label: 'Бусад' },
];

function getAdmin() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('merchandise');
  const [stock, setStock] = useState('-1');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    // Admin sees all products including inactive
    const admin = getAdmin();
    const { data } = await admin.from('products').select('*').order('created_at', { ascending: false });
    setProducts((data ?? []) as Product[]);
    setLoading(false);
  }

  function openForm(product?: Product) {
    if (product) {
      setEditing(product);
      setName(product.name);
      setNameEn(product.name_en ?? '');
      setPrice(String(product.price));
      setCategory(product.category as ProductCategory);
      setStock(String(product.stock_count));
      setImageUrl(product.image_url ?? '');
      setIsActive(product.is_active);
    } else {
      setEditing(null);
      setName('');
      setNameEn('');
      setPrice('');
      setCategory('merchandise');
      setStock('-1');
      setImageUrl('');
      setIsActive(true);
    }
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const admin = getAdmin();
    const payload = {
      name,
      name_en: nameEn || null,
      price: Number(price),
      category,
      stock_count: Number(stock),
      image_url: imageUrl || null,
      is_active: isActive,
    };

    if (editing) {
      await admin.from('products').update(payload).eq('id', editing.id);
    } else {
      await admin.from('products').insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm('Устгах уу?')) return;
    const admin = getAdmin();
    await admin.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function toggleActive(product: Product) {
    const admin = getAdmin();
    await admin.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/services" className="text-blue-600 text-sm">← Буцах</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">📦 Бараа бүтээгдэхүүн</h1>
        </div>
        <button
          onClick={() => openForm()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Бараа нэмэх
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Нэр</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Ангилал</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Үнэ</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Нөөц</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Идэвхтэй</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {p.name_en && <p className="text-xs text-gray-400">{p.name_en}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-right font-medium">₮{Number(p.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {p.stock_count === -1 ? '∞' : p.stock_count}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`w-10 h-5 rounded-full transition-colors ${p.is_active ? 'bg-green-400' : 'bg-gray-300'}`}
                    >
                      <span className={`block w-4 h-4 bg-white rounded-full mx-auto transition-transform ${p.is_active ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openForm(p)} className="text-blue-600 hover:underline text-xs">Засах</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">Устгах</button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Бараа байхгүй байна</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editing ? 'Бараа засах' : 'Бараа нэмэх'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Нэр (МН) *</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Нэр (EN)</label>
                  <input value={nameEn} onChange={(e) => setNameEn(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Үнэ (MNT) *</label>
                  <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Нөөц (-1 = хязгааргүй)</label>
                  <input type="number" min="-1" value={stock} onChange={(e) => setStock(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Ангилал</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Зургийн URL</label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">Идэвхтэй</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border rounded-xl text-sm font-medium">Болих</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
