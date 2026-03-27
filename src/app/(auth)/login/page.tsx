'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithOTP } from '@/app/actions/auth';

export default function LoginPage() {
  const [tab, setTab] = useState<'participant' | 'staff'>('participant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleParticipantSubmit(e: React.FormEvent) {
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

  function handleStaffSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('И-мэйл болон нууц үг оруулна уу.');
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
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-app, #f8fafc)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Event Digital Platform</h1>
          <p style={{ color: 'var(--color-text-muted, #64748b)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Тавтай морилно уу
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            {(['participant', 'staff'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                style={{
                  flex: 1,
                  padding: '0.625rem 0',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: tab === t ? 600 : 400,
                  color: tab === t ? 'var(--color-accent, #4f46e5)' : '#64748b',
                  borderBottom: tab === t ? '2px solid var(--color-accent, #4f46e5)' : '2px solid transparent',
                  marginBottom: -1,
                  transition: 'all 0.15s',
                }}
              >
                {t === 'participant' ? 'Оролцогч' : 'Ажилтан / Админ'}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          {tab === 'participant' ? (
            <form onSubmit={handleParticipantSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                  И-мэйл хаяг
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="та@example.com"
                  required
                  style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--color-accent, #4f46e5)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1 }}
              >
                {isPending ? 'Илгээж байна...' : 'Нэг удаагийн код илгээх'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStaffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                  И-мэйл хаяг
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="та@example.com"
                  required
                  style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                  Нууц үг
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--color-accent, #4f46e5)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1 }}
              >
                {isPending ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a
            href="/apply-vip"
            style={{ fontSize: '0.875rem', color: 'var(--color-accent, #4f46e5)', textDecoration: 'none', fontWeight: 500 }}
          >
            VIP бүртгэл хийх →
          </a>
        </div>
      </div>
    </main>
  );
}
