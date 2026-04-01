import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { token?: string; platform?: string };
  const { token, platform } = body;

  if (!token || !['ios', 'android', 'web'].includes(platform ?? '')) {
    return NextResponse.json({ error: 'Invalid token or platform' }, { status: 400 });
  }

  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { user_id: user.id, token: token as string, platform: platform as string, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,token' }
    );

  if (error) return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
  return NextResponse.json({ success: true });
}
