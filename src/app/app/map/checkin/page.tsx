'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { checkInAtZone } from '@/modules/map/actions';

type ZoneInfo = {
  id: string;
  name: string;
  name_en: string | null;
  zone_type: string;
};

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

function QRCheckinContent() {
  const searchParams = useSearchParams();
  const qrCode = searchParams.get('qr');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [zone, setZone] = useState<ZoneInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!qrCode) {
      setStatus('idle');
      return;
    }
    setStatus('loading');
    checkInAtZone(qrCode)
      .then((result) => {
        if (result.success && result.zone) {
          setZone(result.zone);
          setStatus('success');
        } else {
          setErrorMsg(result.error ?? 'Алдаа гарлаа');
          setStatus('error');
        }
      })
      .catch(() => {
        setErrorMsg('Серверийн алдаа гарлаа');
        setStatus('error');
      });
  }, [qrCode]);

  if (!qrCode) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4 mt-12">
        <div className="text-5xl">📷</div>
        <h1 className="text-xl font-bold">QR Check-in</h1>
        <p className="text-slate-500 text-sm">
          QR кодын линк байхгүй байна. Өрөөний QR кодыг скан хийнэ үү.
        </p>
        <Link
          href="/app/map"
          className="inline-block px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium"
        >
          Газрын зураг руу буцах
        </Link>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto p-6 text-center mt-20">
        <div className="text-5xl mb-4 animate-pulse">📍</div>
        <p className="text-slate-500">Байршил шалгаж байна...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4 mt-12">
        <div className="text-5xl">❌</div>
        <h1 className="text-xl font-bold text-red-600">Алдаа гарлаа</h1>
        <p className="text-slate-500 text-sm">{errorMsg}</p>
        <Link
          href="/app/map"
          className="inline-block px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-medium"
        >
          Буцах
        </Link>
      </div>
    );
  }

  if (status === 'success' && zone) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6 mt-8">
        <div className="text-center">
          <div className="text-6xl mb-3">{ZONE_TYPE_ICONS[zone.zone_type] ?? '📍'}</div>
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-2">
            ✅ Байршил бүртгэгдлээ
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 text-center space-y-1">
          <div className="text-xl font-bold">{zone.name}</div>
          {zone.name_en && <div className="text-slate-500">{zone.name_en}</div>}
        </div>

        <div className="flex gap-3">
          <Link
            href="/app/map?tab=indoor"
            className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-white rounded-xl font-semibold text-center text-sm transition-colors"
          >
            🗺️ Зураг харах
          </Link>
          <Link
            href="/app/map"
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold text-center text-sm transition-colors"
          >
            Буцах
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

export default function QRCheckinPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto p-6 text-center mt-20">
        <div className="text-5xl mb-4 animate-pulse">📍</div>
        <p className="text-slate-500">Ачааллаж байна...</p>
      </div>
    }>
      <QRCheckinContent />
    </Suspense>
  );
}
