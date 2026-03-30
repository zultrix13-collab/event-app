'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Speaker = {
  id: string;
  full_name: string;
  full_name_en: string | null;
  title: string | null;
  title_en: string | null;
  organization: string | null;
  organization_en: string | null;
  bio: string | null;
  avatar_url: string | null;
  country: string | null;
  is_active: boolean;
};

const EMPTY_FORM = {
  full_name: '',
  full_name_en: '',
  title: '',
  title_en: '',
  organization: '',
  organization_en: '',
  bio: '',
  avatar_url: '',
  country: '',
  is_active: true,
};

export default function AdminSpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Speaker | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState('');

  useEffect(() => {
    loadSpeakers();
  }, []);

  async function loadSpeakers() {
    setLoading(true);
    const res = await fetch('/api/admin/speakers');
    if (res.ok) {
      const data = await res.json();
      setSpeakers(data.speakers ?? []);
    }
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowForm(true);
  }

  function openEdit(speaker: Speaker) {
    setEditing(speaker);
    setForm({
      full_name: speaker.full_name,
      full_name_en: speaker.full_name_en ?? '',
      title: speaker.title ?? '',
      title_en: speaker.title_en ?? '',
      organization: speaker.organization ?? '',
      organization_en: speaker.organization_en ?? '',
      bio: speaker.bio ?? '',
      avatar_url: speaker.avatar_url ?? '',
      country: speaker.country ?? '',
      is_active: speaker.is_active,
    });
    setError('');
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/speakers/${editing.id}` : '/api/admin/speakers';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        full_name_en: form.full_name_en || null,
        title: form.title || null,
        title_en: form.title_en || null,
        organization: form.organization || null,
        organization_en: form.organization_en || null,
        bio: form.bio || null,
        avatar_url: form.avatar_url || null,
        country: form.country || null,
      }),
    });

    if (res.ok) {
      setShowForm(false);
      loadSpeakers();
    } else {
      const data = await res.json();
      setError(data.error ?? 'Алдаа гарлаа');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Илтгэгчийг устгах уу?')) return;
    const res = await fetch(`/api/admin/speakers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSpeakers((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
          <h1 className="text-2xl font-bold mt-1">🎤 Илтгэгчид</h1>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Шинэ илтгэгч нэмэх
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
        </div>
      ) : speakers.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-gray-500">
          <p className="text-3xl mb-2">🎤</p>
          <p>Илтгэгч байхгүй байна</p>
        </div>
      ) : (
        <div className="space-y-3">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0">
                {speaker.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={speaker.avatar_url} alt={speaker.full_name} className="w-full h-full object-cover" />
                ) : (
                  speaker.full_name[0]
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{speaker.full_name}</p>
                {speaker.full_name_en && <p className="text-xs text-gray-400">{speaker.full_name_en}</p>}
                {speaker.title && <p className="text-xs text-gray-500">{speaker.title}</p>}
                {speaker.organization && <p className="text-xs text-gray-400">{speaker.organization}</p>}
                <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                  {speaker.country && <span>🌍 {speaker.country}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${speaker.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {speaker.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                </span>
                <button
                  onClick={() => openEdit(speaker)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Засах
                </button>
                <button
                  onClick={() => handleDelete(speaker.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Устгах
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 my-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editing ? 'Илтгэгч засах' : 'Шинэ илтгэгч нэмэх'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
            </div>

            {error && <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Нэр (МН) *</label>
                  <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name (EN)</label>
                  <input value={form.full_name_en} onChange={(e) => setForm({ ...form, full_name_en: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Албан тушаал (МН)</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title (EN)</label>
                  <input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Байгууллага (МН)</label>
                  <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Organization (EN)</label>
                  <input value={form.organization_en} onChange={(e) => setForm({ ...form, organization_en: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Улс</label>
                <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="Mongolia"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Avatar URL</label>
                <input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                  type="url" placeholder="https://..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Намтар (МН)</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
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
