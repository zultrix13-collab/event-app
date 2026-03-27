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

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Бүгд',
  venue: '🏛️ Газар',
  hotel: '🏨 Буудал',
  restaurant: '🍽️ Хоол',
  transport: '✈️ Тээвэр',
  medical: '🏥 Эмнэлэг',
};

export default function OutdoorMap({ pois }: { pois: MapPOI[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<MapPOI | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [mapLoaded, setMapLoaded] = useState(false);

  const token = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !token) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${token}&libraries=marker&v=beta`;
    script.async = true;
    script.onload = () => {
      const map = new window.google.maps.Map(mapContainer.current!, {
        center: { lat: 47.9077, lng: 106.9177 },
        zoom: 13,
        mapId: 'event-app-map',
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
      });
      mapRef.current = map;

      // Add markers
      pois.forEach((poi) => {
        const el = document.createElement('div');
        el.className = 'text-2xl cursor-pointer select-none';
        el.style.cssText = 'font-size:28px;line-height:1;';
        el.textContent = CATEGORY_ICONS[poi.category] ?? '📍';

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: Number(poi.latitude), lng: Number(poi.longitude) },
          content: el,
          title: poi.name,
        });

        marker.addListener('click', () => setSelectedPOI(poi));
        markersRef.current.push(marker);
      });

      setMapLoaded(true);
    };
    document.head.appendChild(script);
  }, [pois, token]);

  const filteredPOIs = activeFilter === 'all'
    ? pois
    : pois.filter(p => p.category === activeFilter);

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap font-medium transition-colors ${
              activeFilter === cat
                ? 'bg-green-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Map */}
      {token ? (
        <div
          ref={mapContainer}
          className="w-full h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
        />
      ) : (
        <div className="w-full h-72 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
          <div className="text-center text-slate-500">
            <div className="text-4xl mb-2">🗺️</div>
            <div className="font-medium">Google Maps token шаардлагатай</div>
            <div className="text-sm">NEXT_PUBLIC_GOOGLE_MAPS_KEY тохируулна уу</div>
          </div>
        </div>
      )}

      {/* Selected POI detail */}
      {selectedPOI && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-green-300 dark:border-green-700 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <span className="text-3xl">{CATEGORY_ICONS[selectedPOI.category]}</span>
              <div>
                <div className="font-bold">{selectedPOI.name}</div>
                {selectedPOI.name_en && <div className="text-sm text-slate-500">{selectedPOI.name_en}</div>}
                {selectedPOI.address && <div className="text-xs text-slate-400 mt-1">📍 {selectedPOI.address}</div>}
                {selectedPOI.description && <div className="text-sm mt-2 text-slate-600 dark:text-slate-300">{selectedPOI.description}</div>}
              </div>
            </div>
            <button onClick={() => setSelectedPOI(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPOI.latitude},${selectedPOI.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-500"
          >
            🧭 Google Maps-аар чиглэл авах →
          </a>
        </div>
      )}

      {/* POI List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">
          {filteredPOIs.length} цэг
        </h3>
        {filteredPOIs.map(poi => (
          <button
            key={poi.id}
            onClick={() => setSelectedPOI(poi)}
            className={`w-full text-left rounded-xl p-3 border transition-colors flex items-center gap-3 ${
              selectedPOI?.id === poi.id
                ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-green-300'
            }`}
          >
            <span className="text-2xl">{CATEGORY_ICONS[poi.category]}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{poi.name}</div>
              {poi.address && <div className="text-xs text-slate-400 truncate">{poi.address}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
