import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Quick stats
  const today = new Date().toISOString().split('T')[0];

  const [
    { count: totalUsers },
    { count: pendingVip },
    { count: todaySessions },
    { count: totalNotifications },
    { count: totalSpeakers },
    { count: totalVenues },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('vip_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('event_sessions').select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .gte('starts_at', today + 'T00:00:00Z')
      .lte('starts_at', today + 'T23:59:59Z'),
    supabase.from('notifications').select('*', { count: 'exact', head: true }),
    supabase.from('speakers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('venues').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  const stats = [
    { label: 'Нийт хэрэглэгч', value: totalUsers ?? 0, icon: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: 'VIP хүлээгдэж буй', value: pendingVip ?? 0, icon: '⏳', color: 'bg-orange-50 text-orange-700', href: '/admin/users' },
    { label: 'Өнөөдрийн арга хэмжаа', value: todaySessions ?? 0, icon: '📅', color: 'bg-green-50 text-green-700', href: '/admin/programme' },
    { label: 'Илтгэгчид', value: totalSpeakers ?? 0, icon: '🎤', color: 'bg-purple-50 text-purple-700', href: '/admin/speakers' },
    { label: 'Заалнууд', value: totalVenues ?? 0, icon: '🏛️', color: 'bg-gray-50 text-gray-700', href: '/admin/venues' },
    { label: 'Мэдэгдлүүд', value: totalNotifications ?? 0, icon: '🔔', color: 'bg-pink-50 text-pink-700', href: '/admin/notifications' },
  ];

  const quickLinks = [
    { href: '/admin/users', icon: '👥', label: 'Хэрэглэгчид' },
    { href: '/admin/programme', icon: '📅', label: 'Хөтөлбөр' },
    { href: '/admin/speakers', icon: '🎤', label: 'Илтгэгчид' },
    { href: '/admin/venues', icon: '🏛️', label: 'Заалнууд' },
    { href: '/admin/notifications', icon: '🔔', label: 'Мэдэгдэл' },
    { href: '/admin/audit', icon: '📋', label: 'Аудит' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            {stat.href ? (
              <Link href={stat.href} className="block">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm mt-1 opacity-80">{stat.icon} {stat.label}</p>
              </Link>
            ) : (
              <>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm mt-1 opacity-80">{stat.icon} {stat.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Хурдан хандалт</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="font-medium text-gray-800">{link.label}</span>
            <span className="ml-auto text-gray-400 text-sm">→</span>
          </Link>
        ))}
      </div>

      {/* Today's sessions */}
      {(todaySessions ?? 0) > 0 && <TodaysSessions />}
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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Өнөөдрийн хөтөлбөр</h2>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-600">Гарчиг</th>
              <th className="text-left p-3 font-semibold text-gray-600">Цаг</th>
              <th className="text-left p-3 font-semibold text-gray-600">Заал</th>
              <th className="text-left p-3 font-semibold text-gray-600">Бүртгэл</th>
              <th className="text-left p-3 font-semibold text-gray-600">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <Link href={`/admin/programme/${s.id}/edit`} className="text-blue-600 hover:underline font-medium">
                    {s.title}
                  </Link>
                </td>
                <td className="p-3 text-gray-600 text-xs">
                  {new Date(s.starts_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-3 text-gray-600">{s.venue?.name ?? '—'}</td>
                <td className="p-3 text-gray-600">
                  {s.capacity > 0 ? `${s.registered_count} / ${s.capacity}` : s.registered_count}
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.is_published ? 'Нийтлэгдсэн' : 'Драфт'}
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
