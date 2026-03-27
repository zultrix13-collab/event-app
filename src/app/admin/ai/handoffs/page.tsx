import { getSupabaseAdminClient } from '@/lib/supabase/admin';

type HandoffWithSession = {
  id: string;
  session_id: string;
  user_id: string | null;
  reason: string | null;
  status: 'waiting' | 'assigned' | 'resolved';
  assigned_to: string | null;
  created_at: string;
  resolved_at: string | null;
  session_language: string | null;
  session_started_at: string | null;
  user_full_name: string | null;
  user_email: string | null;
};

async function getHandoffs(): Promise<HandoffWithSession[]> {
  const supabase = getSupabaseAdminClient();

  // Fetch handoffs
  const { data: handoffs } = await supabase
    .from('operator_handoffs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (!handoffs || handoffs.length === 0) return [];

  // Fetch related sessions
  const sessionIds = handoffs.map(h => h.session_id).filter(Boolean);
  const { data: sessions } = await supabase
    .from('chat_sessions')
    .select('id, language, started_at, user_id')
    .in('id', sessionIds);

  const userIds = (sessions ?? []).map(s => s.user_id).filter(Boolean) as string[];
  const { data: users } = userIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] };

  const sessionMap = new Map((sessions ?? []).map(s => [s.id, s]));
  const userMap = new Map((users ?? []).map(u => [u.id, u]));

  return handoffs.map(h => {
    const session = sessionMap.get(h.session_id);
    const user = session?.user_id ? userMap.get(session.user_id) : null;
    return {
      ...h,
      session_language: session?.language ?? null,
      session_started_at: session?.started_at ?? null,
      user_full_name: user?.full_name ?? null,
      user_email: user?.email ?? null,
    };
  });
}

const STATUS_LABELS: Record<string, string> = {
  waiting: '⏳ Хүлээж байна',
  assigned: '👤 Хариуцсан',
  resolved: '✅ Шийдвэрлэсэн',
};

const STATUS_COLORS: Record<string, string> = {
  waiting: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

export default async function HandoffsPage() {
  const handoffs = await getHandoffs();
  const waiting = handoffs.filter(h => h.status === 'waiting').length;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Human Handoff Жагсаалт</h1>
          <p className="text-slate-500 text-sm mt-1">
            Ажилтантай холбогдохыг хүссэн хэрэглэгчдийн жагсаалт
          </p>
        </div>
        {waiting > 0 && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
            {waiting} хүлээж байна
          </div>
        )}
      </div>

      {handoffs.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-4">🎉</div>
          <p>Handoff байхгүй байна. Бүх хэрэглэгч AI-тай ажиллаж байна!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {handoffs.map(h => (
            <div
              key={h.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                {h.session_language === 'mn' ? '🇲🇳' : '🇬🇧'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">
                      {h.user_full_name ?? h.user_email ?? 'Нэрээгүй хэрэглэгч'}
                    </div>
                    {h.user_email && h.user_full_name && (
                      <div className="text-slate-400 text-xs">{h.user_email}</div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_COLORS[h.status] ?? 'bg-slate-100 text-slate-800'}`}>
                    {STATUS_LABELS[h.status] ?? h.status}
                  </span>
                </div>
                {h.reason && (
                  <div className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                    &quot;{h.reason}&quot;
                  </div>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                  <span>{new Date(h.created_at).toLocaleString('mn-MN')}</span>
                  {h.resolved_at && (
                    <span>Шийдвэрлэсэн: {new Date(h.resolved_at).toLocaleString('mn-MN')}</span>
                  )}
                </div>
              </div>
              {h.status === 'waiting' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-400 transition-colors">
                    Хүлээж авах
                  </button>
                </div>
              )}
              {h.status === 'assigned' && (
                <button className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-400 transition-colors flex-shrink-0">
                  Шийдвэрлэсэн
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
