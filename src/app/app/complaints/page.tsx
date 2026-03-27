'use client';
import { useState } from 'react';
import { submitComplaint } from '@/modules/green/actions';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'general', label: 'Ерөнхий' },
  { value: 'service', label: 'Үйлчилгээ' },
  { value: 'technical', label: 'Техникийн' },
  { value: 'safety', label: 'Аюулгүй байдал' },
  { value: 'other', label: 'Бусад' },
];

export default function ComplaintsPage() {
  const [form, setForm] = useState({ subject: '', description: '', category: 'general' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;

    setLoading(true);
    setError('');
    const res = await submitComplaint(form);
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error ?? 'Алдаа гарлаа');
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto p-4 pt-12 text-center space-y-4">
        <div className="text-6xl">✅</div>
        <h2 className="text-xl font-bold text-gray-900">Баярлалаа!</h2>
        <p className="text-gray-600">
          Таны санал хүсэлтийг хүлээн авлаа. Бид аль болох хурдан хариу өгөх болно.
        </p>
        <Link
          href="/app/home"
          className="inline-block mt-4 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
        >
          Нүүр хуудас руу буцах
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-5">
      <div>
        <Link href="/app/home" className="text-sm text-blue-600 hover:underline mb-2 block">
          ← Буцах
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">📣 Санал хүсэлт</h1>
        <p className="text-gray-500 text-sm mt-1">Таны санал, гомдлыг бидэнд мэдэгдэнэ үү</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ангилал</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Гарчиг *</label>
          <input
            type="text"
            required
            maxLength={200}
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Санал хүсэлтийн товч гарчиг..."
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар *</label>
          <textarea
            required
            rows={5}
            maxLength={2000}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Дэлгэрэнгүй тайлбарлана уу..."
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/2000</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            ❌ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !form.subject.trim() || !form.description.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Илгээж байна...' : 'Санал хүсэлт илгээх'}
        </button>
      </form>
    </div>
  );
}
