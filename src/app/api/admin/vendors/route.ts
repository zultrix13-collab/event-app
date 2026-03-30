import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = getSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: vendors, error } = await (admin as any)
    .from('vendors')
    .select('*')
    .order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vendors: vendors ?? [] });
}

export async function POST(req: NextRequest) {
  const admin = getSupabaseAdminClient();
  const body = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('vendors')
    .insert({
      name: body.name,
      name_en: body.name_en ?? null,
      booth_number: body.booth_number ?? null,
      category: body.category ?? null,
      description: body.description ?? null,
      contact_email: body.contact_email ?? null,
      contact_phone: body.contact_phone ?? null,
      image_url: body.image_url ?? null,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vendor: data }, { status: 201 });
}
