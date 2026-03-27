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

const TYPE_ICONS: Record<string, string> = {
  general: 'ℹ️',
  programme: '📅',
  emergency: '🚨',
  system: '⚙️',
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/app/home" className="text-sm text-blue-600 hover:underline mb-1 inline-block">
            ← Нүүр
          </Link>
          <h1 className="text-2xl font-bold">🔔 Мэдэгдлүүд</h1>
        </div>
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-2">🔔</p>
          <p>Одоохондоо мэдэгдэл байхгүй байна</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-xl border shadow-sm p-4 ${
                notif.is_emergency
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {notif.is_emergency ? '🚨' : (TYPE_ICONS[notif.notification_type] ?? 'ℹ️')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold text-sm ${notif.is_emergency ? 'text-red-800' : 'text-gray-900'}`}>
                      {notif.title}
                    </h3>
                    {notif.is_emergency && (
                      <span className="flex-shrink-0 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                        ЯАРАЛТАЙ
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${notif.is_emergency ? 'text-red-700' : 'text-gray-600'}`}>
                    {notif.body}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{timeAgo(notif.sent_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
