import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { updateSession } from '@/modules/programme/actions';
import { redirect, notFound } from 'next/navigation';

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('event_sessions')
    .select(`
      *,
      session_speakers(speaker_id)
    `)
    .eq('id', id)
    .single();

  if (!session) notFound();

  const { data: venues } = await supabase.from('venues').select('id, name').eq('is_active', true).order('name');
  const { data: speakers } = await supabase.from('speakers').select('id, full_name').eq('is_active', true).order('full_name');

  const currentSpeakerIds = new Set((session.session_speakers ?? []).map((ss: { speaker_id: string }) => ss.speaker_id));

  function toLocalDatetime(dt: string) {
    const d = new Date(dt);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function handleUpdate(formData: FormData) {
    'use server';
    const speakerIds = formData.getAll('speaker_ids') as string[];
    const tagsRaw = formData.get('tags') as string;
    const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

    const result = await updateSession(id, {
      title: formData.get('title') as string,
      title_en: (formData.get('title_en') as string) || undefined,
      description: (formData.get('description') as string) || undefined,
      description_en: (formData.get('description_en') as string) || undefined,
      session_type: formData.get('session_type') as string,
      venue_id: (formData.get('venue_id') as string) || undefined,
      starts_at: formData.get('starts_at') as string,
      ends_at: formData.get('ends_at') as string,
      capacity: parseInt(formData.get('capacity') as string) || 0,
      zone: formData.get('zone') as string,
      tags,
      is_published: formData.get('is_published') === 'true',
      speaker_ids: speakerIds,
    });

    if (result.success) redirect('/admin/programme');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/programme" className="text-sm text-blue-600 hover:underline">
          ← Хөтөлбөр
        </Link>
        <h1 className="text-2xl font-bold mt-2">Арга хэмжаа засах</h1>
      </div>

      <form action={handleUpdate} className="space-y-6">
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Үндсэн мэдээлэл</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Гарчиг (МН) *</label>
              <input name="title" required defaultValue={session.title} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (EN)</label>
              <input name="title_en" defaultValue={session.title_en ?? ''} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тайлбар (МН)</label>
              <textarea name="description" rows={3} defaultValue={session.description ?? ''} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
              <textarea name="description_en" rows={3} defaultValue={session.description_en ?? ''} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Төрөл *</label>
              <select name="session_type" defaultValue={session.session_type} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="general">General</option>
                <option value="keynote">Keynote</option>
                <option value="workshop">Workshop</option>
                <option value="panel">Panel</option>
                <option value="exhibition">Exhibition</option>
                <option value="networking">Networking</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Бүс *</label>
              <select name="zone" defaultValue={session.zone} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Заал</label>
              <select name="venue_id" defaultValue={session.venue_id ?? ''} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">— Заал сонгох —</option>
                {venues?.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Суудлын тоо</label>
              <input name="capacity" type="number" min="0" defaultValue={session.capacity} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Эхлэх огноо/цаг *</label>
              <input name="starts_at" type="datetime-local" required defaultValue={toLocalDatetime(session.starts_at)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дуусах огноо/цаг *</label>
              <input name="ends_at" type="datetime-local" required defaultValue={toLocalDatetime(session.ends_at)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тэгүүд</label>
            <input name="tags" defaultValue={session.tags?.join(', ') ?? ''} placeholder="технологи, инноваци, ..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        {speakers && speakers.length > 0 && (
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Илтгэгчид</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {speakers.map((sp) => (
                <label key={sp.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="speaker_ids"
                    value={sp.id}
                    defaultChecked={currentSpeakerIds.has(sp.id)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{sp.full_name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Нийтлэлтийн тохиргоо</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_published" value="true" defaultChecked={session.is_published} className="rounded" />
              <span className="text-sm font-medium">Нийтлэх</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Хадгалах
          </button>
          <Link href="/admin/programme" className="px-6 py-3 border rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium text-center">
            Цуцлах
          </Link>
        </div>
      </form>
    </div>
  );
}
