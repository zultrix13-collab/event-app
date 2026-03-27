'use client';

import { useState } from 'react';
import { bookTransport, getUserTransportBookings } from '@/modules/services/actions';
import type { TransportType, TransportBooking } from '@/modules/services/types';
import Link from 'next/link';
import { useEffect } from 'react';

const TRANSPORT_TYPES: { value: TransportType; label: string; icon: string }[] = [
  { value: 'taxi', label: 'Такси', icon: '🚕' },
  { value: 'rental', label: 'Машин түрээс', icon: '🚗' },
  { value: 'shuttle', label: 'Шаттл', icon: '🚌' },
  { value: 'airport_transfer', label: 'Нисэх буудал', icon: '✈️' },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Хүлээгдэж буй', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Баталгаажсан', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Дууссан', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'Цуцалсан', color: 'bg-red-100 text-red-800' },
};

export default function TransportPage() {
  const [type, setType] = useState<TransportType>('taxi');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookings, setBookings] = useState<TransportBooking[]>([]);

  useEffect(() => {
    getUserTransportBookings().then((r) => {
      if (r.success && r.data) setBookings(r.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await bookTransport({
      type,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation || undefined,
      pickup_time: pickupTime,
      flight_number: flightNumber || undefined,
      passenger_count: passengerCount,
      notes: notes || undefined,
    });

    setSubmitting(false);
    if (result.success) {
      setConfirmed(true);
      if (result.data) setBookings((prev) => [result.data!, ...prev]);
    } else {
      alert(result.error ?? 'Захиалга амжилтгүй боллоо');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/app/services" className="text-blue-600 text-sm">← Буцах</Link>
        <h1 className="text-xl font-bold text-gray-900">🚌 Тээвэр</h1>
      </div>

      {/* Warning banner */}
      <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
        <span className="text-amber-500 flex-shrink-0">⚠️</span>
        <p className="text-sm text-amber-700">
          3rd party provider интеграц хийгдэж байна. Захиалгыг манай баг гар аргаар баталгаажуулна.
        </p>
      </div>

      {/* Booking form */}
      {!confirmed ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 space-y-4 mb-6">
          {/* Transport type */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Тээврийн хэрэгсэл</label>
            <div className="grid grid-cols-2 gap-2">
              {TRANSPORT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${
                    type === t.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Flight number for airport transfer */}
          {type === 'airport_transfer' && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Нислэгийн дугаар</label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="MN123"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Гарах байршил *</label>
            <input
              type="text"
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="Зочид буудал, хаяг..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Очих байршил</label>
            <input
              type="text"
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              placeholder="Хаана очих вэ?"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Цаг *</label>
            <input
              type="datetime-local"
              required
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Хүний тоо</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPassengerCount((c) => Math.max(1, c - 1))}
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"
              >−</button>
              <span className="w-8 text-center font-medium">{passengerCount}</span>
              <button
                type="button"
                onClick={() => setPassengerCount((c) => Math.min(10, c + 1))}
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"
              >+</button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Тэмдэглэл</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Нэмэлт мэдээлэл..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Захиалж байна...' : 'Захиалах'}
          </button>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-2xl mb-1">✅</p>
          <p className="font-semibold text-green-800">Захиалга амжилттай!</p>
          <p className="text-sm text-green-600 mt-1">Манай баг тантай холбогдох болно.</p>
          <button
            onClick={() => setConfirmed(false)}
            className="mt-3 text-sm text-green-700 underline"
          >
            Шинэ захиалга хийх
          </button>
        </div>
      )}

      {/* My bookings */}
      {bookings.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-800 mb-3">Миний захиалгууд</h2>
          <div className="space-y-2">
            {bookings.map((b) => {
              const statusCfg = STATUS_LABELS[b.status] ?? STATUS_LABELS.pending;
              const typeIcon = TRANSPORT_TYPES.find((t) => t.value === b.type)?.icon ?? '🚗';
              return (
                <div key={b.id} className="bg-white border rounded-xl p-3 flex items-center gap-3">
                  <span className="text-2xl">{typeIcon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{b.pickup_location}</p>
                    {b.pickup_time && (
                      <p className="text-xs text-gray-500">
                        {new Date(b.pickup_time).toLocaleDateString('mn-MN', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
