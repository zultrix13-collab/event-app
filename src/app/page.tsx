import Link from 'next/link';

const features = [
  { icon: '📅', title: 'Хөтөлбөр', desc: 'Интерактив календарь, суудал захиалга, хувийн agenda' },
  { icon: '🗺️', title: 'Газрын зураг', desc: 'Дотоод болон гадаад навигаци, offline дэмжлэг' },
  { icon: '🤖', title: 'AI Туслах', desc: 'Монгол/Англи хэлээр хариулах RAG chatbot' },
  { icon: '💳', title: 'Төлбөр', desc: 'QPay, SocialPay, дижитал wallet' },
  { icon: '🔔', title: 'Мэдэгдэл', desc: 'Push, SMS, яаралтай broadcast' },
  { icon: '🪪', title: 'Дижитал үнэмлэх', desc: 'QR + NFC, offline баталгаажуулалт' },
];

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, var(--color-accent-dark) 0%, #166534 40%, #14532d 100%)',
        color: '#ffffff',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-5) var(--space-8)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(20, 83, 45, 0.85)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.4)',
            }}
          >
            🎪
          </div>
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', letterSpacing: '-0.02em' }}>
            Event Digital Platform
          </span>
        </div>
        <Link
          href="/login"
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            fontWeight: 'var(--font-weight-semibold)',
            fontSize: 'var(--text-sm)',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.25)',
            transition: 'background 0.15s',
          }}
        >
          Нэвтрэх →
        </Link>
      </header>

      {/* Hero */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 'var(--space-12) var(--space-6) var(--space-10)',
          gap: 'var(--space-6)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-bold)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#86efac',
            background: 'rgba(134, 239, 172, 0.12)',
            padding: '0.35rem 0.875rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(134, 239, 172, 0.25)',
          }}
        >
          Official Digital Platform
        </span>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900,
            lineHeight: 1.05,
            margin: 0,
            letterSpacing: '-0.03em',
            maxWidth: '16ch',
          }}
        >
          Арга хэмжааны{' '}
          <span style={{ color: '#86efac' }}>дижитал</span>{' '}
          туршлага
        </h1>

        <p
          style={{
            fontSize: 'var(--text-lg)',
            color: 'rgba(255,255,255,0.75)',
            maxWidth: '42rem',
            lineHeight: 'var(--line-height-relaxed)',
            margin: 0,
          }}
        >
          Хөтөлбөр, бүртгэл, үйлчилгээ, газрын зураг — бүгд нэг дор.
          Оролцогч, зохион байгуулагч, VIP зочдод зориулсан нэгдсэн платформ.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 'var(--space-2)',
          }}
        >
          <Link
            href="/login"
            style={{
              padding: '1rem 2.5rem',
              borderRadius: 'var(--radius-lg)',
              background: '#16a34a',
              color: '#fff',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--text-lg)',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(22, 163, 74, 0.45)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            Нэвтрэх
          </Link>
          <Link
            href="/apply-vip"
            style={{
              padding: '1rem 2rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--text-lg)',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
          >
            VIP бүртгэл
          </Link>
        </div>

        {/* Trust indicators */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            justifyContent: 'center',
            marginTop: 'var(--space-2)',
          }}
        >
          {['✓ Хурдан бүртгэл', '✓ Offline дэмжлэг', '✓ QR нэвтрэлт'].map((t) => (
            <span
              key={t}
              style={{
                fontSize: 'var(--text-sm)',
                color: 'rgba(255,255,255,0.6)',
                padding: '0.375rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
          gap: 'var(--space-5)',
          padding: '0 var(--space-8) var(--space-10)',
          maxWidth: '72rem',
          margin: '0 auto',
        }}
      >
        {features.map((f) => (
          <div
            key={f.title}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>{f.icon}</div>
            <h3 style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-lg)', margin: '0 0 var(--space-2)' }}>
              {f.title}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-sm)', margin: 0, lineHeight: 'var(--line-height-relaxed)' }}>
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* App download section */}
      <section
        style={{
          textAlign: 'center',
          padding: 'var(--space-10) var(--space-8)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.15)',
          maxWidth: '72rem',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 'var(--font-weight-bold)',
            margin: '0 0 var(--space-2)',
            letterSpacing: '-0.02em',
          }}
        >
          Аппликейшн татах
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-6)' }}>
          Удахгүй гарна — iOS болон Android дэмжлэгтэй
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: '0.875rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'not-allowed',
              opacity: 0.7,
            }}
          >
            <span style={{ fontSize: '1.75rem' }}>🍎</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.6)' }}>Татах</div>
              <div style={{ fontWeight: 'var(--font-weight-bold)' }}>App Store</div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: '0.875rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'not-allowed',
              opacity: 0.7,
            }}
          >
            <span style={{ fontSize: '1.75rem' }}>🤖</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.6)' }}>Татах</div>
              <div style={{ fontWeight: 'var(--font-weight-bold)' }}>Google Play</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: 'var(--space-6) var(--space-8)',
          color: 'rgba(255,255,255,0.35)',
          fontSize: 'var(--text-sm)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        © 2026 Event Digital Platform. All rights reserved.
      </footer>
    </main>
  );
}
