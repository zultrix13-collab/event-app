'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

interface Vendor {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  category: string;
  booth_number: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  is_active: boolean;
}

const CATEGORIES = [
  { value: 'all', label: 'Бүгд' },
  { value: 'general', label: 'Ерөнхий' },
  { value: 'food', label: 'Хоол' },
  { value: 'merchandise', label: 'Бараа' },
  { value: 'service', label: 'Үйлчилгээ' },
];

const CATEGORY_ICONS: Record<string, string> = {
  general: '🏪',
  food: '🍽️',
  merchandise: '🎁',
  service: '🔧',
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<Vendor | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    let query = sb.from('vendors').select('*').eq('is_active', true);
    if (category !== 'all') {
      query = query.eq('category', category);
    }
    query.order('booth_number', { ascending: true }).then(({ data }: { data: unknown[] | null }) => {
      setVendors((data ?? []) as Vendor[]);
      setLoading(false);
    });
  }, [category]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900 mb-1">🏪 Дэлгүүрүүд</h1>
        <p className="text-sm text-gray-400">Арга хэмжээний оролцогч худалдагчид</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => { setCategory(c.value); setLoading(true); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              category === c.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Vendor grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-40" />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <p className="text-5xl mb-3">🏪</p>
          <p className="text-gray-500 font-medium">Дэлгүүр байхгүй байна</p>
          <p className="text-sm text-gray-400 mt-1">Удахгүй нэмэгдэх болно</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {vendors.map((vendor) => (
            <button
              key={vendor.id}
              onClick={() => setSelected(vendor)}
              className="bg-white rounded-2xl border p-4 text-left hover:shadow-md hover:border-indigo-200 transition-all"
            >
              {/* Logo */}
              <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center mb-3 overflow-hidden">
                {vendor.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vendor.logo_url} alt={vendor.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-2xl">{CATEGORY_ICONS[vendor.category] ?? '🏪'}</span>
                )}
              </div>

              <p className="font-semibold text-gray-900 text-sm line-clamp-2">{vendor.name}</p>

              {vendor.booth_number && (
                <p className="text-xs text-indigo-600 mt-1 font-medium">
                  Стенд {vendor.booth_number}
                </p>
              )}

              <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                {CATEGORIES.find((c) => c.value === vendor.category)?.label ?? vendor.category}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Vendor detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {selected.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selected.logo_url} alt={selected.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-2xl">{CATEGORY_ICONS[selected.category] ?? '🏪'}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selected.name}</p>
                  {selected.name_en && (
                    <p className="text-sm text-gray-400">{selected.name_en}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >✕</button>
            </div>

            {/* Details */}
            <div className="space-y-3">
              {selected.booth_number && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-gray-400">📍</span>
                  <span>Стенд дугаар: <strong>{selected.booth_number}</strong></span>
                </div>
              )}

              {selected.description && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                  {selected.description}
                </p>
              )}

              {selected.phone && (
                <a
                  href={`tel:${selected.phone}`}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <span>📞</span>
                  <span>{selected.phone}</span>
                </a>
              )}

              {selected.website && (
                <a
                  href={selected.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <span>🌐</span>
                  <span>{selected.website}</span>
                </a>
              )}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-5 w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              Хаах
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
