import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminMapPage() {
  const supabase = await createClient();

  const [{ data: pois }, { data: floorPlans }] = await Promise.all([
    supabase.from('map_pois').select('*').order('name'),
    supabase
      .from('floor_plans')
      .select('id, name, name_en, floor_number, is_active')
      .order('floor_number'),
  ]);

  // Get zone counts per floor plan
  const { data: zoneCounts } = await supabase
    .from('indoor_zones')
    .select('floor_plan_id')
    .eq('is_active', true);

  const zoneCountMap: Record<string, number> = {};
  zoneCounts?.forEach((z) => {
    zoneCountMap[z.floor_plan_id] = (zoneCountMap[z.floor_plan_id] ?? 0) + 1;
  });

  const CATEGORY_ICONS: Record<string, string> = {
    venue: '🏛️',
    hotel: '🏨',
    restaurant: '🍽️',
    transport: '✈️',
    attraction: '🎯',
    medical: '🏥',
    other: '📍',
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🗺️ Газрын зураг удирдлага</h1>
        <Link
          href="/app/map"
          className="text-sm text-green-600 hover:underline"
          target="_blank"
        >
          Хэрэглэгчийн харагдац →
        </Link>
      </div>

      {/* POIs Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">📍 Газрын цэгүүд (POI)</h2>
          <Link
            href="/admin/map/pois"
            className="px-3 py-1.5 bg-green-500 hover:bg-green-400 text-white text-sm rounded-lg font-medium transition-colors"
          >
            + Нэмэх / Засах
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {pois && pois.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left p-3 font-medium">Нэр</th>
                  <th className="text-left p-3 font-medium">Ангилал</th>
                  <th className="text-left p-3 font-medium">Байршил</th>
                  <th className="text-left p-3 font-medium">Төлөв</th>
                </tr>
              </thead>
              <tbody>
                {pois.map((poi) => (
                  <tr
                    key={poi.id}
                    className="border-b border-slate-100 dark:border-slate-700 last:border-0"
                  >
                    <td className="p-3">
                      <div className="font-medium">{poi.name}</div>
                      {poi.name_en && (
                        <div className="text-xs text-slate-400">{poi.name_en}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1">
                        {CATEGORY_ICONS[poi.category] ?? '📍'} {poi.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-xs">
                      {poi.latitude}, {poi.longitude}
                    </td>
                    <td className="p-3">
                      {poi.is_active ? (
                        <span className="text-green-600 text-xs font-medium">● Идэвхтэй</span>
                      ) : (
                        <span className="text-slate-400 text-xs">○ Идэвхгүй</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400">
              POI байхгүй байна. Шинэ цэг нэмнэ үү.
            </div>
          )}
        </div>
      </section>

      {/* Floor Plans Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">🏛️ Давхарын зурагнууд</h2>
        </div>

        <div className="space-y-3">
          {floorPlans && floorPlans.length > 0 ? (
            floorPlans.map((fp) => (
              <div
                key={fp.id}
                className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
              >
                <div>
                  <div className="font-medium">{fp.name}</div>
                  {fp.name_en && <div className="text-xs text-slate-400">{fp.name_en}</div>}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{zoneCountMap[fp.id] ?? 0} өрөө</span>
                  <span>{fp.is_active ? '✅' : '⏸️'}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              Давхарын зураг байхгүй байна.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
