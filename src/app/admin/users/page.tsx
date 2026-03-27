import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { approveUser } from '@/app/actions/auth';

export const dynamic = 'force-dynamic';

const ROLE_COLORS: Record<string, string> = {
  super_admin: '#7c3aed',
  specialist: '#0284c7',
  vip: '#d97706',
  participant: '#16a34a',
};

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  is_approved: boolean | null;
  is_active: boolean | null;
  created_at: string;
};

type VipApp = {
  id: string;
  full_name: string;
  email: string;
  organization: string | null;
  position: string | null;
  status: string;
  created_at: string;
};

async function ApproveButton({ userId, approve }: { userId: string; approve: boolean }) {
  async function action() {
    'use server';
    await approveUser(userId, approve);
  }
  return (
    <form action={action} style={{ display: 'inline' }}>
      <button
        type="submit"
        style={{
          padding: '0.25rem 0.625rem',
          borderRadius: 6,
          border: '1px solid',
          borderColor: approve ? '#bbf7d0' : '#fecaca',
          background: approve ? '#f0fdf4' : '#fef2f2',
          color: approve ? '#166534' : '#b91c1c',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: 500,
          marginRight: '0.375rem',
        }}
      >
        {approve ? '✓ Батлах' : '✕ Татгалзах'}
      </button>
    </form>
  );
}

export default async function AdminUsersPage() {
  const supabase = await getSupabaseServerClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_approved, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(200) as { data: Profile[] | null };

  const { data: vipApps } = await supabase
    .from('vip_applications')
    .select('id, full_name, email, organization, position, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false }) as { data: VipApp[] | null };

  const list = profiles ?? [];
  const pendingVip = vipApps ?? [];

  return (
    <section className="ui-admin-stack" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'none' }}>
          ← Admin
        </Link>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginTop: '0.5rem', marginBottom: 0 }}>
          Хэрэглэгч удирдлага
        </h1>
      </div>

      {/* Pending VIP Applications */}
      {pendingVip.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fed7aa', borderRadius: 10, padding: '1.25rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#9a3412', margin: '0 0 1rem' }}>
            ⭐ VIP хүлээгдэж буй ({pendingVip.length})
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #fed7aa' }}>
                  {['Нэр', 'И-мэйл', 'Байгууллага', 'Тушаал', 'Огноо', 'Үйлдэл'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#9a3412', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingVip.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #fed7aa' }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{app.full_name}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{app.email}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{app.organization ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{app.position ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{new Date(app.created_at).toLocaleDateString('mn-MN')}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>— Профайл хуудсаас батална</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Users Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Бүх хэрэглэгчид ({list.length})</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Нэр / И-мэйл', 'Дүр', 'Статус', 'Огноо', 'Үйлдэл'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Link href={`/admin/users/${p.id}`} style={{ fontWeight: 500, color: '#1e293b', textDecoration: 'none' }}>
                      {p.full_name ?? '—'}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>{p.email}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.625rem',
                      borderRadius: 20,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: `${ROLE_COLORS[p.role ?? 'participant']}18`,
                      color: ROLE_COLORS[p.role ?? 'participant'] ?? '#16a34a',
                    }}>
                      {p.role ?? 'participant'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {p.is_approved ? (
                      <span style={{ color: '#16a34a', fontWeight: 500, fontSize: '0.75rem' }}>✓ Батлагдсан</span>
                    ) : (
                      <span style={{ color: '#d97706', fontWeight: 500, fontSize: '0.75rem' }}>⏳ Хүлээгдэж буй</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.75rem' }}>
                    {new Date(p.created_at).toLocaleDateString('mn-MN')}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {!p.is_approved && (
                      <>
                        <ApproveButton userId={p.id} approve={true} />
                        <ApproveButton userId={p.id} approve={false} />
                      </>
                    )}
                    <Link href={`/admin/users/${p.id}`} style={{ fontSize: '0.75rem', color: '#6366f1', textDecoration: 'none' }}>
                      Дэлгэрэнгүй →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
