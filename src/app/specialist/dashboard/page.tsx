import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  getTodaySessions,
  getRecentCheckins,
  getPendingComplaints,
  getOpenLostFoundCount,
  getTodayCheckinCount,
} from '@/modules/specialist/actions';

type SessionWithVenue = {
  venues: { name: string } | null;
};

type CheckinWithRelations = {
  profiles: { full_name: string | null; email: string | null } | null;
  event_sessions: { title: string | null } | null;
};

export const dynamic = 'force-dynamic';

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('mn-MN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  general: 'Ерөнхий',
  service: 'Үйлчилгээ',
  technical: 'Техник',
  safety: 'Аюулгүй байдал',
  other: 'Бусад',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default async function SpecialistDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .maybeSingle();

  const [sessions, recentCheckins, pendingComplaints, openLostFound, todayCheckins] =
    await Promise.all([
      getTodaySessions(),
      getRecentCheckins(),
      getPendingComplaints(),
      getOpenLostFoundCount(),
      getTodayCheckinCount(),
    ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">👷 Мэргэжилтний самбар</h1>
        <p className="text-gray-500 mt-1">
          Тавтай морилно уу, <span className="font-medium text-gray-700">{profile?.full_name ?? user?.email}</span>
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon="📅"
          label="Өнөөдрийн хуралдаан"
          value={sessions.length}
          color="bg-blue-50 border-blue-200"
          textColor="text-blue-700"
        />
        <StatCard
          icon="✅"
          label="Өнөөдрийн бүртгэл"
          value={todayCheckins}
          color="bg-green-50 border-green-200"
          textColor="text-green-700"
        />
        <StatCard
          icon="📋"
          label="Хүлээгдэж буй гомдол"
          value={pendingComplaints.length}
          color="bg-orange-50 border-orange-200"
          textColor="text-orange-700"
        />
        <StatCard
          icon="🔍"
          label="Нээлттэй олдсон зүйл"
          value={openLostFound}
          color="bg-purple-50 border-purple-200"
          textColor="text-purple-700"
        />
      </div>

      {/* Today's Sessions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">📅 Өнөөдрийн хуралдаанууд</h2>
        {sessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
            Өнөөдөр хуралдаан байхгүй байна
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const venue = (session as typeof session & SessionWithVenue).venues;
              return (
                <div
                  key={session.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <span className="font-mono">
                        {formatTime(session.starts_at)} – {formatTime(session.ends_at)}
                      </span>
                      {venue?.name && (
                        <>
                          <span>·</span>
                          <span>📍 {venue.name}</span>
                        </>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 truncate">{session.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {session.registered_count} / {session.capacity} бүртгэгдсэн
                    </p>
                  </div>
                  <Link
                    href={`/specialist/checkin/${session.id}`}
                    className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
                  >
                    📝 Check-in бүртгэх
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Check-ins */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">🕐 Сүүлийн бүртгэлүүд</h2>
        {recentCheckins.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
            Бүртгэл байхгүй байна
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentCheckins.map((item) => {
              const p = (item as typeof item & CheckinWithRelations).profiles;
              const s = (item as typeof item & CheckinWithRelations).event_sessions;
              return (
                <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm shrink-0">
                    ✅
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {p?.full_name ?? p?.email ?? 'Хэрэглэгч'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{s?.title ?? '—'}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatDateTime(item.checked_in_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Pending Complaints */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">📋 Хүлээгдэж буй гомдлууд</h2>
        {pendingComplaints.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
            Хүлээгдэж буй гомдол байхгүй байна
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {pendingComplaints.map((complaint) => (
              <div key={complaint.id} className="px-4 py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm shrink-0 mt-0.5">
                  📋
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{complaint.subject}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500">
                      {CATEGORY_LABELS[complaint.category] ?? complaint.category}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        PRIORITY_COLORS[complaint.priority] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {complaint.priority}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatDateTime(complaint.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  textColor,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  textColor: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}
