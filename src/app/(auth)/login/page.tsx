'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithOTP, signInWithGoogle } from '@/app/actions/auth';

export default function LoginPage() {
  const [tab, setTab] = useState<'participant' | 'staff'>('participant');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const router = useRouter();

  function handleGoogleSignIn() {
    setError('');
    startGoogleTransition(async () => {
      const result = await signInWithGoogle();
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        setError(result.error ?? 'Google нэвтрэлт амжилтгүй боллоо.');
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('И-мэйл хаягаа оруулна уу.');
      return;
    }
    startTransition(async () => {
      const result = await signInWithOTP(email.trim().toLowerCase());
      if (result.success) {
        router.push(`/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      } else {
        setError(result.error ?? 'Алдаа гарлаа.');
      }
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
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: 'var(--space-4)',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
            }}
          >
            🎪
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
            Event Digital Platform
          </h1>
          <p
            style={{
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              margin: 'var(--space-2) 0 0',
            }}
          >
            Тавтай морилно уу
          </p>
        </div>

        {/* Card */}
        <div
          className="ui-card"
          style={{ padding: 'var(--space-8)', animation: 'fadeIn 0.2s ease both' }}
        >
          {/* Tabs */}
          <div role="tablist" className="ui-tabs" style={{ marginBottom: 'var(--space-6)' }}>
            {(['participant', 'staff'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => {
                  setTab(t);
                  setError('');
                }}
                className={`ui-tab ${tab === t ? 'ui-tab--active' : ''}`}
              >
                {t === 'participant' ? 'Оролцогч' : 'Ажилтан / Админ'}
              </button>
            ))}
          </div>

          {/* Staff notice */}
          {tab === 'staff' && (
            <div className="ui-alert ui-alert--info" style={{ marginBottom: 'var(--space-4)' }}>
              Ажилтан/Зохион байгуулагчийн нэвтрэлт — имэйлийн OTP код ашиглана
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="ui-alert ui-alert--danger" style={{ marginBottom: 'var(--space-4)' }}>
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGooglePending || isPending}
            className="ui-button ui-button--full"
            style={{
              marginBottom: 'var(--space-4)',
              padding: '0.75rem 1rem',
              background: '#fff',
              border: '1.5px solid #e5e7eb',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              cursor: isGooglePending ? 'not-allowed' : 'pointer',
              opacity: isGooglePending ? 0.7 : 1,
              transition: 'box-shadow 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)')}
            onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            {isGooglePending ? (
              <span style={{ fontSize: '0.875rem' }}>Нэвтэрч байна...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Google-ээр нэвтрэх
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            эсвэл
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          {/* Form — identical for both tabs */}
          <form onSubmit={handleSubmit} className="ui-form-block">
            <div>
              <label htmlFor="login-email" className="ui-label" style={{ marginBottom: 'var(--space-2)' }}>
                И-мэйл хаяг
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="та@example.com"
                required
                autoComplete="email"
                className="ui-input"
                style={{ marginTop: 'var(--space-2)' }}
              />
            </div>
            <button
              type="submit"
              disabled={isPending || isGooglePending}
              className="ui-button ui-button--primary ui-button--full"
              style={{ marginTop: 'var(--space-2)', padding: '0.75rem 1rem' }}
            >
              {isPending ? 'Илгээж байна...' : 'Нэг удаагийн код илгээх'}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 'var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <a href="/apply-vip" className="ui-link-subtle">
            VIP бүртгэл хийх →
          </a>
          <a href="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            ← Нүүр хуудас руу буцах
          </a>
        </div>
      </div>
    </main>
  );
}
