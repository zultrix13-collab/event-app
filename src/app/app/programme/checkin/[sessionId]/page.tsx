'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkInToSession } from '@/modules/programme/actions';
import { use } from 'react';

export default function CheckInPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleCheckIn() {
    setStatus('loading');
    const result = await checkInToSession(sessionId, 'qr');
    if (result.success) {
      setStatus('success');
      setTimeout(() => router.push(`/app/programme/${sessionId}`), 2000);
    } else {
      if (result.error?.includes('duplicate') || result.error?.includes('unique')) {
        setStatus('already');
      } else {
        setStatus('error');
        setError(result.error ?? 'Алдаа гарлаа');
      }
    }
  }

  return (
    <div className="max-w-sm mx-auto p-4 min-h-screen flex flex-col">
      <Link href={`/app/programme/${sessionId}`} className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← Буцах
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {status === 'success' ? (
          <div className="space-y-4">
            <div className="text-6xl">✅</div>
            <h2 className="text-xl font-bold text-green-700">Амжилттай бүртгэгдлээ!</h2>
            <p className="text-gray-500 text-sm">Таныг бүртгэж авлаа. Арга хэмжээнд тавтай морилно уу!</p>
          </div>
        ) : status === 'already' ? (
          <div className="space-y-4">
            <div className="text-6xl">ℹ️</div>
            <h2 className="text-xl font-bold text-blue-700">Та аль хэдийн бүртгэгдсэн байна</h2>
            <p className="text-gray-500 text-sm">Энэ арга хэмжээнд бүртгэгдсэн байна.</p>
            <Link href={`/app/programme/${sessionId}`} className="text-blue-600 hover:underline text-sm">
              Буцах
            </Link>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">📱 QR Check-in</h1>
              <p className="text-gray-500 text-sm">Арга хэмжээнд ирсэн эсэхийг бүртгэхийн тулд доорх товчийг дарна уу</p>
            </div>

            {/* QR placeholder */}
            <div className="bg-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center">
              <div className="text-6xl mb-3">📲</div>
              <p className="text-sm text-gray-600 font-mono bg-white px-3 py-1 rounded border text-center break-all">
                {sessionId.slice(0, 8)}...
              </p>
              <p className="text-xs text-gray-400 mt-2">Session QR Code</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckIn}
              disabled={status === 'loading'}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Бүртгэж байна...
                </span>
              ) : (
                '👆 Ирлээ гэж бүртгүүлэх'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
