'use client';

import { useState, useTransition } from 'react';
import { applyForVIP } from '@/app/actions/auth';

export default function ApplyVipPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    organization: '',
    position: '',
    reason: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim() || !form.email.trim()) {
      setError('Овог нэр болон и-мэйл заавал шаардлагатай.');
      return;
    }
    startTransition(async () => {
      const result = await applyForVIP(form);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? 'Алдаа гарлаа.');
      }
    });
  }

  if (submitted) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-app, #f8fafc)', padding: '1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Хүсэлт амжилттай илгээгдлээ!</h1>
          <p style={{ color: '#64748b', marginTop: '0.75rem', fontSize: '0.9rem' }}>
            Таны VIP хүсэлтийг хянаж үзэх болно. Баталгаажсаны дараа и-мэйлээр мэдэгдэл ирнэ.
          </p>
          <a
            href="/login"
            style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.625rem 1.5rem', background: 'var(--color-accent, #4f46e5)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
          >
            Нэвтрэх хуудас руу
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-app, #f8fafc)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>VIP Бүртгэл</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            VIP зочны хүсэлтээ илгээнэ үү
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Овог нэр *', name: 'full_name', type: 'text', placeholder: 'Бат-Эрдэнэ Дорж' },
              { label: 'И-мэйл *', name: 'email', type: 'email', placeholder: 'та@example.com' },
              { label: 'Байгууллага', name: 'organization', type: 'text', placeholder: 'Монгол Улсын Засгийн газар' },
              { label: 'Албан тушаал', name: 'position', type: 'text', placeholder: 'Дэд сайд' },
            ].map((field) => (
              <div key={field.name}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Хүсэлтийн шалтгаан
              </label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Яагаад VIP зочны эрх хүсч байгаагаа тайлбарлана уу..."
                rows={4}
                style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--color-accent, #4f46e5)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1, marginTop: '0.5rem' }}
            >
              {isPending ? 'Илгээж байна...' : 'Хүсэлт илгээх'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <a href="/login" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
            ← Буцах
          </a>
        </div>
      </div>
    </main>
  );
}
