'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

type MfaStep = 'idle' | 'enrolling' | 'verifying' | 'enrolled' | 'error';

export function MfaSetupSection() {
  const [step, setStep] = useState<MfaStep>('idle');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [totpCode, setTotpCode] = useState('');
  const [message, setMessage] = useState('');
  const [aal, setAal] = useState<string | null>(null);

  function getClient() {
    return getSupabaseBrowserClient();
  }

  async function checkAal() {
    const supabase = getClient();
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    setAal(data?.currentLevel ?? null);
  }

  async function startEnroll() {
    setMessage('');
    const supabase = getClient();
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error || !data) {
      setMessage('Алдаа: ' + (error?.message ?? 'Unknown'));
      setStep('error');
      return;
    }
    const totp = data.totp;
    setQrCode(totp.qr_code);
    setSecret(totp.secret);
    setFactorId(data.id);
    setStep('enrolling');
  }

  async function verifyTotp() {
    if (!totpCode || totpCode.length < 6) return;
    setMessage('');
    const supabase = getClient();
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError || !challengeData) {
      setMessage('Challenge алдаа: ' + (challengeError?.message ?? 'Unknown'));
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: totpCode,
    });
    if (verifyError) {
      setMessage('Буруу TOTP код: ' + verifyError.message);
      return;
    }
    setStep('enrolled');
    setMessage('2FA амжилттай идэвхжлээ! Дараа нэвтрэлтэнд aal2 шаардлагатай болно.');
    setAal('aal2');
  }

  async function unenroll() {
    if (!factorId) {
      setMessage('Factor ID олдсонгүй. Эхлээд дахин enroll хийнэ үү.');
      return;
    }
    const supabase = getClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      setMessage('Unenroll алдаа: ' + error.message);
      return;
    }
    setStep('idle');
    setQrCode('');
    setSecret('');
    setFactorId('');
    setTotpCode('');
    setAal(null);
    setMessage('2FA цуцлагдлаа.');
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.25rem' }}>🔐</span>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
          Хоёр хүчин зүйлийн баталгаажуулалт (2FA / TOTP)
        </h2>
        {aal === null && (
          <button
            onClick={checkAal}
            style={{
              marginLeft: 'auto',
              padding: '0.35rem 0.75rem',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: '#475569',
            }}
          >
            Статус шалгах
          </button>
        )}
      </div>

      {aal !== null && (
        <div
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: 20,
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1rem',
            background: aal === 'aal2' ? '#f0fdf4' : '#fef9c3',
            color: aal === 'aal2' ? '#166534' : '#92400e',
            border: `1px solid ${aal === 'aal2' ? '#bbf7d0' : '#fde68a'}`,
          }}
        >
          {aal === 'aal2' ? '✓ 2FA идэвхтэй (aal2)' : `⚠ Одоогийн түвшин: ${aal}`}
        </div>
      )}

      {message && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 8,
            marginBottom: '1rem',
            background: step === 'error' ? '#fef2f2' : '#f0fdf4',
            color: step === 'error' ? '#b91c1c' : '#166534',
            border: `1px solid ${step === 'error' ? '#fecaca' : '#bbf7d0'}`,
            fontSize: '0.875rem',
          }}
        >
          {message}
        </div>
      )}

      {step === 'idle' && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={startEnroll}
            style={{
              padding: '0.6rem 1.25rem',
              background: '#1d4ed8',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            🔑 2FA тохируулах
          </button>
          {factorId && (
            <button
              onClick={unenroll}
              style={{
                padding: '0.6rem 1.25rem',
                background: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              🗑 2FA цуцлах
            </button>
          )}
        </div>
      )}

      {step === 'enrolling' && (
        <div>
          <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Google Authenticator эсвэл Authy аппаар доорх QR кодыг скан хийнэ үү:
          </p>
          {qrCode && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrCode}
              alt="TOTP QR Code"
              style={{
                display: 'block',
                width: 180,
                height: 180,
                marginBottom: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 8,
                background: '#fff',
              }}
            />
          )}
          {secret && (
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              Гар аргаар оруулах хэрэгтэй бол:{' '}
              <code
                style={{
                  background: '#f1f5f9',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                }}
              >
                {secret}
              </code>
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="6 оронтой TOTP код"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{
                padding: '0.6rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: '1rem',
                letterSpacing: '0.2em',
                width: 180,
                textAlign: 'center',
              }}
            />
            <button
              onClick={verifyTotp}
              disabled={totpCode.length < 6}
              style={{
                padding: '0.6rem 1.25rem',
                background: totpCode.length < 6 ? '#e2e8f0' : '#1d4ed8',
                color: totpCode.length < 6 ? '#94a3b8' : '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: totpCode.length < 6 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              ✓ Баталгаажуулах
            </button>
            <button
              onClick={() => { setStep('idle'); setQrCode(''); setSecret(''); setFactorId(''); }}
              style={{
                padding: '0.6rem 1rem',
                background: 'transparent',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Цуцлах
            </button>
          </div>
        </div>
      )}

      {step === 'enrolled' && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={unenroll}
            style={{
              padding: '0.6rem 1.25rem',
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            🗑 2FA цуцлах (Unenroll)
          </button>
        </div>
      )}
    </div>
  );
}
