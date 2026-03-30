import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = getSupabaseAdminClient();
  const body = await req.json();

  const { error } = await admin
    .from('venues')
    .update({
      name: body.name,
      name_en: body.name_en ?? null,
      description: body.description ?? null,
      capacity: body.capacity ?? 0,
      location: body.location ?? null,
      floor: body.floor ?? null,
      is_active: body.is_active ?? true,
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = getSupabaseAdminClient();
  const { error } = await admin.from('venues').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
