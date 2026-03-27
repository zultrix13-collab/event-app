'use client';

import { useEffect, useRef, useState } from 'react';
import type { MapPOI } from '@/modules/map/types';

const CATEGORY_ICONS: Record<string, string> = {
  venue: '🏛️',
  hotel: '🏨',
  restaurant: '🍽️',
  transport: '✈️',
  attraction: '🎯',
  medical: '🏥',
  other: '📍',
};

export default function OutdoorMap({ pois }: { pois: MapPOI[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const [selectedPOI, setSelectedPOI] = useState<MapPOI | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = token;
      const map = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [106.9177, 47.9077],
        zoom: 13,
      });

      mapRef.current = map;

      pois.forEach((poi) => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer text-2xl select-none';
        el.textContent = CATEGORY_ICONS[poi.category] ?? '📍';
        el.title = poi.name;

        new mapboxgl.default.Marker({ element: el })
          .setLngLat([poi.longitude, poi.latitude])
          .addTo(map);

        el.addEventListener('click', () => setSelectedPOI(poi));
      });
    });

    return () => {
      if (mapRef.current && typeof (mapRef.current as { remove?: () => void }).remove === 'function') {
        (mapRef.current as { remove: () => void }).remove();
      }
      mapRef.current = null;
    };
  }, [pois]);

  const filteredPOIs = activeFilter === 'all' ? pois : pois.filter((p) => p.category === activeFilter);
  const hasToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'venue', 'hotel', 'restaurant', 'transport', 'medical'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap font-medium transition-colors ${
              activeFilter === cat
                ? 'bg-green-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {cat === 'all' ? 'Бүгд' : (CATEGORY_ICONS[cat] ?? '') + ' ' + cat}
          </button>
        ))}
      </div>

      {/* Map or fallback */}
      {hasToken ? (
        <div
          ref={mapContainer}
          className="w-full h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
        />
      ) : (
        <div className="w-full h-72 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
          <div className="text-center text-slate-500">
            <div className="text-4xl mb-2">🗺️</div>
            <div className="font-medium">MapBox token шаардлагатай</div>
            <div className="text-sm">NEXT_PUBLIC_MAPBOX_TOKEN тохируулна уу</div>
          </div>
        </div>
      )}

      {/* Selected POI detail */}
      {selectedPOI && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold">{selectedPOI.name}</div>
              {selectedPOI.name_en && (
                <div className="text-sm text-slate-500">{selectedPOI.name_en}</div>
              )}
              {selectedPOI.address && (
                <div className="text-xs text-slate-400 mt-1">📍 {selectedPOI.address}</div>
              )}
              {selectedPOI.description && (
                <div className="text-sm mt-2">{selectedPOI.description}</div>
              )}
            </div>
            <button
              onClick={() => setSelectedPOI(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPOI.latitude},${selectedPOI.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-500"
          >
            🧭 Google Maps-аар чиглэл авах →
          </a>
        </div>
      )}

      {/* POI list */}
      <div className="space-y-2">
        {filteredPOIs.map((poi) => (
          <button
            key={poi.id}
            onClick={() => setSelectedPOI(poi)}
            className="w-full text-left bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 hover:border-green-400 transition-colors flex items-center gap-3"
          >
            <span className="text-2xl">{CATEGORY_ICONS[poi.category] ?? '📍'}</span>
            <div>
              <div className="font-medium text-sm">{poi.name}</div>
              {poi.address && <div className="text-xs text-slate-400">{poi.address}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
