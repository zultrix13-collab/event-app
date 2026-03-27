import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

const SESSION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  keynote: { label: 'Keynote', color: 'bg-yellow-100 text-yellow-800' },
  workshop: { label: 'Workshop', color: 'bg-blue-100 text-blue-800' },
  panel: { label: 'Panel', color: 'bg-purple-100 text-purple-800' },
  exhibition: { label: 'Exhibition', color: 'bg-green-100 text-green-800' },
  networking: { label: 'Networking', color: 'bg-pink-100 text-pink-800' },
  general: { label: 'General', color: 'bg-gray-100 text-gray-800' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800' },
};

const ZONE_LABELS: Record<string, { label: string; color: string }> = {
  green: { label: '🟢 Green', color: 'bg-green-50 text-green-700 border border-green-200' },
  blue: { label: '🔵 Blue', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  both: { label: '🟢🔵 Both', color: 'bg-gray-50 text-gray-700 border border-gray-200' },
};

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
}

export default async function ProgrammePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get published sessions
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

  // Get user registrations
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

  // Get distinct dates
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📅 Хөтөлбөр</h1>
        <Link href="/app/programme/agenda" className="text-sm text-blue-600 hover:underline">
          ⭐ Миний хөтөлбөр
        </Link>
      </div>

      {/* Date tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {dates.map((d) => (
          <Link
            key={d}
            href={`/app/programme?date=${d}`}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              d === activeDate
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {new Date(d + 'T00:00:00').toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })}
          </Link>
        ))}
      </div>

      {/* Sessions */}
      {!sessions || sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-2">📋</p>
          <p>Энэ өдрийн хөтөлбөр хоосон байна</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const typeInfo = SESSION_TYPE_LABELS[session.session_type] ?? SESSION_TYPE_LABELS.general;
            const zoneInfo = ZONE_LABELS[session.zone] ?? ZONE_LABELS.green;
            const regStatus = registrations[session.id];
            const inAgenda = agendaSet.has(session.id);
            const isFull = session.capacity > 0 && session.registered_count >= session.capacity;

            return (
              <div key={session.id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/app/programme/${session.id}`} className="block p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${zoneInfo.color}`}>
                          {zoneInfo.label}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">{session.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        🕐 {formatTime(session.starts_at)} – {formatTime(session.ends_at)}
                        {session.venue && <span> · 📍 {session.venue.name}</span>}
                      </p>

                      {/* Speaker avatars */}
                      {session.session_speakers?.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {session.session_speakers.slice(0, 3).map((ss: { speaker: { id: string; full_name: string; avatar_url: string | null } | null }) => (
                            ss.speaker && (
                              <div
                                key={ss.speaker.id}
                                className="w-7 h-7 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium overflow-hidden"
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
                          {session.session_speakers.length > 3 && (
                            <span className="text-xs text-gray-500">+{session.session_speakers.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* Capacity bar */}
                      {session.capacity > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>{session.registered_count} / {session.capacity} суудал</span>
                            {isFull && <span className="text-orange-600 font-medium">Дүүрсэн</span>}
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${isFull ? 'bg-orange-400' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min((session.registered_count / session.capacity) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Action buttons */}
                {user && (
                  <div className="px-4 pb-4 flex gap-2">
                    <form action={`/app/programme/${session.id}`}>
                      {regStatus === 'confirmed' ? (
                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 text-green-700">
                          ✓ Бүртгүүлсэн
                        </span>
                      ) : regStatus === 'waitlisted' ? (
                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-100 text-orange-700">
                          ⏳ Хүлээлгийн жагсаалт
                        </span>
                      ) : (
                        <Link
                          href={`/app/programme/${session.id}`}
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            isFull
                              ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isFull ? '⏳ Хүлээлгийн жагсаалт' : '+ Бүртгүүлэх'}
                        </Link>
                      )}
                    </form>

                    <Link
                      href={`/app/programme/${session.id}`}
                      className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        inAgenda
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
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
