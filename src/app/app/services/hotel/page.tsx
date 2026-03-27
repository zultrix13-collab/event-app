import { createClient } from '@/lib/supabase/server';
import type { Hotel } from '@/modules/services/types';
import Link from 'next/link';

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
    </span>
  );
}

export default async function HotelPage() {
  const supabase = await createClient();
  const { data: hotels } = await supabase
    .from('hotels')
    .select('*')
    .eq('is_active', true)
    .order('distance_km', { ascending: true });

  const hotelList = (hotels ?? []) as Hotel[];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/services" className="text-blue-600 text-sm">← Буцах</Link>
        <h1 className="text-xl font-bold text-gray-900">🏨 Зочид буудал</h1>
      </div>

      {hotelList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-5xl mb-3">🏨</p>
          <p className="text-gray-500">Буудлын мэдээлэл байхгүй байна</p>
          <p className="text-sm text-gray-400 mt-1">Удахгүй нэмэгдэх болно</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hotelList.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-xl border overflow-hidden">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {hotel.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={hotel.image_url}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">🏨</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{hotel.name}</p>
                    {hotel.name_en && (
                      <p className="text-sm text-gray-400">{hotel.name_en}</p>
                    )}
                  </div>
                  {hotel.stars && <StarRating stars={hotel.stars} />}
                </div>

                {hotel.address && (
                  <p className="text-sm text-gray-500 mb-1">📍 {hotel.address}</p>
                )}

                {hotel.distance_km != null && (
                  <p className="text-sm text-gray-500 mb-1">
                    🚶 Талбараас {hotel.distance_km} км
                  </p>
                )}

                {hotel.phone && (
                  <p className="text-sm text-gray-500 mb-1">📞 {hotel.phone}</p>
                )}

                {hotel.description && (
                  <p className="text-sm text-gray-600 mt-2 mb-3">{hotel.description}</p>
                )}

                {hotel.booking_url ? (
                  <a
                    href={hotel.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                  >
                    Захиалга хийх →
                  </a>
                ) : (
                  <span className="text-sm text-gray-400 italic">Онлайн захиалга байхгүй</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
