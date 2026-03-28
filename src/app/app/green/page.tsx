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

  const { data: allBadges } = await supabase.from('badges').select('*').order('requirement_steps');

  const co2Kg = (stats.totalCo2Grams / 1000).toFixed(2);
  const co2G = stats.totalCo2Grams.toFixed(0);
  const todayCo2G = (stats.todaySteps * 0.08).toFixed(0);

  const stepBadges = (allBadges ?? [])
    .filter((b) => b.badge_type === 'steps')
    .sort((a, b) => a.requirement_steps - b.requirement_steps);
  const earnedStepIds = new Set(stats.badges.map((b) => b.id));
  const nextBadge = stepBadges.find((b) => !earnedStepIds.has(b.id));
  const progressPct = nextBadge
    ? Math.min(100, Math.round((stats.totalSteps / nextBadge.requirement_steps) * 100))
    : 100;

  const earnedBadges = stats.badges;
  const unearnedBadges = (allBadges ?? []).filter((b) => !earnedStepIds.has(b.id));

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">🌿 Ногоон оролцоо</h1>
            <p className="text-green-100 text-sm">Алхаж байгаль дэлхийгээ хамгаал</p>
          </div>
          {stats.rank && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-green-100">Таны байр</p>
              <p className="text-2xl font-bold">#{stats.rank}</p>
            </div>
          )}
        </div>

        {/* CO2 saved — large display */}
        <div className="mt-5 bg-white/15 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-xs text-green-100 uppercase tracking-wide font-semibold mb-1">
            Нийт CO₂ хэмнэлт
          </p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black tracking-tight">
              {Number(co2Kg) >= 1 ? co2Kg : co2G}
            </span>
            <span className="text-xl font-bold text-green-200 mb-1">
              {Number(co2Kg) >= 1 ? 'кг' : 'г'} CO₂
            </span>
          </div>
          <p className="text-green-200 text-xs mt-1">
            🌳 {Math.floor(stats.totalCo2Grams / 21000)} мод тарихтай тэнцэнэ
          </p>
        </div>
      </div>

      {/* Today vs Total stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-green-200 rounded-2xl p-5 text-center shadow-sm">
          <p className="text-4xl font-black text-green-700">{stats.todaySteps.toLocaleString()}</p>
          <p className="text-sm font-semibold text-green-600 mt-1">Өнөөдрийн алхам</p>
          <div className="mt-2 bg-green-50 rounded-xl px-3 py-1.5">
            <p className="text-xs text-green-500 font-medium">{todayCo2G}г CO₂ хэмнэлт</p>
          </div>
        </div>
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 text-center shadow-sm">
          <p className="text-4xl font-black text-emerald-700">{stats.totalSteps.toLocaleString()}</p>
          <p className="text-sm font-semibold text-emerald-600 mt-1">Нийт алхам</p>
          <div className="mt-2 bg-emerald-50 rounded-xl px-3 py-1.5">
            <p className="text-xs text-emerald-500 font-medium">{co2Kg}кг CO₂ хэмнэлт</p>
          </div>
        </div>
      </div>

      {/* Progress bar to next badge */}
      {nextBadge ? (
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Дараагийн медаль</p>
              <p className="font-bold text-gray-900 mt-0.5">
                {nextBadge.icon} {nextBadge.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-green-600">{progressPct}%</p>
              <p className="text-xs text-gray-400">гүйцэтгэсэн</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
              <div
                className="h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-700 flex items-center justify-end pr-2"
                style={{ width: `${Math.max(progressPct, 8)}%` }}
              >
                {progressPct >= 20 && (
                  <span className="text-white text-xs font-bold">{progressPct}%</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>🚶 {stats.totalSteps.toLocaleString()} алхам</span>
            <span>🎯 {nextBadge.requirement_steps.toLocaleString()} алхам</span>
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            Дараагийн медаль авахад{' '}
            <span className="font-bold text-green-600">
              {(nextBadge.requirement_steps - stats.totalSteps).toLocaleString()}
            </span>{' '}
            алхам үлдсэн
          </p>
        </div>
      ) : stats.badges.length > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
          <p className="text-3xl mb-2">🏆</p>
          <p className="text-amber-800 font-bold">Бүх медалиа авсан байна!</p>
          <p className="text-amber-600 text-sm mt-1">Танд баяр хүргэе!</p>
        </div>
      ) : null}

      {/* Step logger */}
      <StepLogger />

      {/* Earned badges — horizontal scroll */}
      {earnedBadges.length > 0 && (
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">🏅 Миний медалиуд</h2>
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
              {earnedBadges.length} медаль
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex-shrink-0 flex flex-col items-center gap-2 bg-gradient-to-b from-amber-50 to-yellow-50 border border-yellow-200 rounded-2xl p-4 w-24 shadow-sm"
              >
                <span className="text-3xl">{badge.icon}</span>
                <p className="text-xs font-semibold text-amber-800 text-center leading-tight">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All badges grid (unearned) */}
      {unearnedBadges.length > 0 && (
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">🎯 Авах боломжтой медалиуд</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {unearnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex-shrink-0 flex flex-col items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-4 w-24 opacity-60"
              >
                <span className="text-3xl grayscale">{badge.icon}</span>
                <p className="text-xs font-medium text-gray-500 text-center leading-tight">{badge.name}</p>
                {badge.requirement_steps && (
                  <p className="text-xs text-gray-400 text-center">{badge.requirement_steps.toLocaleString()} алхам</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full badge grid (for accessibility fallback) */}
      {(allBadges?.length ?? 0) > 0 && earnedBadges.length === 0 && (
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
        className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 hover:bg-blue-100 transition-colors shadow-sm"
      >
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          🏆
        </div>
        <div className="flex-1">
          <p className="font-bold text-blue-900">Оролцогчдын жагсаалт</p>
          <p className="text-sm text-blue-600 mt-0.5">Нийт оролцогчдын алхамын статистик</p>
        </div>
        <span className="text-blue-400 font-bold">→</span>
      </Link>
    </div>
  );
}
