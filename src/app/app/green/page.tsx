import { createClient } from '@/lib/supabase/server';
import { getUserStepStats } from '@/modules/green/actions';
import StepLogger from '@/components/green/StepLogger';
import BadgeGrid from '@/components/green/BadgeGrid';
import Link from 'next/link';
import type { Badge } from '@/modules/green/types';

export const metadata = { title: 'Ногоон оролцоо' };

export default async function GreenPage() {
  const supabase = await createClient();
  const stats = await getUserStepStats();

  // Get all badges for display
  const { data: allBadges } = await supabase.from('badges').select('*').order('requirement_steps');

  const co2Kg = (stats.totalCo2Grams / 1000).toFixed(2);
  const todayCo2 = (stats.todaySteps * 0.08).toFixed(0);

  // Find next badge
  const stepBadges = (allBadges ?? [])
    .filter((b) => b.badge_type === 'steps')
    .sort((a, b) => a.requirement_steps - b.requirement_steps);
  const earnedStepIds = new Set(stats.badges.map((b) => b.id));
  const nextBadge = stepBadges.find((b) => !earnedStepIds.has(b.id));
  const progressPct = nextBadge
    ? Math.min(100, Math.round((stats.totalSteps / nextBadge.requirement_steps) * 100))
    : 100;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">🌿 Ногоон оролцоо</h1>
        <p className="text-green-100 text-sm">Алхаж байгаль дэлхийгээ хамгаал</p>
        {stats.rank && (
          <p className="mt-2 text-green-100 text-sm">🏆 Таны байр: #{stats.rank}</p>
        )}
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-green-700">{stats.todaySteps.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">Өнөөдрийн алхам</p>
          <p className="text-xs text-green-500 mt-1">{todayCo2}г CO₂ хэмнэлт</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-emerald-700">{stats.totalSteps.toLocaleString()}</p>
          <p className="text-sm text-emerald-600 mt-1">Нийт алхам</p>
          <p className="text-xs text-emerald-500 mt-1">{co2Kg}кг CO₂ хэмнэлт</p>
        </div>
      </div>

      {/* Progress to next badge */}
      {nextBadge && (
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              Дараагийн медаль: {nextBadge.icon} {nextBadge.name}
            </p>
            <span className="text-xs text-gray-500">{progressPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {stats.totalSteps.toLocaleString()} / {nextBadge.requirement_steps.toLocaleString()} алхам
          </p>
        </div>
      )}
      {!nextBadge && stats.badges.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-amber-700 font-semibold">🏆 Бүх медалиа авсан байна!</p>
        </div>
      )}

      {/* Step logger */}
      <StepLogger />

      {/* Badge grid */}
      {(allBadges?.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl border p-5">
          <BadgeGrid
            earned={stats.badges}
            all={(allBadges ?? []) as Badge[]}
          />
        </div>
      )}

      {/* Leaderboard link */}
      <Link
        href="/app/green/leaderboard"
        className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 hover:bg-blue-100 transition-colors"
      >
        <span className="text-2xl">🏆</span>
        <div>
          <p className="font-semibold text-blue-800">Оролцогчдын жагсаалт</p>
          <p className="text-sm text-blue-600">Нийт оролцогчдын алхамын статистик</p>
        </div>
        <span className="ml-auto text-blue-400">→</span>
      </Link>
    </div>
  );
}
