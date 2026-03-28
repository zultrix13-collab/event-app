'use client';

import { useEffect, useRef, useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOTP, signInWithOTP } from '@/app/actions/auth';

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

  function handleVerify(codeToVerify?: string) {
    const verifyCode = codeToVerify ?? code;
    if (!verifyCode || verifyCode.length < 4) return;
    setError('');
    startTransition(async () => {
      const result = await verifyOTP(email, verifyCode);
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
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-app)',
        padding: 'var(--space-4)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '26rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div
            aria-hidden="true"
            style={{
              fontSize: '2.5rem',
              marginBottom: 'var(--space-3)',
              lineHeight: 1,
            }}
          >
            📩
          </div>
          <h1
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              margin: 0,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Кодоо оруулна уу
          </h1>
          <p
            style={{
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              margin: 'var(--space-2) 0 0',
            }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong> хаяг руу{' '}
            нэвтрэх код илгээлээ.
          </p>
        </div>

        {/* Card */}
        <div
          className="ui-card"
          style={{ padding: 'var(--space-8)', animation: 'fadeIn 0.2s ease both' }}
        >
          {totalCountdown === 0 ? (
            <div style={{ textAlign: 'center' }}>
              <div className="ui-alert ui-alert--danger" style={{ marginBottom: 'var(--space-5)' }}>
                Кодын хугацаа дууслаа.
              </div>
              <button
                onClick={handleResend}
                className="ui-button ui-button--primary ui-button--full"
                style={{ padding: '0.75rem 1rem' }}
              >
                Шинэ код авах
              </button>
            </div>
          ) : (
            <>
              {/* Countdown */}
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
                <span
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: totalCountdown < 60 ? 'var(--color-status-danger)' : 'var(--color-accent)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatTime(totalCountdown)}
                </span>
                <span
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--text-xs)',
                    marginLeft: 'var(--space-2)',
                  }}
                >
                  үлдсэн
                </span>
              </div>

              {/* OTP input */}
              <div>
                <label htmlFor="otp-code" className="ui-label" style={{ marginBottom: 'var(--space-2)' }}>
                  Нэвтрэх код
                </label>
                <input
                  id="otp-code"
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label="Нэг удаагийн нэвтрэх код"
                  value={code}
                  onChange={(e) => handleChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Мэйлээр ирсэн кодоо оруулна уу"
                  disabled={isPending}
                  className="ui-input"
                  style={{
                    marginTop: 'var(--space-2)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    letterSpacing: '0.25em',
                    textAlign: 'center',
                    padding: '0.875rem 1rem',
                    borderColor: error ? 'var(--color-status-danger-border)' : undefined,
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="ui-alert ui-alert--danger"
                  style={{ marginTop: 'var(--space-3)', textAlign: 'center' }}
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={() => handleVerify()}
                disabled={isPending || code.length < 4}
                className="ui-button ui-button--primary ui-button--full"
                style={{ marginTop: 'var(--space-4)', padding: '0.75rem 1rem' }}
              >
                {isPending ? 'Шалгаж байна...' : 'Баталгаажуулах'}
              </button>

              {/* Resend */}
              <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                <button
                  onClick={handleResend}
                  disabled={resendCountdown > 0 || isPending}
                  className="ui-button ui-button--ghost"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  {resendCountdown > 0
                    ? `Дахин код авах (${resendCountdown}с)`
                    : 'Дахин код авах'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          <a
            href="/login"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
            }}
          >
            ← Нэвтрэх хуудас руу буцах
          </a>
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-app)',
            padding: 'var(--space-4)',
          }}
        >
          <div className="ui-card" style={{ width: '100%', maxWidth: '26rem', padding: 'var(--space-8)', textAlign: 'center' }}>
            <div aria-hidden="true" style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>📩</div>
            <p className="ui-text-muted">Уншиж байна...</p>
          </div>
        </main>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
