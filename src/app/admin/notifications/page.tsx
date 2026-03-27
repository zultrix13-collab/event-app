import { createClient } from '@/lib/supabase/server';
import { sendNotification } from '@/modules/programme/actions';
import { revalidatePath } from 'next/cache';

function timeAgo(dt: string) {
  const diff = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Дөнгөж сая';
  if (mins < 60) return `${mins} минутын өмнө`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} цагийн өмнө`;
  return new Date(dt).toLocaleDateString('mn-MN');
}

const ROLES = [
  { value: 'vip', label: 'VIP' },
  { value: 'delegate', label: 'Делегат' },
  { value: 'specialist', label: 'Мэргэжилтэн' },
  { value: 'observer', label: 'Ажиглагч' },
];

const TYPE_ICONS: Record<string, string> = {
  general: 'ℹ️',
  programme: '📅',
  emergency: '🚨',
  system: '⚙️',
};

async function handleSend(formData: FormData) {
  'use server';
  const targetRoles = formData.getAll('target_roles') as string[];
  await sendNotification({
    title: formData.get('title') as string,
    title_en: (formData.get('title_en') as string) || undefined,
    body: formData.get('body') as string,
    body_en: (formData.get('body_en') as string) || undefined,
    type: formData.get('type') as string,
    targetRoles: targetRoles.length > 0 ? targetRoles : undefined,
    isEmergency: formData.get('is_emergency') === 'true',
  });
  revalidatePath('/admin/notifications');
}

export default async function AdminNotificationsPage() {
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(50);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔔 Мэдэгдэл илгээх</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Send form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border shadow-sm p-6 sticky top-6">
            <h2 className="font-semibold text-gray-900 mb-4">Шинэ мэдэгдэл</h2>
            <form action={handleSend} className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Гарчиг (МН) *</label>
                  <input name="title" required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title (EN)</label>
                  <input name="title_en" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Мэдэгдэл (МН) *</label>
                  <textarea name="body" required rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Body (EN)</label>
                  <textarea name="body_en" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Төрөл</label>
                <select name="type" defaultValue="general" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="general">ℹ️ Ерөнхий</option>
                  <option value="programme">📅 Хөтөлбөр</option>
                  <option value="emergency">🚨 Яаралтай</option>
                  <option value="system">⚙️ Систем</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Хамрах хүрээ (хоосон = бүгд)</label>
                <div className="space-y-2">
                  {ROLES.map((role) => (
                    <label key={role.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="target_roles" value={role.value} className="rounded" />
                      <span className="text-sm text-gray-700">{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_emergency" value="true" className="rounded" />
                  <div>
                    <span className="text-sm font-medium text-red-800">🚨 Яаралтай мэдэгдэл</span>
                    <p className="text-xs text-red-600 mt-0.5">Улаанаар тодотгон харуулна</p>
                  </div>
                </label>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Илгээх
              </button>
            </form>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-3">
          <h2 className="font-semibold text-gray-900 mb-4">Илгээсэн мэдэгдлүүд</h2>
          {!notifications || notifications.length === 0 ? (
            <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-gray-500">
              <p className="text-3xl mb-2">🔔</p>
              <p>Илгээсэн мэдэгдэл байхгүй байна</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`bg-white rounded-xl border shadow-sm p-4 ${notif.is_emergency ? 'border-red-200 bg-red-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-lg flex-shrink-0">{notif.is_emergency ? '🚨' : (TYPE_ICONS[notif.notification_type] ?? 'ℹ️')}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                          {notif.is_emergency && (
                            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">ЯАРАЛТАЙ</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notif.body}</p>
                        {(notif.target_roles ?? []).length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">→ {(notif.target_roles ?? []).join(', ')}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(notif.sent_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
