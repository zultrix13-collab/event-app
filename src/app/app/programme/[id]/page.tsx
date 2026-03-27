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

const SESSION_TYPE_LABELS: Record<string, string> = {
  keynote: 'Keynote',
  workshop: 'Workshop',
  panel: 'Panel',
  exhibition: 'Exhibition',
  networking: 'Networking',
  general: 'General',
  other: 'Other',
};

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('mn-MN', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
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

  // User state
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

  const sortedSpeakers = (session.session_speakers ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Back */}
      <Link href="/app/programme" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Хөтөлбөр
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">
              {SESSION_TYPE_LABELS[session.session_type] ?? session.session_type}
            </span>
            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium">
              Zone: {session.zone}
            </span>
          </div>
          {/* Language toggle */}
          <div className="flex gap-1 text-xs">
            <Link
              href={`/app/programme/${id}`}
              className={`px-2 py-1 rounded ${!showEN ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              МН
            </Link>
            <Link
              href={`/app/programme/${id}?lang=en`}
              className={`px-2 py-1 rounded ${showEN ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              EN
            </Link>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>

        <div className="text-sm text-gray-500 space-y-1 mb-4">
          <p>🕐 {formatDateTime(session.starts_at)} – {formatDateTime(session.ends_at)}</p>
          {session.venue && (
            <p>📍 {showEN && session.venue.name_en ? session.venue.name_en : session.venue.name}
              {session.venue.floor != null && ` · ${session.venue.floor}-р давхар`}
              {session.venue.location && ` · ${session.venue.location}`}
            </p>
          )}
        </div>

        {description && (
          <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
        )}

        {(session.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {(session.tags ?? []).map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Capacity */}
      {session.capacity > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Суудлын хүчин чадал</span>
            <span className="text-sm text-gray-500">{session.registered_count} / {session.capacity}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${isFull ? 'bg-orange-400' : 'bg-blue-500'}`}
              style={{ width: `${Math.min((session.registered_count / session.capacity) * 100, 100)}%` }}
            />
          </div>
          {isFull && <p className="text-xs text-orange-600 mt-1">Суудал дүүрсэн — хүлээлгийн жагсаалтад нэмэгдэх боломжтой</p>}
        </div>
      )}

      {/* Speakers */}
      {sortedSpeakers.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">🎤 Илтгэгчид</h2>
          <div className="space-y-3">
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
                <div key={ss.speaker.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium overflow-hidden flex-shrink-0">
                    {ss.speaker.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ss.speaker.avatar_url} alt={ss.speaker.full_name} className="w-full h-full object-cover" />
                    ) : (
                      ss.speaker.full_name[0]
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {showEN && ss.speaker.full_name_en ? ss.speaker.full_name_en : ss.speaker.full_name}
                    </p>
                    {(ss.speaker.title || ss.speaker.title_en) && (
                      <p className="text-xs text-gray-500">
                        {showEN && ss.speaker.title_en ? ss.speaker.title_en : ss.speaker.title}
                        {(ss.speaker.organization || ss.speaker.organization_en) && (
                          <span> · {showEN && ss.speaker.organization_en ? ss.speaker.organization_en : ss.speaker.organization}</span>
                        )}
                      </p>
                    )}
                    {ss.role !== 'speaker' && (
                      <span className="text-xs text-blue-600">{ss.role}</span>
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
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Үйлдлүүд</h2>

          {/* Registration */}
          {session.is_registration_open && !sessionEnded && (
            <div>
              {regStatus === 'confirmed' ? (
                <form action={async () => {
                  'use server';
                  await cancelRegistration(id);
                }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-700 font-medium">✓ Бүртгүүлсэн</span>
                    <button type="submit" className="text-xs text-red-600 hover:underline">
                      Цуцлах
                    </button>
                  </div>
                </form>
              ) : regStatus === 'waitlisted' ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-orange-600 font-medium">⏳ Хүлээлгийн жагсаалтад байна</span>
                  <form action={async () => {
                    'use server';
                    await cancelRegistration(id);
                  }}>
                    <button type="submit" className="text-xs text-red-600 hover:underline">Гарах</button>
                  </form>
                </div>
              ) : (
                <form action={async () => {
                  'use server';
                  await registerForSession(id);
                }}>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {isFull ? '⏳ Хүлээлгийн жагсаалтад нэмэгдэх' : '+ Бүртгүүлэх'}
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
              className={`w-full py-2.5 rounded-lg font-medium border transition-colors ${
                inAgenda
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
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
              className={`block w-full text-center py-2.5 rounded-lg font-medium transition-colors ${
                checkedIn
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              }`}
            >
              {checkedIn ? '✓ Бүртгэгдсэн' : '📱 QR Check-in'}
            </Link>
          )}
        </div>
      )}

      {/* Survey — only after session ended */}
      {user && sessionEnded && (
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-3">⭐ Үнэлгээ өгөх</h2>
          <form action={async (formData: FormData) => {
            'use server';
            const rating = parseInt(formData.get('rating') as string);
            const feedback = formData.get('feedback') as string;
            await submitSurvey(id, rating, feedback || undefined);
          }}>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <label key={star} className="cursor-pointer">
                  <input type="radio" name="rating" value={star} className="sr-only" required />
                  <span className="text-2xl hover:scale-110 transition-transform">⭐</span>
                </label>
              ))}
            </div>
            <textarea
              name="feedback"
              placeholder="Сэтгэгдэл бичнэ үү (заавал биш)..."
              className="w-full border rounded-lg p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              Илгээх
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
