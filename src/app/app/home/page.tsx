import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

function getDayLabel() {
  return new Date().toLocaleDateString('mn-MN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

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

  // Get today's highlight (first keynote or first session of the day)
  const { data: highlightSession } = await supabase
    .from('event_sessions')
    .select('id, title, starts_at, session_type, venue:venues(name)')
    .eq('is_published', true)
    .gte('starts_at', today + 'T00:00:00Z')
    .lte('starts_at', today + 'T23:59:59Z')
    .eq('session_type', 'keynote')
    .order('starts_at')
    .limit(1)
    .maybeSingle();

  const quickLinks = [
    {
      href: '/app/programme',
      icon: '📅',
      title: 'Хөтөлбөр',
      description: `Өнөөдөр ${todaySessions ?? 0} арга хэмжаа`,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      titleColor: 'text-blue-800',
      iconBg: 'bg-blue-100',
    },
    {
      href: '/app/programme/agenda',
      icon: '⭐',
      title: 'Миний хөтөлбөр',
      description: 'Таны хадгалсан арга хэмжаанууд',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      hoverColor: 'hover:bg-yellow-100',
      titleColor: 'text-yellow-800',
      iconBg: 'bg-yellow-100',
    },
    {
      href: '/app/map',
      icon: '🗺️',
      title: 'Газрын зураг',
      description: 'Арга хэмжааны газрын зураг',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100',
      titleColor: 'text-green-800',
      iconBg: 'bg-green-100',
    },
    {
      href: '/app/notifications',
      icon: '🔔',
      title: 'Мэдэгдлүүд',
      description: `${notifCount ?? 0} мэдэгдэл байна`,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:bg-purple-100',
      titleColor: 'text-purple-800',
      iconBg: 'bg-purple-100',
    },
    {
      href: '/app/green',
      icon: '🌿',
      title: 'Ногоон оролцоо',
      description: 'Алхам бүртгэж байгаль хамгаал',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      hoverColor: 'hover:bg-emerald-100',
      titleColor: 'text-emerald-800',
      iconBg: 'bg-emerald-100',
    },
    {
      href: '/app/complaints',
      icon: '📣',
      title: 'Санал хүсэлт',
      description: 'Санал, гомдлоо илгээх',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hoverColor: 'hover:bg-orange-100',
      titleColor: 'text-orange-800',
      iconBg: 'bg-orange-100',
    },
  ];

  const firstName = profileName ? profileName.split(' ')[0] : '';

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Hero greeting card */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-100 text-sm mb-1">{getDayLabel()}</p>
            <h1 className="text-2xl font-bold leading-tight">
              {firstName ? `Сайн байна уу, ${firstName}! 👋` : 'Тавтай морилно уу! 👋'}
            </h1>
            <p className="text-green-100 text-sm mt-2">
              Арга хэмжааний дижитал платформд тавтай морилно уу
            </p>
          </div>
          <div className="text-4xl opacity-80">🌿</div>
        </div>

        {/* Quick stats row */}
        <div className="mt-5 flex gap-3">
          <div className="flex-1 bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold">{todaySessions ?? 0}</p>
            <p className="text-green-100 text-xs mt-0.5">Өнөөдрийн арга хэмжаа</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold">{notifCount ?? 0}</p>
            <p className="text-green-100 text-xs mt-0.5">Шинэ мэдэгдэл</p>
          </div>
        </div>
      </div>

      {/* Today's highlight banner */}
      {highlightSession && (
        <Link
          href={`/app/programme/${highlightSession.id}`}
          className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100 transition-colors shadow-sm"
        >
          <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
            🌟
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-0.5">
              Өнөөдрийн онцлох
            </p>
            <p className="font-semibold text-amber-900 truncate">{highlightSession.title}</p>
            <p className="text-xs text-amber-600 mt-0.5">
              🕐 {new Date(highlightSession.starts_at).toLocaleTimeString('mn-MN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {highlightSession.venue && ` · 📍 ${highlightSession.venue.name}`}
            </p>
          </div>
          <span className="text-amber-400 flex-shrink-0">→</span>
        </Link>
      )}

      {/* Quick links — 2-column grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Цэс</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col gap-3 p-4 rounded-2xl border transition-colors shadow-sm ${link.bgColor} ${link.borderColor} ${link.hoverColor}`}
            >
              <div className={`w-11 h-11 ${link.iconBg} rounded-xl flex items-center justify-center text-2xl`}>
                {link.icon}
              </div>
              <div>
                <p className={`font-semibold text-sm leading-tight ${link.titleColor}`}>{link.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming sessions today */}
      {(todaySessions ?? 0) > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Өнөөдрийн арга хэмжаанууд
            </h2>
            <Link href="/app/programme" className="text-xs text-green-600 font-medium hover:underline">
              Бүгдийг харах →
            </Link>
          </div>
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

  const TYPE_BORDER: Record<string, string> = {
    keynote: 'border-l-purple-500',
    workshop: 'border-l-blue-500',
    panel: 'border-l-orange-500',
    general: 'border-l-green-500',
    exhibition: 'border-l-teal-500',
    networking: 'border-l-pink-500',
    other: 'border-l-gray-400',
  };

  return (
    <div className="space-y-2">
      {sessions.map((s) => {
        const borderColor = TYPE_BORDER[s.session_type] ?? TYPE_BORDER.other;
        return (
          <Link
            key={s.id}
            href={`/app/programme/${s.id}`}
            className={`flex items-center gap-3 bg-white rounded-xl border border-l-4 ${borderColor} p-3 hover:shadow-md transition-shadow`}
          >
            <div className="text-center flex-shrink-0 w-12">
              <p className="text-xs font-bold text-gray-700">
                {new Date(s.starts_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(s.ends_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
              {s.venue && <p className="text-xs text-gray-500 mt-0.5">📍 {s.venue.name}</p>}
            </div>
            <span className="text-gray-400 flex-shrink-0">→</span>
          </Link>
        );
      })}
    </div>
  );
}
