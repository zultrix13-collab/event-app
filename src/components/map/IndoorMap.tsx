'use client';

import { useState } from 'react';
import type { FloorPlan, IndoorZone } from '@/modules/map/types';

const ZONE_TYPE_ICONS: Record<string, string> = {
  hall: '🏛️',
  registration: '📋',
  restaurant: '🍽️',
  medical: '🏥',
  toilet: '🚻',
  exit: '🚪',
  shop: '🛍️',
  stage: '🎤',
  room: '🏠',
};

interface IndoorMapProps {
  floorPlan: FloorPlan;
  zones: IndoorZone[];
  userZoneId?: string | null;
}

export default function IndoorMap({ floorPlan, zones, userZoneId }: IndoorMapProps) {
  const [selectedZone, setSelectedZone] = useState<IndoorZone | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{floorPlan.name}</h3>
        {floorPlan.name_en && (
          <span className="text-sm text-slate-500">{floorPlan.name_en}</span>
        )}
      </div>

      {/* SVG Floor Plan */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50">
        {floorPlan.svg_content ? (
          <div
            className="w-full"
            dangerouslySetInnerHTML={{ __html: floorPlan.svg_content }}
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400">
            Floor plan байхгүй байна
          </div>
        )}

        {/* Zone overlay buttons */}
        <div className="absolute inset-0">
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`absolute rounded transition-all hover:bg-white/10 ${
                userZoneId === zone.id ? 'ring-4 ring-yellow-400 ring-offset-1' : ''
              }`}
              style={{
                left: `${zone.x_percent}%`,
                top: `${zone.y_percent}%`,
                width: `${zone.width_percent}%`,
                height: `${zone.height_percent}%`,
                backgroundColor: 'transparent',
              }}
              title={zone.name}
            />
          ))}
        </div>
      </div>

      {/* Zone legend */}
      <div className="grid grid-cols-3 gap-2">
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setSelectedZone(zone)}
            className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs border transition-colors ${
              selectedZone?.id === zone.id || userZoneId === zone.id
                ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <span>{ZONE_TYPE_ICONS[zone.zone_type] ?? '📍'}</span>
            <span className="truncate">{zone.name}</span>
            {userZoneId === zone.id && <span className="text-yellow-500">📍</span>}
          </button>
        ))}
      </div>

      {/* Selected zone detail */}
      {selectedZone && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{ZONE_TYPE_ICONS[selectedZone.zone_type] ?? '📍'}</span>
                <div>
                  <div className="font-bold">{selectedZone.name}</div>
                  {selectedZone.name_en && (
                    <div className="text-sm text-slate-500">{selectedZone.name_en}</div>
                  )}
                </div>
              </div>
              {selectedZone.qr_code && (
                <div className="mt-2 text-xs text-slate-400">QR: {selectedZone.qr_code}</div>
              )}
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* QR Check-in instruction */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-300">
        📱 Байршлаа шинэчлэхийн тулд тухайн өрөөний QR кодыг скан хийнэ үү
      </div>
    </div>
  );
}
