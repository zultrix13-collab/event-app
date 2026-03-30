import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { approveUser, updateUserRole, updateUserStatus } from '@/app/actions/auth';
import { generateDigitalIdPayload } from '@/modules/auth/digital-id';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const ROLES = ['participant', 'vip', 'specialist', 'super_admin'] as const;

const ROLE_COLORS: Record<string, string> = {
  super_admin: '#7c3aed',
  specialist: '#0284c7',
  vip: '#d97706',
  participant: '#16a34a',
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) notFound();

  const { data: digitalId } = await supabase
    .from('digital_ids')
    .select('*')
    .eq('user_id', id)
    .single();

  const { data: vipApp } = await supabase
    .from('vip_applications')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Server actions
  async function handleApprove(formData: FormData) {
    'use server';
    const role = formData.get('role') as string;
    await approveUser(id, true, role || undefined);
  }

  async function handleReject() {
    'use server';
    await approveUser(id, false);
  }

  async function handleRoleChange(formData: FormData) {
    'use server';
    const role = formData.get('role') as string;
    await updateUserRole(id, role);
  }

  async function handleToggleApproved(formData: FormData) {
    'use server';
    const newValue = formData.get('is_approved') === 'true';
    await updateUserStatus(id, { is_approved: newValue });
  }

  async function handleToggleActive(formData: FormData) {
    'use server';
    const newValue = formData.get('is_active') === 'true';
    await updateUserStatus(id, { is_active: newValue });
  }

  async function handleGenerateDigitalId() {
    'use server';
    const supabase2 = await getSupabaseServerClient();
    const profileRole = (profile as Record<string, unknown>).role as string | null;
    const { payload, signature, expiresAt } = generateDigitalIdPayload(id, profileRole ?? 'vip');
    await supabase2.from('digital_ids').upsert({
      user_id: id,
      qr_payload: payload,
      hmac_signature: signature,
      expires_at: expiresAt.toISOString(),
    });
  }

  const fields = [
    { label: 'ID', value: profile.id },
    { label: 'И-мэйл', value: profile.email },
    { label: 'Бүтэн нэр', value: profile.full_name ?? '—' },
    { label: 'Утас', value: (profile as Record<string, unknown>).phone as string ?? '—' },
    { label: 'Улс', value: (profile as Record<string, unknown>).country as string ?? '—' },
    { label: 'Байгууллага', value: (profile as Record<string, unknown>).organization as string ?? '—' },
    { label: 'Дүр', value: profile.role ?? 'participant' },
    { label: 'Батлагдсан', value: (profile as Record<string, unknown>).is_approved ? '✓ Тийм' : '✗ Үгүй' },
    { label: 'Идэвхтэй', value: (profile as Record<string, unknown>).is_active ? '✓ Тийм' : '✗ Үгүй' },
    { label: 'Бүртгэлийн огноо', value: new Date(profile.created_at).toLocaleString('mn-MN') },
    { label: 'Сүүлчийн нэвтрэлт', value: (profile as Record<string, unknown>).last_login_at ? new Date((profile as Record<string, unknown>).last_login_at as string).toLocaleString('mn-MN') : '—' },
  ];

  const role = (profile.role ?? 'participant') as string;
  const isApproved = !!(profile as Record<string, unknown>).is_approved;
  const isActive = !!(profile as Record<string, unknown>).is_active;

  return (
    <section style={{ padding: '2rem', maxWidth: 720 }}>
      <Link href="/admin/users" style={{ fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'none' }}>
        ← Хэрэглэгчид
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${ROLE_COLORS[role] ?? '#94a3b8'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
          {role === 'vip' ? '⭐' : role === 'super_admin' ? '🔐' : role === 'specialist' ? '🔧' : '👤'}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{profile.full_name ?? profile.email}</h1>
          <span style={{
            display: 'inline-block', marginTop: '0.25rem',
            padding: '0.2rem 0.625rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
            background: `${ROLE_COLORS[role] ?? '#94a3b8'}18`, color: ROLE_COLORS[role] ?? '#94a3b8',
          }}>
            {role}
          </span>
        </div>
      </div>

      {/* Profile Fields */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>
          Профайл мэдээлэл
        </div>
        <dl style={{ margin: 0 }}>
          {fields.map((f, i) => (
            <div key={f.label} style={{ display: 'flex', padding: '0.625rem 1.25rem', borderBottom: i < fields.length - 1 ? '1px solid #f1f5f9' : undefined, gap: '1rem' }}>
              <dt style={{ width: 160, flexShrink: 0, color: '#64748b', fontSize: '0.875rem' }}>{f.label}</dt>
              <dd style={{ margin: 0, fontSize: '0.875rem', color: '#1e293b', wordBreak: 'break-all' }}>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Role & Status Management */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 1rem' }}>Дүр болон статус өөрчлөх</h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Role change */}
          <form action={handleRoleChange} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Дүр:</label>
            <select name="role" defaultValue={role} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem' }}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit" style={{ padding: '0.5rem 1rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              Хадгалах
            </button>
          </form>

          {/* is_approved toggle */}
          <form action={handleToggleApproved} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="hidden" name="is_approved" value={isApproved ? 'false' : 'true'} />
            <button type="submit" style={{
              padding: '0.5rem 1rem',
              background: isApproved ? '#fef2f2' : '#f0fdf4',
              color: isApproved ? '#b91c1c' : '#166534',
              border: `1px solid ${isApproved ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem'
            }}>
              {isApproved ? '✗ Батлалт цуцлах' : '✓ Батлах'}
            </button>
          </form>

          {/* is_active toggle (ban/unban) */}
          <form action={handleToggleActive} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="hidden" name="is_active" value={isActive ? 'false' : 'true'} />
            <button type="submit" style={{
              padding: '0.5rem 1rem',
              background: isActive ? '#fff7ed' : '#f0fdf4',
              color: isActive ? '#c2410c' : '#166534',
              border: `1px solid ${isActive ? '#fed7aa' : '#bbf7d0'}`,
              borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem'
            }}>
              {isActive ? '🚫 Хаах (Ban)' : '✓ Идэвхжүүлэх (Unban)'}
            </button>
          </form>
        </div>
      </div>

      {/* Legacy approve/reject Actions */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 1rem' }}>Батлах / Татгалзах</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-start' }}>
          {/* Approve with role */}
          <form action={handleApprove} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select name="role" defaultValue={role} style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem' }}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit" style={{ padding: '0.5rem 1rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              ✓ Батлах
            </button>
          </form>

          {/* Reject */}
          <form action={handleReject}>
            <button type="submit" style={{ padding: '0.5rem 1rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
              ✕ Татгалзах
            </button>
          </form>

          {/* Generate Digital ID */}
          {(role === 'vip' || role === 'super_admin') && (
            <form action={handleGenerateDigitalId}>
              <button type="submit" style={{ padding: '0.5rem 1rem', background: '#fffbeb', color: '#d97706', border: '1px solid #fed7aa', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                🪪 Digital ID үүсгэх
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Digital ID */}
      {digitalId && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.875rem' }}>🪪 Digital ID</h2>
          <dl style={{ margin: 0, fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ width: 140, color: '#64748b' }}>Дуусах хугацаа</dt>
              <dd style={{ margin: 0 }}>{new Date((digitalId as Record<string, unknown>).expires_at as string).toLocaleString('mn-MN')}</dd>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
              <dt style={{ width: 140, color: '#64748b' }}>Хүчингүй болсон</dt>
              <dd style={{ margin: 0 }}>{(digitalId as Record<string, unknown>).is_revoked ? '✗ Тийм' : '✓ Үгүй'}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* VIP Application */}
      {vipApp && (
        <div style={{ background: '#fffbeb', border: '1px solid #fed7aa', borderRadius: 10, padding: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#9a3412', margin: '0 0 0.875rem' }}>VIP Хүсэлт</h2>
          <dl style={{ margin: 0, fontSize: '0.875rem' }}>
            {[
              { label: 'Байгууллага', value: (vipApp as Record<string, unknown>).organization as string ?? '—' },
              { label: 'Тушаал', value: (vipApp as Record<string, unknown>).position as string ?? '—' },
              { label: 'Шалтгаан', value: (vipApp as Record<string, unknown>).reason as string ?? '—' },
              { label: 'Статус', value: (vipApp as Record<string, unknown>).status as string },
            ].map((f) => (
              <div key={f.label} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                <dt style={{ width: 140, color: '#9a3412' }}>{f.label}</dt>
                <dd style={{ margin: 0, color: '#1e293b' }}>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
