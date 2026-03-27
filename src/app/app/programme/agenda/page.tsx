import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('mn-MN', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
}

function groupByDate<T extends { session: { starts_at: string } | null }>(items: T[]) {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    if (!item.session) continue;
    const date = new Date(item.session.starts_at).toISOString().split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  }
  return groups;
}

export default async function AgendaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: agendaItemsRaw } = await supabase
    .from('user_agenda')
    .select(`
      added_at,
      session_id,
      event_sessions!user_agenda_session_id_fkey(
        id, title, title_en, starts_at, ends_at, session_type, zone,
        venues!event_sessions_venue_id_fkey(id, name, name_en)
      )
    `)
    .eq('user_id', user.id)
    .order('added_at', { ascending: true });

  // Normalize the shape for our type
  type AgendaItem = {
    added_at: string;
    session_id: string;
    session: {
      id: string;
      title: string;
      title_en: string | null;
      starts_at: string;
      ends_at: string;
      session_type: string;
      zone: string;
      venue: { id: string; name: string; name_en: string | null } | null;
    } | null;
  };

  const agendaItems = (agendaItemsRaw ?? []).map((item) => {
    const rawSession = (item as Record<string, unknown>)['event_sessions!user_agenda_session_id_fkey'];
    const sessionArr = Array.isArray(rawSession) ? rawSession : rawSession ? [rawSession] : [];
    const s = sessionArr[0] ?? null;
    const rawVenue = s ? (s as Record<string, unknown>)['venues!event_sessions_venue_id_fkey'] : null;
    const venueArr = Array.isArray(rawVenue) ? rawVenue : rawVenue ? [rawVenue] : [];
    const v = venueArr[0] ?? null;
    return {
      added_at: item.added_at,
      session_id: item.session_id,
      session: s ? {
        id: (s as Record<string, unknown>)['id'] as string,
        title: (s as Record<string, unknown>)['title'] as string,
        title_en: ((s as Record<string, unknown>)['title_en'] as string | null) ?? null,
        starts_at: (s as Record<string, unknown>)['starts_at'] as string,
        ends_at: (s as Record<string, unknown>)['ends_at'] as string,
        session_type: (s as Record<string, unknown>)['session_type'] as string,
        zone: (s as Record<string, unknown>)['zone'] as string,
        venue: v ? {
          id: (v as Record<string, unknown>)['id'] as string,
          name: (v as Record<string, unknown>)['name'] as string,
          name_en: ((v as Record<string, unknown>)['name_en'] as string | null) ?? null,
        } : null,
      } : null,
    } as AgendaItem;
  });

  const { data: registrations } = await supabase
    .from('seat_registrations')
    .select('session_id, status')
    .eq('user_id', user.id)
    .neq('status', 'cancelled');

  const regMap = Object.fromEntries((registrations ?? []).map((r) => [r.session_id, r.status]));

  const { data: attendance } = await supabase
    .from('attendance')
    .select('session_id')
    .eq('user_id', user.id);

  const attendedSet = new Set((attendance ?? []).map((a) => a.session_id));

  const grouped = groupByDate(agendaItems);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/app/programme" className="text-sm text-blue-600 hover:underline mb-1 inline-block">
            ← Хөтөлбөр
          </Link>
          <h1 className="text-2xl font-bold">⭐ Миний хөтөлбөр</h1>
        </div>
        {agendaItems && agendaItems.length > 0 && (
          <a
            href="/api/agenda/ical"
            download="my-agenda.ics"
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📅 iCal татах
          </a>
        )}
      </div>

      {!agendaItems || agendaItems.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-2">📋</p>
          <p className="mb-4">Та одоохондоо ямар нэгэн арга хэмжээ нэмээгүй байна</p>
          <Link href="/app/programme" className="text-blue-600 hover:underline">
            Хөтөлбөр үзэх →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                {formatDate(date + 'T00:00:00')}
              </h2>
              <div className="space-y-3">
                {grouped[date].map((item) => {
                  if (!item.session) return null;
                  const s = item.session;
                  const regStatus = regMap[s.id];
                  const attended = attendedSet.has(s.id);
                  const sessionEnded = new Date(s.ends_at) < new Date();

                  return (
                    <div key={s.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-start justify-between gap-4">
                      <Link href={`/app/programme/${s.id}`} className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{s.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          🕐 {formatTime(s.starts_at)} – {formatTime(s.ends_at)}
                          {s.venue && <span> · 📍 {s.venue.name}</span>}
                        </p>
                        <div className="flex gap-2 mt-1.5">
                          {regStatus === 'confirmed' && (
                            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              ✓ Бүртгүүлсэн
                            </span>
                          )}
                          {attended && (
                            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              ✓ Ирсэн
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {!sessionEnded && regStatus === 'confirmed' && !attended && (
                          <Link
                            href={`/app/programme/checkin/${s.id}`}
                            className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-900 transition-colors text-center"
                          >
                            📱 Check-in
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
