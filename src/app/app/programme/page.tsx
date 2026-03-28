import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

const SESSION_TYPE_CONFIG: Record<string, { label: string; badge: string; border: string }> = {
  keynote: {
    label: 'Keynote',
    badge: 'bg-purple-100 text-purple-800',
    border: 'border-l-purple-500',
  },
  workshop: {
    label: 'Workshop',
    badge: 'bg-blue-100 text-blue-800',
    border: 'border-l-blue-500',
  },
  panel: {
    label: 'Panel',
    badge: 'bg-orange-100 text-orange-800',
    border: 'border-l-orange-500',
  },
  exhibition: {
    label: 'Exhibition',
    badge: 'bg-teal-100 text-teal-800',
    border: 'border-l-teal-500',
  },
  networking: {
    label: 'Networking',
    badge: 'bg-pink-100 text-pink-800',
    border: 'border-l-pink-500',
  },
  general: {
    label: 'General',
    badge: 'bg-green-100 text-green-800',
    border: 'border-l-green-500',
  },
  other: {
    label: 'Other',
    badge: 'bg-gray-100 text-gray-800',
    border: 'border-l-gray-400',
  },
};

const ZONE_CONFIG: Record<string, { label: string; badge: string }> = {
  green: { label: '🟢 Green', badge: 'bg-green-50 text-green-700 border border-green-200' },
  blue: { label: '🔵 Blue', badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
  both: { label: '🟢🔵 Both', badge: 'bg-gray-50 text-gray-700 border border-gray-200' },
};

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(start: string, end: string) {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}ц ${m}м` : `${h} цаг`;
}

export default async function ProgrammePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('event_sessions')
    .select(`
      *,
      venue:venues(id, name, name_en, capacity, location, floor),
      session_speakers(
        role,
        speaker:speakers(id, full_name, full_name_en, avatar_url)
      )
    `)
    .eq('is_published', true)
    .order('starts_at', { ascending: true });

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query = query.gte('starts_at', start.toISOString()).lte('starts_at', end.toISOString());
  }

  const { data: sessions } = await query;

  let registrations: Record<string, string> = {};
  let agendaSet: Set<string> = new Set();

  if (user) {
    const { data: regs } = await supabase
      .from('seat_registrations')
      .select('session_id, status')
      .eq('user_id', user.id)
      .neq('status', 'cancelled');

    const { data: agenda } = await supabase
      .from('user_agenda')
      .select('session_id')
      .eq('user_id', user.id);

    registrations = Object.fromEntries((regs ?? []).map((r) => [r.session_id, r.status]));
    agendaSet = new Set((agenda ?? []).map((a) => a.session_id));
  }

  const { data: allSessions } = await supabase
    .from('event_sessions')
    .select('starts_at')
    .eq('is_published', true)
    .order('starts_at');

  const dates = [...new Set((allSessions ?? []).map((s) =>
    new Date(s.starts_at).toISOString().split('T')[0]
  ))];

  const activeDate = date ?? dates[0] ?? new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">📅 Хөтөлбөр</h1>
        <Link
          href="/app/programme/agenda"
          className="flex items-center gap-1.5 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-full hover:bg-yellow-100 transition-colors"
        >
          ⭐ Миний хөтөлбөр
        </Link>
      </div>

      {/* Date filter — pill-shaped, horizontally scrollable */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {dates.map((d) => {
          const isActive = d === activeDate;
          return (
            <Link
              key={d}
              href={`/app/programme?date=${d}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
                isActive
                  ? 'bg-green-600 text-white shadow-green-200 shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700'
              }`}
            >
              {new Date(d + 'T00:00:00').toLocaleDateString('mn-MN', {
                month: 'short',
                day: 'numeric',
              })}
            </Link>
          );
        })}
      </div>

      {/* Sessions list */}
      {!sessions || sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium text-gray-700">Хөтөлбөр хоосон байна</p>
          <p className="text-sm text-gray-400 mt-1">Энэ өдөрт арга хэмжаа нэмэгдээгүй байна</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const typeConfig = SESSION_TYPE_CONFIG[session.session_type] ?? SESSION_TYPE_CONFIG.other;
            const zoneConfig = ZONE_CONFIG[session.zone] ?? ZONE_CONFIG.green;
            const regStatus = registrations[session.id];
            const inAgenda = agendaSet.has(session.id);
            const fillPct = session.capacity > 0
              ? Math.min(100, Math.round((session.registered_count / session.capacity) * 100))
              : 0;
            const isFull = session.capacity > 0 && session.registered_count >= session.capacity;
            const isAlmostFull = fillPct >= 80 && !isFull;

            return (
              <div
                key={session.id}
                className={`bg-white rounded-2xl border border-l-4 ${typeConfig.border} shadow-sm hover:shadow-md transition-shadow`}
              >
                <Link href={`/app/programme/${session.id}`} className="block p-4">
                  {/* Time row — prominent */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-800">
                        {formatTime(session.starts_at)}
                      </span>
                      <span className="text-gray-300">–</span>
                      <span className="text-xs text-gray-500">{formatTime(session.ends_at)}</span>
                      <span className="text-xs text-gray-400 ml-1">({formatDuration(session.starts_at, session.ends_at)})</span>
                    </div>
                    {session.venue && (
                      <span className="text-xs text-gray-500 truncate">📍 {session.venue.name}</span>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeConfig.badge}`}>
                      {typeConfig.label}
                    </span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${zoneConfig.badge}`}>
                      {zoneConfig.label}
                    </span>
                    {inAgenda && (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        ⭐ Хөтөлбөрт
                      </span>
                    )}
                    {regStatus === 'confirmed' && (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        ✓ Бүртгүүлсэн
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 text-base leading-snug">{session.title}</h3>

                  {/* Speakers */}
                  {session.session_speakers?.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex -space-x-2">
                        {session.session_speakers.slice(0, 4).map((ss: { speaker: { id: string; full_name: string; avatar_url: string | null } | null }) => (
                          ss.speaker && (
                            <div
                              key={ss.speaker.id}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-sm"
                              title={ss.speaker.full_name}
                            >
                              {ss.speaker.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={ss.speaker.avatar_url} alt={ss.speaker.full_name} className="w-full h-full object-cover" />
                              ) : (
                                ss.speaker.full_name[0]
                              )}
                            </div>
                          )
                        ))}
                        {session.session_speakers.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                            +{session.session_speakers.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {session.session_speakers
                          .slice(0, 2)
                          .map((ss: { speaker: { full_name: string } | null }) => ss.speaker?.full_name)
                          .filter(Boolean)
                          .join(', ')}
                        {session.session_speakers.length > 2 && ` +${session.session_speakers.length - 2}`}
                      </span>
                    </div>
                  )}

                  {/* Capacity bar */}
                  {session.capacity > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-500">{session.registered_count} / {session.capacity} суудал</span>
                        {isFull ? (
                          <span className="font-semibold text-red-600">🔴 Дүүрсэн</span>
                        ) : isAlmostFull ? (
                          <span className="font-semibold text-yellow-600">🟡 Бараг дүүрсэн</span>
                        ) : (
                          <span className="text-green-600">🟢 Суудал байна</span>
                        )}
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isFull ? 'bg-red-500' : isAlmostFull ? 'bg-yellow-400' : 'bg-green-500'
                          }`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Link>

                {/* Action buttons */}
                {user && (
                  <div className="px-4 pb-4 flex gap-2 border-t border-gray-50 pt-3">
                    {regStatus === 'confirmed' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        ✓ Бүртгүүлсэн
                      </span>
                    ) : regStatus === 'waitlisted' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                        ⏳ Хүлээлгийн жагсаалт
                      </span>
                    ) : (
                      <Link
                        href={`/app/programme/${session.id}`}
                        className={`inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                          isFull
                            ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                            : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                        }`}
                      >
                        {isFull ? '⏳ Жагсаалтад нэмэгдэх' : '+ Бүртгүүлэх'}
                      </Link>
                    )}

                    <Link
                      href={`/app/programme/${session.id}`}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                        inAgenda
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {inAgenda ? '⭐ Нэмсэн' : '☆ Хөтөлбөрт нэмэх'}
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
