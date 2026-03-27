import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: pois, error } = await supabase
    .from('map_pois')
    .select('*')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pois });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from('map_pois')
    .insert({
      name: body.name,
      name_en: body.name_en || null,
      category: body.category,
      latitude: body.latitude,
      longitude: body.longitude,
      address: body.address || null,
      description: body.description || null,
      description_en: body.description_en || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ poi: data }, { status: 201 });
}
