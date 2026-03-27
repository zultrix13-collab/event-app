import { createClient as createAdminClient } from '@supabase/supabase-js';
import type { LostFoundItem } from '@/modules/services/types';
import Link from 'next/link';
import LostFoundAdminClient from './client';

async function getItems(status?: string) {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = admin
    .from('lost_found_items')
    .select('*, reporter:profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data } = await query;
  return (data ?? []) as (LostFoundItem & { reporter: { full_name: string | null; email: string } | null })[];
}

export default async function AdminLostFoundPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? 'open';
  const items = await getItems(status);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/services" className="text-blue-600 text-sm">← Буцах</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">🔍 Алдсан/Олдсон зүйлс</h1>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-4">
        {[
          { value: 'open', label: 'Нээлттэй' },
          { value: 'resolved', label: 'Шийдвэрлэсэн' },
          { value: 'closed', label: 'Хаасан' },
          { value: 'all', label: 'Бүгд' },
        ].map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/services/lost-found?status=${opt.value}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              status === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <LostFoundAdminClient items={items} />
    </div>
  );
}
