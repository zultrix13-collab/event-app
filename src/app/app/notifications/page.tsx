import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

function timeAgo(dt: string) {
  const diff = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Дөнгөж сая';
  if (mins < 60) return `${mins} минутын өмнө`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} цагийн өмнө`;
  const days = Math.floor(hrs / 24);
  return `${days} өдрийн өмнө`;
}

type NotifType = 'emergency' | 'programme' | 'system' | 'general';

const TYPE_CONFIG: Record<NotifType, {
  icon: string;
  borderLeft: string;
  bg: string;
  border: string;
  titleColor: string;
  bodyColor: string;
  badge?: string;
}> = {
  emergency: {
    icon: '🚨',
    borderLeft: 'border-l-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    titleColor: 'text-red-900',
    bodyColor: 'text-red-700',
    badge: 'ЯАРАЛТАЙ',
  },
  programme: {
    icon: '📅',
    borderLeft: 'border-l-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    titleColor: 'text-blue-900',
    bodyColor: 'text-blue-700',
  },
  system: {
    icon: '⚙️',
    borderLeft: 'border-l-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    titleColor: 'text-gray-800',
    bodyColor: 'text-gray-600',
  },
  general: {
    icon: 'ℹ️',
    borderLeft: 'border-l-gray-300',
    bg: 'bg-white',
    border: 'border-gray-200',
    titleColor: 'text-gray-900',
    bodyColor: 'text-gray-600',
  },
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(50);

  const emergencyCount = (notifications ?? []).filter((n) => n.is_emergency).length;
  // Note: is_read may not exist on all notification types — use 0 as fallback
  const unreadCount = (notifications ?? []).filter((n) => !(n as { is_read?: boolean }).is_read).length;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <Link href="/app/home" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            ← Нүүр
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">🔔 Мэдэгдлүүд</h1>
        </div>
        {unreadCount > 0 && (
          <div className="bg-green-100 border border-green-200 rounded-full px-3 py-1">
            <span className="text-xs font-bold text-green-700">{unreadCount} шинэ</span>
          </div>
        )}
      </div>

      {/* Emergency banner */}
      {emergencyCount > 0 && (
        <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-4 mb-4 flex items-center gap-3 animate-pulse">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-bold text-red-800">Яаралтай мэдэгдэл байна!</p>
            <p className="text-sm text-red-600">{emergencyCount} яаралтай мэдэгдэл</p>
          </div>
        </div>
      )}

      {!notifications || notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border">
          <p className="text-5xl mb-3">🔔</p>
          <p className="font-semibold text-gray-700">Мэдэгдэл байхгүй байна</p>
          <p className="text-sm text-gray-400 mt-1">Одоохондоо шинэ мэдэгдэл ирээгүй байна</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => {
            const typeKey: NotifType = notif.is_emergency
              ? 'emergency'
              : (notif.notification_type as NotifType) in TYPE_CONFIG
                ? (notif.notification_type as NotifType)
                : 'general';
            const config = TYPE_CONFIG[typeKey];
            const isUnread = !(notif as Record<string, unknown> & { is_read?: boolean }).is_read;

            return (
              <div
                key={notif.id}
                className={`rounded-2xl border border-l-4 ${config.borderLeft} ${config.bg} ${config.border} shadow-sm transition-shadow hover:shadow-md ${
                  isUnread ? 'ring-1 ring-offset-1 ring-green-200' : ''
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-xl shadow-sm border border-white/80">
                    {notif.is_emergency ? '🚨' : (TYPE_CONFIG[notif.notification_type as NotifType]?.icon ?? 'ℹ️')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold text-sm leading-snug ${config.titleColor}`}>
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isUnread && (
                          <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title="Уншаагүй" />
                        )}
                        {notif.is_emergency && (
                          <span className="text-xs font-bold text-red-700 bg-red-200 border border-red-300 px-2 py-0.5 rounded-full">
                            ЯАРАЛТАЙ
                          </span>
                        )}
                      </div>
                    </div>

                    <p className={`text-sm leading-relaxed ${config.bodyColor}`}>{notif.body}</p>

                    <div className="flex items-center justify-between mt-2.5">
                      <p className="text-xs text-gray-400">{timeAgo(notif.sent_at)}</p>
                      {notif.notification_type && !notif.is_emergency && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          notif.notification_type === 'programme'
                            ? 'bg-blue-100 text-blue-600'
                            : notif.notification_type === 'system'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {notif.notification_type === 'programme' ? '📅 Хөтөлбөр' :
                           notif.notification_type === 'system' ? '⚙️ Систем' : 'ℹ️ Ерөнхий'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
