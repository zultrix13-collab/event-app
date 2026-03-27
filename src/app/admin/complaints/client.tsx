'use client';
import { useState } from 'react';
import { updateComplaintStatus } from '@/modules/green/actions';
import { useRouter } from 'next/navigation';

interface Complaint {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  sla_deadline: string | null;
  user?: { full_name: string | null; email: string } | null;
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Нээлттэй' },
  { value: 'in_progress', label: 'Шийдэж байна' },
  { value: 'resolved', label: 'Шийдвэрлэсэн' },
  { value: 'closed', label: 'Хаасан' },
];

export default function ComplaintActions({ complaint }: { complaint: Record<string, unknown> }) {
  const c = complaint as unknown as Complaint;
  const router = useRouter();
  const [notes, setNotes] = useState(c.admin_notes ?? '');
  const [status, setStatus] = useState(c.status);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    await updateComplaintStatus(c.id, status, notes);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function handleResolve() {
    setLoading(true);
    await updateComplaintStatus(c.id, 'resolved', notes);
    setLoading(false);
    router.refresh();
  }

  const user = c.user as { full_name: string | null; email: string } | null;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4 sticky top-6">
      <h2 className="font-bold text-gray-900 text-lg leading-tight">{c.subject}</h2>

      <div className="flex gap-2 flex-wrap">
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
          {c.category}
        </span>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {c.priority}
        </span>
        {c.sla_deadline && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
            SLA: {new Date(c.sla_deadline).toLocaleDateString('mn-MN')}
          </span>
        )}
      </div>

      {user && (
        <div className="text-sm text-gray-600">
          👤 {user.full_name ?? user.email}
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 leading-relaxed max-h-40 overflow-y-auto">
        {c.description}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Статус өөрчлөх</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Админы тэмдэглэл</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Дотоод тэмдэглэл..."
          className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
        >
          {saved ? '✅ Хадгалагдлаа' : loading ? 'Хадгалж...' : 'Хадгалах'}
        </button>
        {c.status !== 'resolved' && (
          <button
            onClick={handleResolve}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
          >
            ✅ Шийдвэрлэсэн
          </button>
        )}
      </div>

      {c.resolved_at && (
        <p className="text-xs text-green-600">
          ✓ Шийдвэрлэсэн: {new Date(c.resolved_at).toLocaleDateString('mn-MN')}
        </p>
      )}
    </div>
  );
}
