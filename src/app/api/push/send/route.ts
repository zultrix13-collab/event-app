import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPushNotification, type PushAudience } from '@/lib/push';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'super_admin'])
    .single();

  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as {
    title?: string;
    body?: string;
    audience?: PushAudience;
    data?: Record<string, string>;
  };

  if (!body.title || !body.body) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  }

  const result = await sendPushNotification({
    title: body.title,
    body: body.body,
    audience: body.audience ?? 'all',
    data: body.data,
  });

  return NextResponse.json({ success: true, ...result });
}
