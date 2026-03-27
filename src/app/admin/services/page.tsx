import { createClient as createAdminClient } from '@supabase/supabase-js';
import Link from 'next/link';

async function getStats() {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date().toISOString().split('T')[0];

  const [
    { count: totalOrders },
    { data: todayOrders },
    { count: pendingTransport },
    { count: openLostFound },
  ] = await Promise.all([
    admin.from('orders').select('*', { count: 'exact', head: true }),
    admin
      .from('orders')
      .select('total_amount')
      .eq('status', 'paid')
      .gte('paid_at', today + 'T00:00:00Z')
      .lte('paid_at', today + 'T23:59:59Z'),
    admin.from('transport_bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('lost_found_items').select('*', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  const revenueToday = (todayOrders ?? []).reduce(
    (sum: number, o: { total_amount: number }) => sum + Number(o.total_amount),
    0
  );

  return {
    totalOrders: totalOrders ?? 0,
    revenueToday,
    pendingTransport: pendingTransport ?? 0,
    openLostFound: openLostFound ?? 0,
  };
}

export default async function AdminServicesPage() {
  const stats = await getStats();

  const statCards = [
    { label: 'Нийт захиалга', value: stats.totalOrders.toString(), icon: '📋', href: '/admin/services/orders' },
    { label: 'Өнөөдрийн орлого', value: `₮${stats.revenueToday.toLocaleString()}`, icon: '💰', href: '/admin/services/orders' },
    { label: 'Хүлээгдэх тээвэр', value: stats.pendingTransport.toString(), icon: '🚌', href: '/admin/services/orders?filter=transport' },
    { label: 'Нээлттэй алдсан зүйл', value: stats.openLostFound.toString(), icon: '🔍', href: '/admin/services/lost-found' },
  ];

  const menuItems = [
    { href: '/admin/services/products', icon: '📦', label: 'Бараа бүтээгдэхүүн', desc: 'Нэмэх, засах, устгах' },
    { href: '/admin/services/orders', icon: '📋', label: 'Захиалгууд', desc: 'Бүх захиалга харах' },
    { href: '/admin/services/lost-found', icon: '🔍', label: 'Алдсан/Олдсон', desc: 'Шийдвэрлэх, хаах' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Үйлчилгээ удирдлага</h1>
        <p className="text-gray-500 mt-1">Дэлгүүр, захиалга, алдсан/олдсон зүйлс</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow"
          >
            <p className="text-2xl mb-1">{card.icon}</p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Menu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white border rounded-xl p-5 hover:shadow-sm transition-shadow flex items-center gap-4"
          >
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
