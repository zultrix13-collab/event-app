import { getLeaderboard } from '@/modules/green/actions';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const metadata = { title: 'Оролцогчдын жагсаалт' };

function maskName(name: string | null): string {
  if (!name) return '***';
  const parts = name.trim().split(' ');
  return parts
    .map((part) => {
      if (part.length <= 2) return part;
      return part.slice(0, 2) + '***';
    })
    .join(' ');
}

export default async function LeaderboardPage() {
  const [entries, supabase] = await Promise.all([
    getLeaderboard(50),
    createClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();

  // Country aggregate
  const countryMap = new Map<string, { steps: number; count: number }>();
  for (const e of entries) {
    if (!e.country) continue;
    const prev = countryMap.get(e.country) ?? { steps: 0, count: 0 };
    countryMap.set(e.country, { steps: prev.steps + e.total_steps, count: prev.count + 1 });
  }
  const countryStats = [...countryMap.entries()]
    .sort((a, b) => b[1].steps - a[1].steps)
    .slice(0, 5);

  const totalSteps = entries.reduce((sum, e) => sum + e.total_steps, 0);
  const totalCo2Kg = (entries.reduce((sum, e) => sum + e.total_co2_saved, 0) / 1000).toFixed(1);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div>
        <Link href="/app/green" className="text-sm text-green-600 hover:underline mb-2 block">
          ← Ногоон оролцоо
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">🏆 Оролцогчдын жагсаалт</h1>
      </div>

      {/* Non-competitive banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 text-center">
        🌿 <strong>Өрсөлдөөнт бус</strong> — нийгэмлэгийн оролцооны статистик
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{entries.length}</p>
          <p className="text-xs text-blue-600 mt-1">Оролцогчид</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{totalSteps.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">Нийт алхам</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{totalCo2Kg}кг</p>
          <p className="text-xs text-emerald-600 mt-1">CO₂ хэмнэлт</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-600 w-10">#</th>
              <th className="text-left p-3 font-semibold text-gray-600">Нэр</th>
              <th className="text-left p-3 font-semibold text-gray-600 hidden sm:table-cell">Улс</th>
              <th className="text-right p-3 font-semibold text-gray-600">Алхам</th>
              <th className="text-right p-3 font-semibold text-gray-600 hidden sm:table-cell">CO₂</th>
              <th className="text-right p-3 font-semibold text-gray-600">🏅</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {entries.map((entry, idx) => {
              const isMe = user && entry.user_id === user.id;
              return (
                <tr key={entry.user_id} className={isMe ? 'bg-green-50' : 'hover:bg-gray-50'}>
                  <td className="p-3 font-bold text-gray-500">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-gray-800">
                      {isMe ? `${maskName(entry.full_name)} (Та)` : maskName(entry.full_name)}
                    </p>
                    {entry.organization && (
                      <p className="text-xs text-gray-400">{entry.organization}</p>
                    )}
                  </td>
                  <td className="p-3 text-gray-600 hidden sm:table-cell">
                    {entry.country ?? '—'}
                  </td>
                  <td className="p-3 text-right font-semibold text-green-700">
                    {entry.total_steps.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-600 hidden sm:table-cell">
                    {(entry.total_co2_saved / 1000).toFixed(2)}кг
                  </td>
                  <td className="p-3 text-right text-amber-600 font-semibold">
                    {entry.badge_count > 0 ? `×${entry.badge_count}` : '—'}
                  </td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  Одоохондоо оролцогч байхгүй байна
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Country stats */}
      {countryStats.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">🌍 Улс орнуудаар</h2>
          <div className="space-y-2">
            {countryStats.map(([country, data]) => (
              <div key={country} className="flex items-center gap-3 bg-white border rounded-xl p-3">
                <span className="font-medium text-gray-700 w-24">{country}</span>
                <div className="flex-1">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (data.steps / (countryStats[0]?.[1]?.steps || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-28 text-right">
                  {data.steps.toLocaleString()} ({data.count} хүн)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
