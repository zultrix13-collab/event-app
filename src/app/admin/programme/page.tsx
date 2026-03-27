import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { togglePublishSession, deleteSession } from '@/modules/programme/actions';

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('mn-MN', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default async function AdminProgrammePage() {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from('event_sessions')
    .select(`
      id, title, starts_at, ends_at, session_type, capacity, registered_count, is_published, zone,
      venue:venues(id, name)
    `)
    .order('starts_at', { ascending: true });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Хөтөлбөрийн удирдлага</h1>
        <Link
          href="/admin/programme/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Шинэ арга хэмжаа нэмэх
        </Link>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl border">
          <p className="text-4xl mb-2">📋</p>
          <p>Хөтөлбөр хоосон байна</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Гарчиг</th>
                <th className="text-left p-4 font-semibold text-gray-600">Огноо/Цаг</th>
                <th className="text-left p-4 font-semibold text-gray-600">Заал</th>
                <th className="text-left p-4 font-semibold text-gray-600">Суудал</th>
                <th className="text-left p-4 font-semibold text-gray-600">Статус</th>
                <th className="text-left p-4 font-semibold text-gray-600">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-xs">{session.title}</p>
                      <span className="text-xs text-gray-400 capitalize">{session.session_type} · {session.zone}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {formatDateTime(session.starts_at)}
                    <br />
                    <span className="text-xs text-gray-400">→ {formatDateTime(session.ends_at)}</span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {session.venue ? session.venue.name : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="p-4">
                    {session.capacity > 0 ? (
                      <div>
                        <span className="text-gray-900">{session.registered_count}</span>
                        <span className="text-gray-400"> / {session.capacity}</span>
                        <div className="w-20 bg-gray-100 rounded-full h-1 mt-1">
                          <div
                            className="h-1 bg-blue-500 rounded-full"
                            style={{ width: `${Math.min((session.registered_count / session.capacity) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Хязгааргүй</span>
                    )}
                  </td>
                  <td className="p-4">
                    <form action={async () => {
                      'use server';
                      await togglePublishSession(session.id, !session.is_published);
                    }}>
                      <button
                        type="submit"
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          session.is_published
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {session.is_published ? '✓ Нийтлэгдсэн' : '○ Драфт'}
                      </button>
                    </form>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/programme/${session.id}/edit`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Засах
                      </Link>
                      <form action={async () => {
                        'use server';
                        await deleteSession(session.id);
                      }}>
                        <button
                          type="submit"
                          className="text-red-600 hover:underline text-xs"
                          onClick={(e) => {
                            if (!confirm('Арга хэмжааг устгах уу?')) e.preventDefault();
                          }}
                        >
                          Устгах
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
