'use client';
import type { Badge } from '@/modules/green/types';

interface Props {
  earned: Badge[];
  all: Badge[];
}

export default function BadgeGrid({ earned, all }: Props) {
  const earnedIds = new Set(earned.map((b) => b.id));

  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-3">🏅 Миний медалиуд</h3>
      <div className="grid grid-cols-3 gap-3">
        {all.map((badge) => {
          const isEarned = earnedIds.has(badge.id);
          return (
            <div
              key={badge.id}
              className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                isEarned
                  ? 'bg-amber-50 border-amber-200 shadow-sm'
                  : 'bg-gray-50 border-gray-100 opacity-50 grayscale'
              }`}
            >
              <span className="text-3xl mb-1">{badge.icon}</span>
              <p className={`text-xs font-semibold ${isEarned ? 'text-amber-800' : 'text-gray-500'}`}>
                {badge.name}
              </p>
              {!isEarned && badge.badge_type === 'steps' && badge.requirement_steps > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {badge.requirement_steps.toLocaleString()} алхам
                </p>
              )}
              {!isEarned && badge.badge_type === 'co2' && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {badge.description ?? 'CO₂ хэмнэ'}
                </p>
              )}
              {isEarned && (
                <p className="text-xs text-amber-600 mt-0.5">✓ Авсан</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
