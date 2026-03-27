import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const metadata = { title: 'Статистик & Тайлан' };

export default async function AdminStatsPage() {
  const supabase = await createClient();

  const [
    // Programme
    { count: sessionsCount },
    { count: registrationsCount },
    { count: attendanceCount },
    // Services
    { count: ordersCount },
    // Green
    { count: stepParticipants },
  ] = await Promise.all([
    supabase.from('event_sessions').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('seat_registrations').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('attendance').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('step_logs').select('user_id', { count: 'exact', head: true }),
  ]);

  // Revenue
  const { data: paidOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'paid');
  const totalRevenue = paidOrders?.reduce((sum, o) => sum + (o.total_amount ?? 0), 0) ?? 0;

  // Top products
  const { data: topProductsRaw } = await supabase
    .from('order_items')
    .select('product_name, quantity');

  const productMap = new Map<string, number>();
  for (const item of topProductsRaw ?? []) {
    productMap.set(item.product_name, (productMap.get(item.product_name) ?? 0) + item.quantity);
  }
  const topProducts = [...productMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Green stats
  const { data: stepData } = await supabase.from('step_logs').select('steps, co2_saved_grams');
  const totalStepsAll = stepData?.reduce((sum, r) => sum + (r.steps ?? 0), 0) ?? 0;
  const totalCo2All = stepData?.reduce((sum, r) => sum + Number(r.co2_saved_grams ?? 0), 0) ?? 0;
  const avgSteps = stepParticipants && stepParticipants > 0 ? Math.round(totalStepsAll / stepParticipants) : 0;

  const attendanceRate =
    registrationsCount && registrationsCount > 0
      ? Math.round(((attendanceCount ?? 0) / registrationsCount) * 100)
      : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">📊 Статистик & Тайлан</h1>

      {/* Programme stats */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">📅 Хөтөлбөрийн статистик</h2>
          <Link
            href="/admin/stats/export?type=attendance"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ⬇️ CSV татах
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Арга хэмжаанууд" value={sessionsCount ?? 0} color="bg-blue-50 text-blue-700" />
          <Stat label="Нийт бүртгэл" value={registrationsCount ?? 0} color="bg-indigo-50 text-indigo-700" />
          <Stat label={`Ирц (${attendanceRate}%)`} value={attendanceCount ?? 0} color="bg-purple-50 text-purple-700" />
        </div>
      </section>

      {/* Services stats */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">🛍️ Үйлчилгээний статистик</h2>
          <Link
            href="/admin/stats/export?type=orders"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ⬇️ CSV татах
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Stat label="Нийт захиалга" value={ordersCount ?? 0} color="bg-orange-50 text-orange-700" />
          <Stat label={`Нийт орлого (₮)`} value={totalRevenue.toLocaleString()} color="bg-green-50 text-green-700" />
        </div>
        {topProducts.length > 0 && (
          <div className="bg-white border rounded-xl overflow-hidden">
            <p className="text-sm font-semibold text-gray-600 p-3 border-b bg-gray-50">Шилдэг бүтээгдэхүүнүүд</p>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {topProducts.map(([name, qty]) => (
                  <tr key={name}>
                    <td className="p-3 text-gray-800">{name}</td>
                    <td className="p-3 text-right font-semibold text-gray-700">{qty} ширхэг</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Green stats */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">🌿 Ногоон оролцооны статистик</h2>
          <Link
            href="/admin/stats/export?type=steps"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ⬇️ CSV татах
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Оролцогчид" value={stepParticipants ?? 0} color="bg-emerald-50 text-emerald-700" />
          <Stat label="Дундаж алхам" value={avgSteps.toLocaleString()} color="bg-green-50 text-green-700" />
          <Stat label={`CO₂ (${(totalCo2All / 1000).toFixed(1)}кг)`} value={`${totalStepsAll.toLocaleString()} алхам`} color="bg-teal-50 text-teal-700" />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-80">{label}</p>
    </div>
  );
}
