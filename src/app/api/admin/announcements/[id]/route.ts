import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = getSupabaseAdminClient();
  const body = await req.json();

  const updateData: Record<string, unknown> = {
    title: body.title,
    title_en: body.title_en ?? null,
    body: body.body,
    body_en: body.body_en ?? null,
    type: body.type ?? 'info',
    target_roles: body.target_roles ?? null,
    is_published: body.is_published ?? false,
    expires_at: body.expires_at ?? null,
  };

  if (body.is_published && body.published_at !== undefined) {
    updateData.published_at = body.published_at;
  } else if (body.is_published) {
    updateData.published_at = new Date().toISOString();
  } else {
    updateData.published_at = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('announcements')
    .update(updateData)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = getSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('announcements').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
