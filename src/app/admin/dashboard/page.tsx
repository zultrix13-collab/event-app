import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];

  const [
    { count: totalUsers },
    { count: pendingVip },
    { count: todaySessions },
    { count: openComplaints },
    { count: totalSpeakers },
    { count: totalVenues },
    { count: chatSessions },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('vip_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('event_sessions').select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .gte('starts_at', today + 'T00:00:00Z')
      .lte('starts_at', today + 'T23:59:59Z'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('speakers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('venues').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('chat_sessions').select('*', { count: 'exact', head: true })
      .gte('started_at', today + 'T00:00:00Z'),
  ]);

  // Revenue
  const { data: paidOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'paid');
  const totalRevenue = paidOrders?.reduce((sum, o) => sum + (o.total_amount ?? 0), 0) ?? 0;

  // Top 5 leaderboard preview
  const { data: topLeaders } = await supabase
    .from('leaderboard')
    .select('user_id, full_name, total_steps, badge_count')
    .order('total_steps', { ascending: false })
    .limit(5);

  const stats = [
    { label: 'Нийт хэрэглэгч', value: totalUsers ?? 0, icon: '👥', color: 'bg-blue-50 text-blue-700', href: '/admin/users' },
    { label: 'VIP хүлээгдэж буй', value: pendingVip ?? 0, icon: '⏳', color: 'bg-orange-50 text-orange-700', href: '/admin/users' },
    { label: 'Өнөөдрийн хөтөлбөр', value: todaySessions ?? 0, icon: '📅', color: 'bg-green-50 text-green-700', href: '/admin/programme' },
    { label: 'Нээлттэй гомдол', value: openComplaints ?? 0, icon: '📣', color: 'bg-red-50 text-red-700', href: '/admin/complaints' },
    { label: 'Өнөөдрийн чат', value: chatSessions ?? 0, icon: '💬', color: 'bg-purple-50 text-purple-700', href: '/admin/ai' },
    { label: 'Нийт орлого (₮)', value: totalRevenue.toLocaleString(), icon: '💰', color: 'bg-emerald-50 text-emerald-700', href: '/admin/services/orders' },
    { label: 'Илтгэгчид', value: totalSpeakers ?? 0, icon: '🎤', color: 'bg-indigo-50 text-indigo-700', href: '/admin/speakers' },
    { label: 'Заалнууд', value: totalVenues ?? 0, icon: '🏛️', color: 'bg-gray-50 text-gray-700', href: '/admin/venues' },
  ];

  const quickLinks = [
    { href: '/admin/users', icon: '👥', label: 'Хэрэглэгчид' },
    { href: '/admin/programme', icon: '📅', label: 'Хөтөлбөр' },
    { href: '/admin/services', icon: '🛍️', label: 'Үйлчилгээ' },
    { href: '/admin/ai', icon: '🤖', label: 'AI KB' },
    { href: '/admin/map', icon: '🗺️', label: 'Газрын зураг' },
    { href: '/admin/notifications', icon: '🔔', label: 'Мэдэгдэл' },
    { href: '/admin/complaints', icon: '📣', label: 'Гомдол' },
    { href: '/admin/stats', icon: '📊', label: 'Статистик' },
    { href: '/admin/speakers', icon: '🎤', label: 'Илтгэгчид' },
    { href: '/admin/venues', icon: '🏛️', label: 'Заалнууд' },
    { href: '/admin/audit', icon: '📋', label: 'Аудит' },
    { href: '/admin/settings', icon: '⚙️', label: 'Тохиргоо' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString('mn-MN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <Link href={stat.href} className="block">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm mt-1 opacity-80">{stat.icon} {stat.label}</p>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Хурдан хандалт</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="font-medium text-gray-800 text-sm">{link.label}</span>
            <span className="ml-auto text-gray-400 text-sm">→</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's sessions */}
        <TodaysSessions />

        {/* Leaderboard preview */}
        {(topLeaders?.length ?? 0) > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">🌿 Ногоон жагсаалт (Top 5)</h2>
              <Link href="/admin/stats" className="text-sm text-blue-600 hover:underline">Дэлгэрэнгүй</Link>
            </div>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-600">#</th>
                    <th className="text-left p-3 font-semibold text-gray-600">Нэр</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Алхам</th>
                    <th className="text-right p-3 font-semibold text-gray-600">🏅</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(topLeaders ?? []).map((entry, idx) => (
                    <tr key={entry.user_id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-500 font-bold">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </td>
                      <td className="p-3 text-gray-800">{entry.full_name ?? 'Нэргүй'}</td>
                      <td className="p-3 text-right text-green-700 font-semibold">
                        {entry.total_steps.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-amber-600">
                        {entry.badge_count > 0 ? `×${entry.badge_count}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

async function TodaysSessions() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: sessions } = await supabase
    .from('event_sessions')
    .select('id, title, starts_at, ends_at, registered_count, capacity, is_published, venue:venues(name)')
    .gte('starts_at', today + 'T00:00:00Z')
    .lte('starts_at', today + 'T23:59:59Z')
    .order('starts_at')
    .limit(10);

  if (!sessions || sessions.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">📅 Өнөөдрийн хөтөлбөр</h2>
        <Link href="/admin/programme" className="text-sm text-blue-600 hover:underline">Бүгд</Link>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-600">Гарчиг</th>
              <th className="text-left p-3 font-semibold text-gray-600">Цаг</th>
              <th className="text-left p-3 font-semibold text-gray-600">Бүртгэл</th>
              <th className="text-left p-3 font-semibold text-gray-600">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <Link href={`/admin/programme/${s.id}/edit`} className="text-blue-600 hover:underline font-medium text-xs">
                    {s.title}
                  </Link>
                </td>
                <td className="p-3 text-gray-600 text-xs">
                  {new Date(s.starts_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-3 text-gray-600 text-xs">
                  {s.capacity > 0 ? `${s.registered_count}/${s.capacity}` : s.registered_count}
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.is_published ? '✓' : 'Драфт'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
