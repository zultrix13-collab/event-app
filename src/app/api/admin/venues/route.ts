import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = getSupabaseAdminClient();
  const { data: venues, error } = await admin
    .from('venues')
    .select('*')
    .order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ venues });
}

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdminClient();
  const body = await req.json();

  const { data, error } = await admin
    .from('venues')
    .insert({
      name: body.name,
      name_en: body.name_en ?? null,
      description: body.description ?? null,
      capacity: body.capacity ?? 0,
      location: body.location ?? null,
      floor: body.floor ?? null,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ venue: data }, { status: 201 });
}
