import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

const HMAC_SECRET = process.env.DIGITAL_ID_HMAC_SECRET ?? process.env.DIGITAL_ID_SECRET ?? 'change-me-in-production';

function buildQrPayload(uid: string, role: string, expiresAt: Date): string {
  const payload = {
    uid,
    exp: Math.floor(expiresAt.getTime() / 1000),
    role,
  };
  return JSON.stringify(payload);
}

function signPayload(payload: string): string {
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(payload)
    .digest('hex');
}

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: userId } = await params;

  const supabase = await createClient();

  // Auth check — must be super_admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch target user's role
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!targetProfile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const role = targetProfile.role ?? 'participant';
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

  const qrPayload = buildQrPayload(userId, role, expiresAt);
  const hmacSignature = signPayload(qrPayload);

  const { error } = await supabase.from('digital_ids').upsert(
    {
      user_id: userId,
      qr_payload: qrPayload,
      hmac_signature: hmacSignature,
      expires_at: expiresAt.toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    qr_payload: qrPayload,
    hmac_signature: hmacSignature,
    expires_at: expiresAt.toISOString(),
  });
}
