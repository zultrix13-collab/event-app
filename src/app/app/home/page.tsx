import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AppHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileName = '';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single();
    profileName = profile?.full_name ?? user.email ?? '';
  }

  // Quick stats
  const today = new Date().toISOString().split('T')[0];
  const { count: todaySessions } = await supabase
    .from('event_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)
    .gte('starts_at', today + 'T00:00:00Z')
    .lte('starts_at', today + 'T23:59:59Z');

  const { count: notifCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true });

  const quickLinks = [
    {
      href: '/app/programme',
      icon: '📅',
      title: 'Хөтөлбөр',
      description: `Өнөөдөр ${todaySessions ?? 0} арга хэмжаа`,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      titleColor: 'text-blue-800',
    },
    {
      href: '/app/programme/agenda',
      icon: '⭐',
      title: 'Миний хөтөлбөр',
      description: 'Таны хадгалсан арга хэмжаанууд',
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
      titleColor: 'text-yellow-800',
    },
    {
      href: '/app/map',
      icon: '🗺️',
      title: 'Газрын зураг',
      description: 'Арга хэмжааны газрын зураг харах',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      titleColor: 'text-green-800',
    },
    {
      href: '/app/notifications',
      icon: '🔔',
      title: 'Мэдэгдлүүд',
      description: `${notifCount ?? 0} мэдэгдэл байна`,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      titleColor: 'text-purple-800',
    },
    {
      href: '/app/green',
      icon: '🌿',
      title: 'Ногоон оролцоо',
      description: 'Алхам бүртгэж байгаль хамгаал',
      color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
      titleColor: 'text-emerald-800',
    },
    {
      href: '/app/complaints',
      icon: '📣',
      title: 'Санал хүсэлт',
      description: 'Санал, гомдлоо илгээх',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      titleColor: 'text-orange-800',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Тавтай морилно уу{profileName ? `, ${profileName.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Арга хэмжааний дижитал платформд тавтай морилно уу</p>
      </div>

      {/* Quick links */}
      <div className="space-y-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${link.color}`}
          >
            <span className="text-3xl flex-shrink-0">{link.icon}</span>
            <div>
              <p className={`font-semibold ${link.titleColor}`}>{link.title}</p>
              <p className="text-sm text-gray-600">{link.description}</p>
            </div>
            <span className="ml-auto text-gray-400">→</span>
          </Link>
        ))}
      </div>

      {/* Upcoming today */}
      {(todaySessions ?? 0) > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Өнөөдрийн арга хэмжаанууд</h2>
          <UpcomingSessions />
        </div>
      )}
    </div>
  );
}

async function UpcomingSessions() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: sessions } = await supabase
    .from('event_sessions')
    .select('id, title, starts_at, ends_at, session_type, venue:venues(name)')
    .eq('is_published', true)
    .gte('starts_at', today + 'T00:00:00Z')
    .lte('starts_at', today + 'T23:59:59Z')
    .order('starts_at')
    .limit(5);

  if (!sessions || sessions.length === 0) return null;

  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <Link
          key={s.id}
          href={`/app/programme/${s.id}`}
          className="flex items-center gap-3 bg-white rounded-xl border p-3 hover:shadow-sm transition-shadow"
        >
          <div className="text-xs text-gray-500 w-12 flex-shrink-0 text-center">
            {new Date(s.starts_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
            {s.venue && <p className="text-xs text-gray-500">{s.venue.name}</p>}
          </div>
        </Link>
      ))}
      <Link href="/app/programme" className="block text-center text-sm text-blue-600 hover:underline pt-1">
        Бүх хөтөлбөр харах →
      </Link>
    </div>
  );
}
