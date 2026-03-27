import { createClient as createAdminClient } from '@supabase/supabase-js';
import type { Order } from '@/modules/services/types';
import Link from 'next/link';
import AdminOrdersClient from './client';

type OrderWithUser = Order & {
  user: { full_name: string | null; email: string } | null;
};

async function getOrders(status?: string, from?: string, to?: string): Promise<OrderWithUser[]> {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = admin
    .from('orders')
    .select('*, order_items(*), user:profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (status && status !== 'all') query = query.eq('status', status);
  if (from) query = query.gte('created_at', from + 'T00:00:00Z');
  if (to) query = query.lte('created_at', to + 'T23:59:59Z');

  const { data } = await query;
  return (data ?? []) as OrderWithUser[];
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const orders = await getOrders(sp.status, sp.from, sp.to);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/services" className="text-blue-600 text-sm">← Буцах</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">📋 Захиалгууд</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: 'all', label: 'Бүгд' },
          { value: 'pending', label: 'Хүлээгдэж буй' },
          { value: 'paid', label: 'Төлөгдсөн' },
          { value: 'cancelled', label: 'Цуцалсан' },
          { value: 'refunded', label: 'Буцаалт' },
        ].map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/services/orders?status=${opt.value}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              (sp.status ?? 'all') === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <AdminOrdersClient orders={orders} />
    </div>
  );
}
