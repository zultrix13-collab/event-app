'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOTP, signInWithOTP } from '@/app/actions/auth';
import { Suspense } from 'react';

function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const router = useRouter();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [resendCountdown, setResendCountdown] = useState(60);
  const [totalCountdown, setTotalCountdown] = useState(300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const timer = setInterval(() => {
      setResendCountdown((c) => (c > 0 ? c - 1 : 0));
      setTotalCountdown((c) => {
        if (c <= 1) clearInterval(timer);
        return c > 0 ? c - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function handleChange(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setCode(cleaned);
    setError('');
  }

  function handleVerify() {
    if (!code || code.length < 4) return;
    setError('');
    startTransition(async () => {
      const result = await verifyOTP(email, code);
      if (result.success && result.redirectUrl) {
        router.push(result.redirectUrl);
      } else {
        setError(result.error ?? 'Буруу код. Дахин оролдоно уу.');
        setCode('');
        inputRef.current?.focus();
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleVerify();
  }

  function handleResend() {
    if (resendCountdown > 0) return;
    startTransition(async () => {
      await signInWithOTP(email);
      setResendCountdown(60);
      setTotalCountdown(300);
      setCode('');
      setError('');
      inputRef.current?.focus();
    });
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-app, #f8fafc)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📩</div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, margin: 0 }}>Кодоо оруулна уу</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <strong>{email}</strong> хаяг руу нэвтрэх код илгээлээ.
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {totalCountdown === 0 ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#b91c1c', fontWeight: 500 }}>Кодын хугацаа дууслаа.</p>
              <button onClick={handleResend} style={{ marginTop: '1rem', padding: '0.625rem 1.5rem', background: 'var(--color-accent, #4f46e5)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                Шинэ код авах
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: totalCountdown < 60 ? '#b91c1c' : 'var(--color-accent, #4f46e5)' }}>
                  {formatTime(totalCountdown)}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '0.5rem' }}>үлдсэн</span>
              </div>

              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Мэйлээр ирсэн кодоо оруулна уу"
                disabled={isPending}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                  border: '2px solid',
                  borderColor: error ? '#fca5a5' : '#e2e8f0',
                  borderRadius: 10,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '0.625rem 0.875rem', marginTop: '0.75rem', fontSize: '0.875rem', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={isPending || code.length < 4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginTop: '1rem',
                  background: 'var(--color-accent, #4f46e5)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: (isPending || code.length < 4) ? 'not-allowed' : 'pointer',
                  opacity: (isPending || code.length < 4) ? 0.6 : 1,
                }}
              >
                {isPending ? 'Шалгаж байна...' : 'Баталгаажуулах'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  onClick={handleResend}
                  disabled={resendCountdown > 0 || isPending}
                  style={{ background: 'none', border: 'none', cursor: resendCountdown > 0 ? 'default' : 'pointer', color: resendCountdown > 0 ? '#94a3b8' : 'var(--color-accent, #4f46e5)', fontSize: '0.875rem', fontWeight: 500 }}
                >
                  {resendCountdown > 0 ? `Дахин код авах (${resendCountdown}с)` : 'Дахин код авах'}
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <a href="/login" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>← Буцах</a>
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Уншиж байна...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
