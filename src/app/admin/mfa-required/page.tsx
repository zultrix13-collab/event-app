import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function MfaRequiredPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-app, #f8fafc)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '28rem',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 0.75rem',
          }}
        >
          Admin хандалтад 2FA шаардлагатай
        </h1>
        <p
          style={{
            color: '#64748b',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            margin: '0 0 1.75rem',
          }}
        >
          Танай бүртгэлд хоёр хүчин зүйлийн баталгаажуулалт (2FA / TOTP) идэвхжүүлэгдээгүй байна.
          Admin хэсэгт нэвтрэхийн тулд эхлээд 2FA тохируулна уу.
        </p>
        <Link
          href="/admin/settings"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#1d4ed8',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          2FA тохируулах → Settings
        </Link>
      </div>
    </main>
  );
}
