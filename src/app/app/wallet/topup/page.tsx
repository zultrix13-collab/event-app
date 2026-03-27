'use client';

import { useState, useEffect, useRef } from 'react';
import { topupWallet, checkQPayStatus } from '@/modules/services/actions';
import type { QPayInvoice } from '@/modules/services/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PRESET_AMOUNTS = [10_000, 20_000, 50_000];

export default function TopupPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [step, setStep] = useState<'select' | 'qr' | 'success'>('select');
  const [invoice, setInvoice] = useState<QPayInvoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pollStatus, setPollStatus] = useState('Төлбөр хүлээж байна...');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  const finalAmount = amount !== '' ? amount : Number(customAmount) || 0;

  const handleStart = async () => {
    if (!finalAmount || finalAmount < 1000) {
      setError('Хамгийн багадаа ₮1,000 оруулна уу');
      return;
    }
    setError('');
    setLoading(true);

    const result = await topupWallet(finalAmount);
    setLoading(false);

    if (result.success && result.data) {
      setInvoice(result.data);
      setStep('qr');
      startPolling(result.data.invoice_id!);
    } else {
      setError(result.error ?? 'Алдаа гарлаа. Дахин оролдоно уу.');
    }
  };

  const startPolling = (invoiceId: string) => {
    pollCountRef.current = 0;
    pollRef.current = setInterval(async () => {
      pollCountRef.current++;

      if (pollCountRef.current > 100) {
        // 5 minutes
        clearInterval(pollRef.current!);
        setPollStatus('Хугацаа дууслаа. Дахин оролдоно уу.');
        return;
      }

      const result = await checkQPayStatus(invoiceId);
      if (result.success && result.data?.isPaid) {
        clearInterval(pollRef.current!);
        setStep('success');
        setTimeout(() => router.push('/app/wallet'), 2000);
      } else {
        const remaining = Math.max(0, 300 - pollCountRef.current * 3);
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        setPollStatus(`Хүлээж байна... ${min}:${sec.toString().padStart(2, '0')}`);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Цэнэглэлт амжилттай!</h2>
        <p className="text-gray-500 mb-1">
          ₮{finalAmount.toLocaleString()} таны хэтэвчид нэмэгдлээ.
        </p>
        <p className="text-sm text-gray-400">Хэтэвч рүү шилжиж байна...</p>
      </div>
    );
  }

  if (step === 'qr' && invoice) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { setStep('select'); if (pollRef.current) clearInterval(pollRef.current); }} className="text-blue-600 text-sm">← Буцах</button>
          <h1 className="text-xl font-bold text-gray-900">QPay төлбөр</h1>
        </div>

        <div className="bg-white rounded-2xl border p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Цэнэглэх дүн</p>
          <p className="text-3xl font-bold text-blue-600 mb-4">₮{finalAmount.toLocaleString()}</p>

          {invoice.qr_image ? (
            <div className="flex justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${invoice.qr_image}`}
                alt="QPay QR"
                className="w-56 h-56 rounded-xl"
              />
            </div>
          ) : (
            <div className="w-56 h-56 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-400 text-sm">QR ачааллаж байна...</span>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-1">QPay аппаар уншуулна уу</p>

          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {pollStatus}
          </div>

          <p className="text-xs text-gray-300 mt-2">
            Дуусах хугацаа: {invoice.expires_at ? new Date(invoice.expires_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/wallet" className="text-blue-600 text-sm">← Буцах</Link>
        <h1 className="text-xl font-bold text-gray-900">💳 Хэтэвч цэнэглэх</h1>
      </div>

      {/* Preset amounts */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Дүн сонгох</p>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              onClick={() => { setAmount(preset); setCustomAmount(''); }}
              className={`py-3 rounded-xl border font-semibold text-sm transition-colors ${
                amount === preset
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              ₮{preset.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Өөрийн дүн</p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₮</span>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setAmount(''); }}
            placeholder="0"
            min="1000"
            className="w-full border rounded-xl px-8 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Payment method */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Төлбөрийн арга</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="py-3 rounded-xl border-2 border-blue-500 bg-blue-50 text-blue-700 font-semibold text-sm flex flex-col items-center gap-1">
            <span className="text-2xl">📱</span>
            QPay
          </button>
          <button disabled className="py-3 rounded-xl border border-gray-200 text-gray-300 font-semibold text-sm flex flex-col items-center gap-1">
            <span className="text-2xl">💳</span>
            SocialPay
            <span className="text-xs">(удахгүй)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={loading || !finalAmount}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-base hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading
          ? 'Боловсруулж байна...'
          : `₮${finalAmount ? finalAmount.toLocaleString() : '0'} цэнэглэх`}
      </button>
    </div>
  );
}
