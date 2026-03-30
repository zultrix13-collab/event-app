'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Vendor = {
  id: string;
  name: string;
  name_en: string | null;
  booth_number: string | null;
  category: string | null;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

const CATEGORIES = ['food', 'merchandise', 'services', 'exhibition', 'sponsor', 'other'];

const EMPTY_FORM = {
  name: '',
  name_en: '',
  booth_number: '',
  category: 'other',
  description: '',
  contact_email: '',
  contact_phone: '',
  image_url: '',
  is_active: true,
};

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState('');

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
    setLoading(true);
    const res = await fetch('/api/admin/vendors');
    if (res.ok) {
      const data = await res.json();
      setVendors(data.vendors ?? []);
    }
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowForm(true);
  }

  function openEdit(vendor: Vendor) {
    setEditing(vendor);
    setForm({
      name: vendor.name,
      name_en: vendor.name_en ?? '',
      booth_number: vendor.booth_number ?? '',
      category: vendor.category ?? 'other',
      description: vendor.description ?? '',
      contact_email: vendor.contact_email ?? '',
      contact_phone: vendor.contact_phone ?? '',
      image_url: vendor.image_url ?? '',
      is_active: vendor.is_active,
    });
    setError('');
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/vendors/${editing.id}` : '/api/admin/vendors';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        name_en: form.name_en || null,
        booth_number: form.booth_number || null,
        category: form.category || null,
        description: form.description || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        image_url: form.image_url || null,
        is_active: form.is_active,
      }),
    });

    if (res.ok) {
      setShowForm(false);
      loadVendors();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Алдаа гарлаа');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Вендорыг устгах уу?')) return;
    const res = await fetch(`/api/admin/vendors/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setVendors((prev) => prev.filter((v) => v.id !== id));
    }
  }

  async function toggleActive(vendor: Vendor) {
    const res = await fetch(`/api/admin/vendors/${vendor.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vendor, is_active: !vendor.is_active }),
    });
    if (res.ok) {
      setVendors((prev) => prev.map((v) => v.id === vendor.id ? { ...v, is_active: !v.is_active } : v));
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/services" className="text-sm text-blue-600 hover:underline">← Үйлчилгээ</Link>
          <h1 className="text-2xl font-bold mt-1">🏪 Вендорууд</h1>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Вендор нэмэх
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-gray-500">
          <p className="text-3xl mb-2">🏪</p>
          <p>Вендор байхгүй байна</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Нэр</th>
                <th className="text-left p-4 font-semibold text-gray-600">Стенд №</th>
                <th className="text-left p-4 font-semibold text-gray-600">Ангилал</th>
                <th className="text-left p-4 font-semibold text-gray-600 hidden md:table-cell">И-мэйл</th>
                <th className="text-left p-4 font-semibold text-gray-600">Идэвхтэй</th>
                <th className="text-left p-4 font-semibold text-gray-600">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{vendor.name}</p>
                    {vendor.name_en && <p className="text-xs text-gray-400">{vendor.name_en}</p>}
                  </td>
                  <td className="p-4 text-gray-600">
                    {vendor.booth_number ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="p-4 text-gray-600">
                    {vendor.category ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="p-4 text-gray-600 hidden md:table-cell">
                    {vendor.contact_email ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(vendor)}
                      className={`w-10 h-5 rounded-full transition-colors ${vendor.is_active ? 'bg-green-400' : 'bg-gray-300'}`}
                    >
                      <span className={`block w-4 h-4 bg-white rounded-full mx-auto transition-transform ${vendor.is_active ? 'translate-x-2.5' : '-translate-x-2.5'}`} />
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(vendor)} className="text-xs text-blue-600 hover:underline">Засах</button>
                      <button onClick={() => handleDelete(vendor.id)} className="text-xs text-red-600 hover:underline">Устгах</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 my-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editing ? 'Вендор засах' : 'Шинэ вендор нэмэх'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
            </div>

            {error && <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Нэр (МН) *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name (EN)</label>
                  <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Стенд дугаар</label>
                  <input value={form.booth_number} onChange={(e) => setForm({ ...form, booth_number: e.target.value })}
                    placeholder="A-01"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ангилал</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">И-мэйл</label>
                  <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Утас</label>
                  <input type="tel" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Тайлбар</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Зургийн URL</label>
                <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
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
