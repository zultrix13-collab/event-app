'use client';

import { useState } from 'react';

interface MapTabsProps {
  outdoorContent: React.ReactNode;
  indoorContent: React.ReactNode;
}

export default function MapTabs({ outdoorContent, indoorContent }: MapTabsProps) {
  const [tab, setTab] = useState<'outdoor' | 'indoor'>('outdoor');

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('outdoor')}
          className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-colors ${
            tab === 'outdoor'
              ? 'bg-green-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          🌍 Гадаад зураг
        </button>
        <button
          onClick={() => setTab('indoor')}
          className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-colors ${
            tab === 'indoor'
              ? 'bg-green-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          🏛️ Дотоод зураг
        </button>
      </div>
      {tab === 'outdoor' ? outdoorContent : indoorContent}
    </div>
  );
}
