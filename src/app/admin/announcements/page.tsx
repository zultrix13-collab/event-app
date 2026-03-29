'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Announcement = {
  id: string;
  title: string;
  title_en: string | null;
  body: string;
  body_en: string | null;
  type: 'info' | 'warning' | 'urgent' | 'news';
  target_roles: string[] | null;
  is_published: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
};

const TYPES = [
  { value: 'info', label: 'ℹ️ Мэдээлэл', color: 'bg-blue-100 text-blue-700' },
  { value: 'warning', label: '⚠️ Анхааруулга', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'urgent', label: '🚨 Яаралтай', color: 'bg-red-100 text-red-700' },
  { value: 'news', label: '📰 Мэдээ', color: 'bg-green-100 text-green-700' },
];

const ROLES = ['participant', 'vip', 'specialist', 'super_admin'];

const EMPTY_FORM = {
  title: '',
  title_en: '',
  body: '',
  body_en: '',
  type: 'info' as Announcement['type'],
  target_roles: [] as string[],
  is_published: false,
  expires_at: '',
  send_push: false,
  push_audience: 'all' as 'all' | 'vip' | 'general' | 'admin',
};

function typeInfo(type: string) {
  return TYPES.find((t) => t.value === type) ?? TYPES[0];
}

function formatDate(dt: string | null) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('mn-MN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState('');
  const [pushSending, setPushSending] = useState<string | null>(null);
  const [pushResult, setPushResult] = useState<{ id: string; sent: number; failed: number } | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setLoading(true);
    const res = await fetch('/api/admin/announcements');
    if (res.ok) {
      const data = await res.json();
      setAnnouncements(data.announcements ?? []);
    }
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowForm(true);
  }

  function openEdit(item: Announcement) {
    setEditing(item);
    setForm({
      title: item.title,
      title_en: item.title_en ?? '',
      body: item.body,
      body_en: item.body_en ?? '',
      type: item.type,
      target_roles: item.target_roles ?? [],
      is_published: item.is_published,
      expires_at: item.expires_at ? item.expires_at.substring(0, 16) : '',
      send_push: false,
      push_audience: 'all',
    });
    setError('');
    setShowForm(true);
  }

  async function handleSendPush(item: Announcement) {
    setPushSending(item.id);
    setPushResult(null);
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, body: item.body, audience: 'all' }),
      });
      const data = await res.json();
      if (res.ok) {
        setPushResult({ id: item.id, sent: data.sent, failed: data.failed });
      } else {
        alert(data.error ?? 'Push илгээхэд алдаа гарлаа');
      }
    } catch {
      alert('Push илгээхэд алдаа гарлаа');
    } finally {
      setPushSending(null);
    }
  }

  function toggleRole(role: string) {
    setForm((prev) => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter((r) => r !== role)
        : [...prev.target_roles, role],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/announcements/${editing.id}` : '/api/admin/announcements';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        title_en: form.title_en || null,
        body: form.body,
        body_en: form.body_en || null,
        type: form.type,
        target_roles: form.target_roles.length > 0 ? form.target_roles : null,
        is_published: form.is_published,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      }),
    });

    if (res.ok) {
      const savedData = await res.json().catch(() => ({}));
      // Send push notification if requested
      if (form.send_push && form.title && form.body) {
        await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            body: form.body,
            audience: form.push_audience,
          }),
        });
      }
      setShowForm(false);
      loadAnnouncements();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Алдаа гарлаа');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Устгах уу?')) return;
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  }

  async function togglePublish(item: Announcement) {
    const res = await fetch(`/api/admin/announcements/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...item,
        is_published: !item.is_published,
        published_at: !item.is_published ? new Date().toISOString() : null,
      }),
    });
    if (res.ok) {
      loadAnnouncements();
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
          <h1 className="text-2xl font-bold mt-1">📢 Зарлал / Мэдэгдэл</h1>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Шинэ зарлал нэмэх
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-gray-500">
          <p className="text-3xl mb-2">📢</p>
          <p>Зарлал байхгүй байна</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Гарчиг</th>
                <th className="text-left p-4 font-semibold text-gray-600">Төрөл</th>
                <th className="text-left p-4 font-semibold text-gray-600 hidden md:table-cell">Дуусах</th>
                <th className="text-left p-4 font-semibold text-gray-600">Статус</th>
                <th className="text-left p-4 font-semibold text-gray-600">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {announcements.map((item) => {
                const ti = typeInfo(item.type);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      {item.title_en && <p className="text-xs text-gray-400">{item.title_en}</p>}
                      {item.target_roles && item.target_roles.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {item.target_roles.map((r) => (
                            <span key={r} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{r}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ti.color}`}>{ti.label}</span>
                    </td>
                    <td className="p-4 text-gray-500 hidden md:table-cell text-xs">
                      {formatDate(item.expires_at)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => togglePublish(item)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          item.is_published
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {item.is_published ? '✓ Нийтлэгдсэн' : '○ Драфт'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => openEdit(item)} className="text-xs text-blue-600 hover:underline">Засах</button>
                        <button onClick={() => handleDelete(item.id)} className="text-xs text-red-600 hover:underline">Устгах</button>
                        <button
                          onClick={() => handleSendPush(item)}
                          disabled={pushSending === item.id}
                          className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 transition-colors"
                          title="Push мэдэгдэл илгээх"
                        >
                          {pushSending === item.id ? '📤...' : '🔔 Push'}
                        </button>
                        {pushResult?.id === item.id && (
                          <span className="text-xs text-green-600">✓ {pushResult.sent} илгээсэн</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 my-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editing ? 'Зарлал засах' : 'Шинэ зарлал нэмэх'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
            </div>

            {error && <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Гарчиг (МН) *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Агуулга (МН) *</label>
                  <textarea required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Body (EN)</label>
                  <textarea value={form.body_en} onChange={(e) => setForm({ ...form, body_en: e.target.value })}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Төрөл *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Announcement['type'] })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Target roles (хоосон = бүгд)</label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.target_roles.includes(role)}
                        onChange={() => toggleRole(role)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Дуусах огноо/цаг</label>
                <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">Нийтлэх</span>
              </label>

              <div className="border-t pt-3">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={form.send_push} onChange={(e) => setForm({ ...form, send_push: e.target.checked })}
                    className="w-4 h-4 rounded" />
                  <span className="text-sm text-gray-700 font-medium">🔔 Push мэдэгдэл илгээх</span>
                </label>
                {form.send_push && (
                  <div className="ml-6">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Хүлээн авагч</label>
                    <select
                      value={form.push_audience}
                      onChange={(e) => setForm({ ...form, push_audience: e.target.value as typeof form.push_audience })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                    >
                      <option value="all">Бүгд</option>
                      <option value="vip">VIP</option>
                      <option value="general">Ерөнхий (attendee)</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}
              </div>

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
