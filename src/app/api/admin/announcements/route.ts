import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = getSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: announcements, error } = await (admin as any)
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ announcements: announcements ?? [] });
}

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdminClient();
  const body = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('announcements')
    .insert({
      title: body.title,
      title_en: body.title_en ?? null,
      body: body.body,
      body_en: body.body_en ?? null,
      type: body.type ?? 'info',
      target_roles: body.target_roles ?? null,
      is_published: body.is_published ?? false,
      published_at: body.is_published ? new Date().toISOString() : null,
      expires_at: body.expires_at ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ announcement: data }, { status: 201 });
}
