import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = getSupabaseAdminClient();
  const { data: speakers, error } = await admin
    .from('speakers')
    .select('*')
    .order('full_name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ speakers });
}

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdminClient();
  const body = await req.json();

  const { data, error } = await admin
    .from('speakers')
    .insert({
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
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ speaker: data }, { status: 201 });
}
