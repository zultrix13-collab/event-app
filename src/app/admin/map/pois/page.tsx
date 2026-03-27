'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type POI = {
  id: string;
  name: string;
  name_en: string | null;
  category: string;
  latitude: number;
  longitude: number;
  address: string | null;
  description: string | null;
  is_active: boolean;
};

const CATEGORIES = ['venue', 'hotel', 'restaurant', 'transport', 'attraction', 'medical', 'other'];

const CATEGORY_ICONS: Record<string, string> = {
  venue: '🏛️',
  hotel: '🏨',
  restaurant: '🍽️',
  transport: '✈️',
  attraction: '🎯',
  medical: '🏥',
  other: '📍',
};

export default function AdminPOIsPage() {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    name_en: '',
    category: 'venue',
    latitude: '',
    longitude: '',
    address: '',
    description: '',
    description_en: '',
  });

  useEffect(() => {
    fetchPOIs();
  }, []);

  async function fetchPOIs() {
    setLoading(true);
    const res = await fetch('/api/map/pois');
    if (res.ok) {
      const data = await res.json();
      setPois(data.pois ?? []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/map/pois', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({
        name: '',
        name_en: '',
        category: 'venue',
        latitude: '',
        longitude: '',
        address: '',
        description: '',
        description_en: '',
      });
      fetchPOIs();
    }
    setSaving(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📍 POI удирдлага</h1>
          <Link href="/admin/map" className="text-sm text-slate-500 hover:underline">
            ← Зурагны удирдлага
          </Link>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-xl font-medium text-sm transition-colors"
        >
          {showForm ? '✕ Хаах' : '+ Шинэ POI'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4"
        >
          <h2 className="font-semibold">Шинэ газрын цэг нэмэх</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Нэр (МН) *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent text-sm"
                placeholder="Газрын нэр"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name (EN)</label>
              <input
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent text-sm"
                placeholder="Location name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Ангилал *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_ICONS[cat]} {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Өргөрөг (Latitude) *</label>
              <input
                required
                type="number"
                step="0.0000001"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent text-sm font-mono"
                placeholder="47.9077"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Уртраг (Longitude) *</label>
              <input
                required
                type="number"
                step="0.0000001"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent text-sm font-mono"
                placeholder="106.9037"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Хаяг</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent text-sm"
              placeholder="Дэлгэрэнгүй хаяг"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Тайлбар (МН)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent text-sm"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Description (EN)</label>
              <textarea
                value={form.description_en}
                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent text-sm"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
            >
              Цуцлах
            </button>
          </div>
        </form>
      )}

      {/* POI Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Ачааллаж байна...</div>
        ) : pois.length === 0 ? (
          <div className="p-8 text-center text-slate-400">POI байхгүй байна.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left p-3 font-medium">Нэр</th>
                <th className="text-left p-3 font-medium">Ангилал</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Координат</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Хаяг</th>
                <th className="text-left p-3 font-medium">Төлөв</th>
              </tr>
            </thead>
            <tbody>
              {pois.map((poi) => (
                <tr
                  key={poi.id}
                  className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                >
                  <td className="p-3">
                    <div className="font-medium">{poi.name}</div>
                    {poi.name_en && (
                      <div className="text-xs text-slate-400">{poi.name_en}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1">
                      {CATEGORY_ICONS[poi.category] ?? '📍'} {poi.category}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs text-slate-500 hidden md:table-cell">
                    {poi.latitude}, {poi.longitude}
                  </td>
                  <td className="p-3 text-slate-500 hidden md:table-cell">
                    {poi.address ?? '-'}
                  </td>
                  <td className="p-3">
                    {poi.is_active ? (
                      <span className="text-green-600 text-xs font-medium">● Идэвхтэй</span>
                    ) : (
                      <span className="text-slate-400 text-xs">○ Идэвхгүй</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
