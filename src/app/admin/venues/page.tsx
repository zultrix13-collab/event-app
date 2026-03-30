'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Venue = {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  capacity: number;
  location: string | null;
  floor: number | null;
  is_active: boolean;
};

const EMPTY_FORM = {
  name: '',
  name_en: '',
  description: '',
  capacity: 0,
  location: '',
  floor: '',
  is_active: true,
};

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState('');

  useEffect(() => {
    loadVenues();
  }, []);

  async function loadVenues() {
    setLoading(true);
    const res = await fetch('/api/admin/venues');
    if (res.ok) {
      const data = await res.json();
      setVenues(data.venues ?? []);
    }
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowForm(true);
  }

  function openEdit(venue: Venue) {
    setEditing(venue);
    setForm({
      name: venue.name,
      name_en: venue.name_en ?? '',
      description: venue.description ?? '',
      capacity: venue.capacity,
      location: venue.location ?? '',
      floor: venue.floor != null ? String(venue.floor) : '',
      is_active: venue.is_active,
    });
    setError('');
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/venues/${editing.id}` : '/api/admin/venues';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        name_en: form.name_en || null,
        description: form.description || null,
        capacity: Number(form.capacity) || 0,
        location: form.location || null,
        floor: form.floor !== '' ? Number(form.floor) : null,
        is_active: form.is_active,
      }),
    });

    if (res.ok) {
      setShowForm(false);
      loadVenues();
    } else {
      const data = await res.json();
      setError(data.error ?? 'Алдаа гарлаа');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Заалыг устгах уу?')) return;
    const res = await fetch(`/api/admin/venues/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setVenues((prev) => prev.filter((v) => v.id !== id));
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
          <h1 className="text-2xl font-bold mt-1">🏛️ Заалнууд</h1>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Шинэ заал нэмэх
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
        </div>
      ) : venues.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-gray-500">
          <p className="text-3xl mb-2">🏛️</p>
          <p>Заал байхгүй байна</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Нэр</th>
                <th className="text-left p-4 font-semibold text-gray-600">Хүчин чадал</th>
                <th className="text-left p-4 font-semibold text-gray-600">Давхар</th>
                <th className="text-left p-4 font-semibold text-gray-600">Байршил</th>
                <th className="text-left p-4 font-semibold text-gray-600">Статус</th>
                <th className="text-left p-4 font-semibold text-gray-600">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {venues.map((venue) => (
                <tr key={venue.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{venue.name}</p>
                    {venue.name_en && <p className="text-xs text-gray-400">{venue.name_en}</p>}
                  </td>
                  <td className="p-4 text-gray-600">
                    {venue.capacity > 0 ? `👥 ${venue.capacity}` : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="p-4 text-gray-600">
                    {venue.floor != null ? `🏢 ${venue.floor}-р давхар` : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="p-4 text-gray-600">
                    {venue.location ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${venue.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {venue.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(venue)} className="text-xs text-blue-600 hover:underline">Засах</button>
                      <button onClick={() => handleDelete(venue.id)} className="text-xs text-red-600 hover:underline">Устгах</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editing ? 'Заал засах' : 'Шинэ заал нэмэх'}</h3>
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Хүчин чадал</label>
                  <input type="number" min="0" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Давхар</label>
                  <input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Байршил</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Байрлал..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Тайлбар</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
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
