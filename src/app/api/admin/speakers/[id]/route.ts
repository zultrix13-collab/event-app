import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = getSupabaseAdminClient();
  const body = await req.json();

  const { error } = await admin
    .from('speakers')
    .update({
      full_name: body.full_name,
      full_name_en: body.full_name_en ?? null,
      title: body.title ?? null,
      title_en: body.title_en ?? null,
      organization: body.organization ?? null,
      organization_en: body.organization_en ?? null,
      bio: body.bio ?? null,
      avatar_url: body.avatar_url ?? null,
      country: body.country ?? null,
      is_active: body.is_active ?? true,
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = getSupabaseAdminClient();
  const { error } = await admin.from('speakers').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
