import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionAttendees } from '@/modules/specialist/actions';
import { CheckinActions } from './checkin-actions';

type SessionWithVenue = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  registered_count: number;
  venue_id: string | null;
  venues: { name: string } | null;
};

type AttendeeProfile = {
  full_name: string | null;
  email: string | null;
  organization: string | null;
};

export const dynamic = 'force-dynamic';

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function SpecialistCheckinPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { sessionId } = await params;
  const { q } = await searchParams;

  const supabase = await createClient();

  const { data: session } = await supabase
    .from('event_sessions')
    .select(`
      id,
      title,
      starts_at,
      ends_at,
      capacity,
      registered_count,
      venue_id,
      venues ( name )
    `)
    .eq('id', sessionId)
    .maybeSingle();

  if (!session) {
    notFound();
  }

  const attendees = await getSessionAttendees(sessionId);
  const venue = (session as SessionWithVenue).venues;

  // Filter by search query
  const filtered = q
    ? attendees.filter((a) => {
        const p = (a as typeof a & { profiles: AttendeeProfile | null }).profiles;
        const name = (p?.full_name ?? '').toLowerCase();
        const email = (p?.email ?? '').toLowerCase();
        const query = q.toLowerCase();
        return name.includes(query) || email.includes(query);
      })
    : attendees;

  const checkedInCount = attendees.filter((a) => a.attendance !== null).length;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/specialist/dashboard"
        className="inline-flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 transition-colors"
      >
        ← Самбар руу буцах
      </Link>

      {/* Session Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h1 className="text-xl font-bold text-gray-900 mb-2">{session.title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          <span>
            🕐 {formatTime(session.starts_at)} – {formatTime(session.ends_at)}
          </span>
          {venue?.name && <span>📍 {venue.name}</span>}
          <span>
            👥 {session.registered_count} / {session.capacity} бүртгэгдсэн
          </span>
          <span className="font-medium text-green-700">
            ✅ {checkedInCount} check-in хийсэн
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Check-in явц</span>
            <span>
              {attendees.length > 0
                ? Math.round((checkedInCount / attendees.length) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${
                  attendees.length > 0
                    ? (checkedInCount / attendees.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="relative">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ''}
          placeholder="Нэр эсвэл имэйлээр хайх..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        {q && (
          <Link
            href={`/specialist/checkin/${sessionId}`}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
          >
            ✕
          </Link>
        )}
      </form>

      {/* Attendees List */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">
          Бүртгэлтэй оролцогчид{' '}
          {q && (
            <span className="text-sm font-normal text-gray-400">
              — "{q}" хайлтын үр дүн: {filtered.length}
            </span>
          )}
        </h2>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            {q ? 'Хайлтад тохирох оролцогч олдсонгүй' : 'Бүртгэлтэй оролцогч байхгүй байна'}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {filtered.map((attendee) => {
              const p = (attendee as typeof attendee & { profiles: AttendeeProfile | null }).profiles;
              const isCheckedIn = attendee.attendance !== null;

              return (
                <div
                  key={attendee.id}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${
                      isCheckedIn ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    {isCheckedIn ? '✅' : '⏳'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {p?.full_name ?? 'Нэргүй'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {p?.email ?? ''}
                      {p?.organization ? ` · ${p.organization}` : ''}
                    </p>
                    {isCheckedIn && attendee.attendance && (
                      <p className="text-xs text-green-600 mt-0.5">
                        {new Date(attendee.attendance.checked_in_at).toLocaleTimeString('mn-MN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        бүртгэгдсэн ({attendee.attendance.check_in_method})
                      </p>
                    )}
                  </div>

                  {!isCheckedIn && (
                    <CheckinActions
                      sessionId={sessionId}
                      userId={attendee.user_id}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
