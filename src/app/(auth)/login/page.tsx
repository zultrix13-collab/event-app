'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithOTP } from '@/app/actions/auth';

export default function LoginPage() {
  const [tab, setTab] = useState<'participant' | 'staff'>('participant');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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
              disabled={isPending}
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
