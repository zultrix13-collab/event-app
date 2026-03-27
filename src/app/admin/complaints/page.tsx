import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import ComplaintActions from './client';
import type { ComplaintRow } from '@/types/database';

export const metadata = { title: 'Санал хүсэлтүүд' };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'Нээлттэй', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Шийдэж байна', color: 'bg-yellow-100 text-yellow-700' },
  resolved: { label: 'Шийдвэрлэсэн', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Хаасан', color: 'bg-gray-100 text-gray-600' },
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'Бага', color: 'bg-gray-100 text-gray-600' },
  normal: { label: 'Дунд', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'Өндөр', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Яаралтай', color: 'bg-red-100 text-red-700' },
};

type ComplaintWithUser = ComplaintRow & { user: { full_name: string | null; email: string } | null };

export default async function AdminComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; id?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const baseQuery = supabase
    .from('complaints')
    .select('id, subject, description, category, status, priority, admin_notes, created_at, resolved_at, sla_deadline, assigned_to, user_id, user:profiles!complaints_user_id_fkey(full_name, email)')
    .order('created_at', { ascending: false });

  type QueryResult = ComplaintWithUser[];
  let complaints: QueryResult = [];

  if (params.status && params.priority) {
    const { data } = await baseQuery.eq('status', params.status as 'open' | 'in_progress' | 'resolved' | 'closed').eq('priority', params.priority as 'low' | 'normal' | 'high' | 'urgent');
    complaints = (data ?? []) as unknown as QueryResult;
  } else if (params.status) {
    const { data } = await baseQuery.eq('status', params.status as 'open' | 'in_progress' | 'resolved' | 'closed');
    complaints = (data ?? []) as unknown as QueryResult;
  } else if (params.priority) {
    const { data } = await baseQuery.eq('priority', params.priority as 'low' | 'normal' | 'high' | 'urgent');
    complaints = (data ?? []) as unknown as QueryResult;
  } else {
    const { data } = await baseQuery;
    complaints = (data ?? []) as unknown as QueryResult;
  }

  // Selected complaint detail
  let detail: ComplaintWithUser | null = null;
  if (params.id) {
    const { data } = await supabase
      .from('complaints')
      .select('id, subject, description, category, status, priority, admin_notes, created_at, resolved_at, sla_deadline, assigned_to, user_id, user:profiles!complaints_user_id_fkey(full_name, email)')
      .eq('id', params.id)
      .single();
    detail = data as unknown as ComplaintWithUser | null;
  }

  const { count: openCount } = await supabase
    .from('complaints')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📣 Санал хүсэлтүүд</h1>
          <p className="text-gray-500 text-sm mt-1">{openCount ?? 0} нээлттэй хүсэлт байна</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          href="/admin/complaints"
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${!params.status && !params.priority ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
        >
          Бүгд
        </Link>
        {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
          <Link
            key={val}
            href={`/admin/complaints?status=${val}`}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${params.status === val ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            {label}
          </Link>
        ))}
        <span className="border-l mx-1" />
        {Object.entries(PRIORITY_LABELS).map(([val, { label }]) => (
          <Link
            key={val}
            href={`/admin/complaints?priority=${val}`}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${params.priority === val ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className={`${detail ? 'w-1/2' : 'w-full'} bg-white rounded-xl border shadow-sm overflow-hidden`}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-600">Гарчиг</th>
                <th className="text-left p-3 font-semibold text-gray-600 hidden md:table-cell">Хэрэглэгч</th>
                <th className="text-left p-3 font-semibold text-gray-600">Ангилал</th>
                <th className="text-left p-3 font-semibold text-gray-600">Тэргүүлэх</th>
                <th className="text-left p-3 font-semibold text-gray-600">Статус</th>
                <th className="text-left p-3 font-semibold text-gray-600 hidden md:table-cell">Огноо</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {complaints.map((c) => {
                const status = STATUS_LABELS[c.status] ?? { label: c.status, color: 'bg-gray-100 text-gray-600' };
                const priority = PRIORITY_LABELS[c.priority] ?? { label: c.priority, color: 'bg-gray-100 text-gray-600' };
                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-gray-50 ${params.id === c.id ? 'bg-blue-50' : ''}`}
                  >
                    <td className="p-3">
                      <Link
                        href={`/admin/complaints?id=${c.id}${params.status ? `&status=${params.status}` : ''}`}
                        className="block font-medium text-gray-800 hover:text-blue-600 line-clamp-1"
                      >
                        {c.subject}
                      </Link>
                    </td>
                    <td className="p-3 text-gray-600 hidden md:table-cell">
                      {c.user?.full_name ?? c.user?.email ?? '—'}
                    </td>
                    <td className="p-3 text-gray-600 capitalize">{c.category}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.color}`}>
                        {priority.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs hidden md:table-cell">
                      {new Date(c.created_at).toLocaleDateString('mn-MN')}
                    </td>
                  </tr>
                );
              })}
              {complaints.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Санал хүсэлт байхгүй байна
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {detail && (
          <div className="w-1/2">
            <ComplaintActions complaint={detail as unknown as Record<string, unknown>} />
          </div>
        )}
      </div>
    </div>
  );
}
