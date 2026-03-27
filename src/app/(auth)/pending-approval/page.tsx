export default function PendingApprovalPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-app, #f8fafc)',
        padding: '1rem',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏳</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
          Таны бүртгэл хянагдаж байна
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.875rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Таны хүсэлтийг хянан шийдвэрлэж байна.
          <br />
          Баталгаажсаны дараа и-мэйл ирнэ.
        </p>

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem 1.5rem',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 10,
            color: '#1e40af',
            fontSize: '0.875rem',
          }}
        >
          📬 Имэйлээ шалгаад байгаарай — баталгаажсан тухай мэдэгдэл ирнэ.
        </div>

        <a
          href="/login"
          style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            fontSize: '0.875rem',
            color: '#64748b',
            textDecoration: 'none',
          }}
        >
          ← Нэвтрэх хуудас руу буцах
        </a>
      </div>
    </main>
  );
}
