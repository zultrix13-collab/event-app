import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  registerForSession,
  cancelRegistration,
  addToAgenda,
  removeFromAgenda,
  submitSurvey,
} from '@/modules/programme/actions';

const SESSION_TYPE_CONFIG: Record<string, { label: string; badge: string; heroBg: string }> = {
  keynote: {
    label: 'Keynote',
    badge: 'bg-purple-100 text-purple-800 border border-purple-200',
    heroBg: 'from-purple-600 to-purple-800',
  },
  workshop: {
    label: 'Workshop',
    badge: 'bg-blue-100 text-blue-800 border border-blue-200',
    heroBg: 'from-blue-600 to-blue-800',
  },
  panel: {
    label: 'Panel',
    badge: 'bg-orange-100 text-orange-800 border border-orange-200',
    heroBg: 'from-orange-500 to-orange-700',
  },
  exhibition: {
    label: 'Exhibition',
    badge: 'bg-teal-100 text-teal-800 border border-teal-200',
    heroBg: 'from-teal-600 to-teal-800',
  },
  networking: {
    label: 'Networking',
    badge: 'bg-pink-100 text-pink-800 border border-pink-200',
    heroBg: 'from-pink-500 to-pink-700',
  },
  general: {
    label: 'General',
    badge: 'bg-green-100 text-green-800 border border-green-200',
    heroBg: 'from-green-600 to-green-800',
  },
  other: {
    label: 'Other',
    badge: 'bg-gray-100 text-gray-800 border border-gray-200',
    heroBg: 'from-gray-600 to-gray-800',
  },
};

const ZONE_CONFIG: Record<string, { label: string; badge: string }> = {
  green: { label: '🟢 Green Zone', badge: 'bg-green-100 text-green-700 border border-green-300' },
  blue: { label: '🔵 Blue Zone', badge: 'bg-blue-100 text-blue-700 border border-blue-300' },
  both: { label: '🟢🔵 Аль ч талд', badge: 'bg-gray-100 text-gray-700 border border-gray-300' },
};

const COUNTRY_FLAGS: Record<string, string> = {
  MN: '🇲🇳', US: '🇺🇸', CN: '🇨🇳', JP: '🇯🇵', KR: '🇰🇷', DE: '🇩🇪',
  GB: '🇬🇧', FR: '🇫🇷', RU: '🇷🇺', IN: '🇮🇳', AU: '🇦🇺', CA: '🇨🇦',
};

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('mn-MN', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(start: string, end: string) {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 60) return `${mins} минут`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h} цаг ${m} минут` : `${h} цаг`;
}

export default async function SessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { lang } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: session } = await supabase
    .from('event_sessions')
    .select(`
      *,
      venue:venues(*),
      session_speakers(
        role,
        sort_order,
        speaker:speakers(*)
      )
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (!session) notFound();

  let regStatus: string | null = null;
  let inAgenda = false;
  let checkedIn = false;
  const sessionEnded = new Date(session.ends_at) < new Date();

  if (user) {
    const { data: reg } = await supabase
      .from('seat_registrations')
      .select('status')
      .eq('session_id', id)
      .eq('user_id', user.id)
      .single();
    regStatus = reg?.status ?? null;

    const { data: agenda } = await supabase
      .from('user_agenda')
      .select('user_id')
      .eq('session_id', id)
      .eq('user_id', user.id)
      .single();
    inAgenda = !!agenda;

    const { data: attendance } = await supabase
      .from('attendance')
      .select('id')
      .eq('session_id', id)
      .eq('user_id', user.id)
      .single();
    checkedIn = !!attendance;
  }

  const showEN = lang === 'en';
  const title = showEN && session.title_en ? session.title_en : session.title;
  const description = showEN && session.description_en ? session.description_en : session.description;
  const isFull = session.capacity > 0 && session.registered_count >= session.capacity;

  const fillPct = session.capacity > 0
    ? Math.min(100, Math.round((session.registered_count / session.capacity) * 100))
    : 0;
  const isAlmostFull = fillPct >= 80 && !isFull;

  const typeConfig = SESSION_TYPE_CONFIG[session.session_type] ?? SESSION_TYPE_CONFIG.other;
  const zoneConfig = ZONE_CONFIG[session.zone] ?? ZONE_CONFIG.green;

  const sortedSpeakers = (session.session_speakers ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Back */}
      <Link href="/app/programme" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        ← Хөтөлбөр
      </Link>

      {/* Hero section */}
      <div className={`bg-gradient-to-br ${typeConfig.heroBg} rounded-2xl p-6 text-white shadow-lg`}>
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/25 text-white backdrop-blur-sm">
            {typeConfig.label}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/25 text-white backdrop-blur-sm">
            {zoneConfig.label}
          </span>
          {regStatus === 'confirmed' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-400/40 text-white">
              ✓ Бүртгүүлсэн
            </span>
          )}
          {inAgenda && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/40 text-white">
              ⭐ Хөтөлбөрт
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold leading-snug mb-4">{title}</h1>

        {/* Time & venue */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <span>🕐</span>
            <span>
              {formatDateTime(session.starts_at)} – {new Date(session.ends_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-white/60 text-xs">({formatDuration(session.starts_at, session.ends_at)})</span>
          </div>
          {session.venue && (
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <span>📍</span>
              <span>
                {showEN && session.venue.name_en ? session.venue.name_en : session.venue.name}
                {session.venue.floor != null && ` · ${session.venue.floor}-р давхар`}
                {session.venue.location && ` · ${session.venue.location}`}
              </span>
            </div>
          )}
        </div>

        {/* Language toggle */}
        <div className="flex gap-1 mt-4">
          <Link
            href={`/app/programme/${id}`}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              !showEN ? 'bg-white text-gray-800' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            МН
          </Link>
          <Link
            href={`/app/programme/${id}?lang=en`}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              showEN ? 'bg-white text-gray-800' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            EN
          </Link>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-2">📝 Тайлбар</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{description}</p>

          {(session.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">
              {(session.tags ?? []).map((tag: string) => (
                <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Capacity — visually prominent */}
      {session.capacity > 0 && (
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-3">🪑 Суудлын мэдээлэл</h2>
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-3xl font-bold text-gray-900">{session.registered_count}</span>
              <span className="text-gray-400 text-lg"> / {session.capacity}</span>
            </div>
            <div className="text-right">
              {isFull ? (
                <div>
                  <span className="text-2xl">🔴</span>
                  <p className="text-xs font-bold text-red-600 mt-1">Суудал дүүрсэн</p>
                </div>
              ) : isAlmostFull ? (
                <div>
                  <span className="text-2xl">🟡</span>
                  <p className="text-xs font-bold text-yellow-600 mt-1">Бараг дүүрсэн ({fillPct}%)</p>
                </div>
              ) : (
                <div>
                  <span className="text-2xl">🟢</span>
                  <p className="text-xs font-bold text-green-600 mt-1">Суудал байна</p>
                </div>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-700 ${
                isFull ? 'bg-red-500' : isAlmostFull ? 'bg-yellow-400' : 'bg-green-500'
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          {isFull && (
            <p className="text-xs text-red-600 mt-2 font-medium">
              💡 Суудал дүүрсэн боловч хүлээлгийн жагсаалтад нэмэгдэх боломжтой
            </p>
          )}
        </div>
      )}

      {/* Speakers */}
      {sortedSpeakers.length > 0 && (
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">🎤 Илтгэгчид</h2>
          <div className="space-y-4">
            {sortedSpeakers.map((ss: {
              role: string;
              speaker: {
                id: string;
                full_name: string;
                full_name_en: string | null;
                title: string | null;
                title_en: string | null;
                organization: string | null;
                organization_en: string | null;
                avatar_url: string | null;
                country: string | null;
              } | null;
            }) => (
              ss.speaker && (
                <div key={ss.speaker.id} className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xl font-bold text-gray-600 overflow-hidden flex-shrink-0 shadow-sm">
                    {ss.speaker.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ss.speaker.avatar_url} alt={ss.speaker.full_name} className="w-full h-full object-cover" />
                    ) : (
                      ss.speaker.full_name[0]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900">
                        {showEN && ss.speaker.full_name_en ? ss.speaker.full_name_en : ss.speaker.full_name}
                      </p>
                      {ss.speaker.country && (
                        <span className="text-lg" title={ss.speaker.country}>
                          {COUNTRY_FLAGS[ss.speaker.country] ?? '🌍'}
                        </span>
                      )}
                    </div>
                    {(ss.speaker.title || ss.speaker.title_en) && (
                      <p className="text-sm text-gray-600 mt-0.5">
                        {showEN && ss.speaker.title_en ? ss.speaker.title_en : ss.speaker.title}
                      </p>
                    )}
                    {(ss.speaker.organization || ss.speaker.organization_en) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        🏢 {showEN && ss.speaker.organization_en ? ss.speaker.organization_en : ss.speaker.organization}
                      </p>
                    )}
                    {ss.role !== 'speaker' && (
                      <span className="inline-block mt-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {ss.role}
                      </span>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {user && (
        <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-gray-900">Үйлдлүүд</h2>

          {/* Registration */}
          {session.is_registration_open && !sessionEnded && (
            <div>
              {regStatus === 'confirmed' ? (
                <form action={async () => {
                  'use server';
                  await cancelRegistration(id);
                }}>
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                    <span className="text-green-600 text-xl">✓</span>
                    <div className="flex-1">
                      <p className="font-semibold text-green-700 text-sm">Бүртгүүлсэн</p>
                      <p className="text-xs text-green-600">Та энэ арга хэмжаанд бүртгүүлсэн байна</p>
                    </div>
                    <button type="submit" className="text-xs text-red-500 hover:text-red-700 font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      Цуцлах
                    </button>
                  </div>
                </form>
              ) : regStatus === 'waitlisted' ? (
                <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <span className="text-orange-500 text-xl">⏳</span>
                  <div className="flex-1">
                    <p className="font-semibold text-orange-700 text-sm">Хүлээлгийн жагсаалтад байна</p>
                    <p className="text-xs text-orange-600">Суудал гарвал мэдэгдэх болно</p>
                  </div>
                  <form action={async () => {
                    'use server';
                    await cancelRegistration(id);
                  }}>
                    <button type="submit" className="text-xs text-red-500 hover:text-red-700 font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      Гарах
                    </button>
                  </form>
                </div>
              ) : (
                <form action={async () => {
                  'use server';
                  await registerForSession(id);
                }}>
                  <button
                    type="submit"
                    className={`w-full py-4 rounded-2xl font-bold text-base shadow-md transition-all active:scale-95 ${
                      isFull
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                    }`}
                  >
                    {isFull ? '⏳ Хүлээлгийн жагсаалтад нэмэгдэх' : '✅ Бүртгүүлэх'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Agenda */}
          <form action={async () => {
            'use server';
            if (inAgenda) {
              await removeFromAgenda(id);
            } else {
              await addToAgenda(id);
            }
          }}>
            <button
              type="submit"
              className={`w-full py-3 rounded-2xl font-semibold border transition-colors ${
                inAgenda
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {inAgenda ? '⭐ Хөтөлбөрөөс хасах' : '☆ Хөтөлбөрт нэмэх'}
            </button>
          </form>

          {/* Check-in */}
          {!sessionEnded && regStatus === 'confirmed' && (
            <Link
              href={`/app/programme/checkin/${id}`}
              className={`block w-full text-center py-3 rounded-2xl font-semibold transition-colors ${
                checkedIn
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {checkedIn ? '✓ Бүртгэгдсэн' : '📱 QR Check-in'}
            </Link>
          )}
        </div>
      )}

      {/* Survey — only after session ended */}
      {user && sessionEnded && (
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-3">⭐ Үнэлгээ өгөх</h2>
          <form action={async (formData: FormData) => {
            'use server';
            const rating = parseInt(formData.get('rating') as string);
            const feedback = formData.get('feedback') as string;
            await submitSurvey(id, rating, feedback || undefined);
          }}>
            <div className="flex gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <label key={star} className="cursor-pointer flex-1 text-center">
                  <input type="radio" name="rating" value={star} className="sr-only" required />
                  <span className="text-3xl hover:scale-125 transition-transform block">⭐</span>
                </label>
              ))}
            </div>
            <textarea
              name="feedback"
              placeholder="Сэтгэгдэл бичнэ үү (заавал биш)..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
            />
            <button
              type="submit"
              className="mt-3 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Илгээх
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
