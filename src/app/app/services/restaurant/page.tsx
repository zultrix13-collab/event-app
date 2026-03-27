'use client';

import { useState, useEffect } from 'react';
import {
  getRestaurants,
  bookRestaurant,
  getUserRestaurantBookings,
  cancelRestaurantBooking,
} from '@/modules/services/actions';
import type { Restaurant, RestaurantBooking } from '@/modules/services/types';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Хүлээгдэж буй', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Баталгаажсан', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Цуцалсан', color: 'bg-red-100 text-red-800' },
};

export default function RestaurantPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [bookings, setBookings] = useState<RestaurantBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [bookingTime, setBookingTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'my'>('list');

  useEffect(() => {
    Promise.all([
      getRestaurants(),
      getUserRestaurantBookings(),
    ]).then(([r, b]) => {
      if (r.success && r.data) setRestaurants(r.data);
      if (b.success && b.data) setBookings(b.data);
      setLoading(false);
    });
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    setSubmitting(true);

    const result = await bookRestaurant({
      restaurant_name: selectedRestaurant.name,
      booking_time: bookingTime,
      party_size: partySize,
      special_requests: specialRequests || undefined,
    });

    setSubmitting(false);
    if (result.success && result.data) {
      setBookings((prev) => [result.data!, ...prev]);
      setSelectedRestaurant(null);
      setActiveTab('my');
    } else {
      alert(result.error ?? 'Захиалга амжилтгүй боллоо');
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Захиалгыг цуцлах уу?')) return;
    const result = await cancelRestaurantBooking(bookingId);
    if (result.success) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/app/services" className="text-blue-600 text-sm">← Буцах</Link>
        <h1 className="text-xl font-bold text-gray-900">🍽️ Ресторан</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Ресторанууд
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'my' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Миний захиалга {bookings.length > 0 && `(${bookings.length})`}
        </button>
      </div>

      {/* Restaurant list */}
      {activeTab === 'list' && (
        <div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-28" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <p className="text-4xl mb-2">🍽️</p>
              <p className="text-gray-500">Ресторан байхгүй байна</p>
            </div>
          ) : (
            <div className="space-y-3">
              {restaurants.map((r) => (
                <div key={r.id} className="bg-white rounded-xl border overflow-hidden">
                  <div className="flex">
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {r.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">🍽️</span>
                      )}
                    </div>
                    <div className="p-3 flex-1">
                      <p className="font-semibold text-gray-900">{r.name}</p>
                      {r.cuisine_type && (
                        <p className="text-xs text-gray-500">{r.cuisine_type}</p>
                      )}
                      {r.location && (
                        <p className="text-xs text-gray-500">📍 {r.location}</p>
                      )}
                      <button
                        onClick={() => setSelectedRestaurant(r)}
                        className="mt-2 px-3 py-1 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600"
                      >
                        Захиалах
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My bookings */}
      {activeTab === 'my' && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <p className="text-4xl mb-2">📋</p>
              <p className="text-gray-500">Захиалга байхгүй байна</p>
            </div>
          ) : (
            bookings.map((b) => {
              const sc = STATUS_LABELS[b.status] ?? STATUS_LABELS.pending;
              return (
                <div key={b.id} className="bg-white border rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{b.restaurant_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(b.booking_time).toLocaleDateString('mn-MN', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                        {' · '}
                        {b.party_size} хүн
                      </p>
                      {b.special_requests && (
                        <p className="text-xs text-gray-400 mt-1">{b.special_requests}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                  {b.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="mt-2 text-xs text-red-500 hover:underline"
                    >
                      Цуцлах
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Booking modal */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{selectedRestaurant.name} — захиалах</h3>
              <button onClick={() => setSelectedRestaurant(null)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Огноо, цаг *</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Хүний тоо</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">−</button>
                  <span className="w-8 text-center font-medium">{partySize}</span>
                  <button type="button" onClick={() => setPartySize((p) => Math.min(20, p + 1))}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">+</button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Онцгой хүсэлт</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={2}
                  placeholder="Allergi, тусгай суудал..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRestaurant(null)}
                  className="flex-1 py-3 border rounded-xl font-medium text-sm"
                >
                  Буцах
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 disabled:opacity-50"
                >
                  {submitting ? 'Захиалж байна...' : 'Захиалах'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
