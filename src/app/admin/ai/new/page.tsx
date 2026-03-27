'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { value: 'general', label: 'Ерөнхий' },
  { value: 'programme', label: 'Хөтөлбөр' },
  { value: 'faq', label: 'FAQ' },
  { value: 'venue', label: 'Байршил' },
  { value: 'service', label: 'Үйлчилгээ' },
  { value: 'emergency', label: 'Яаралтай' },
];

export default function NewKbDocumentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    title_en: '',
    content: '',
    content_en: '',
    category: 'general',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('Гарчиг болон агуулга заавал оруулна уу.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/ai/kb-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Хадгалах үед алдаа гарлаа');
      router.push('/admin/ai');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Шинэ баримт нэмэх</h1>
        <p className="text-slate-500 text-sm mt-1">AI-д ашиглах мэдлэгийн сан баримт бичиг</p>
      </div>

      <form onSubmit={e => void handleSubmit(e)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Ангилал</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Titles */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Гарчиг (Монгол) *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Монгол гарчиг"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Title (English)</label>
            <input
              type="text"
              value={form.title_en}
              onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))}
              placeholder="English title"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-2">Агуулга (Монгол) *</label>
          <textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Монгол хэлний агуулга..."
            rows={8}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content (English)</label>
          <textarea
            value={form.content_en}
            onChange={e => setForm(f => ({ ...f, content_en: e.target.value }))}
            placeholder="English content..."
            rows={8}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {saving ? 'Хадгалж байна...' : 'Хадгалах & Index хийх'}
          </button>
          <a
            href="/admin/ai"
            className="px-6 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Буцах
          </a>
        </div>
      </form>
    </div>
  );
}
