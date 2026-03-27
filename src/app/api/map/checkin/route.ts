import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { qrCode } = await req.json();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Find zone by QR code
  const { data: zone } = await supabase
    .from('indoor_zones')
    .select('*, floor_plan:floor_plans(name)')
    .eq('qr_code', qrCode)
    .eq('is_active', true)
    .single();

  if (!zone) {
    return NextResponse.json({ error: 'QR код олдсонгүй' }, { status: 404 });
  }

  // Record location if user is logged in
  if (user) {
    await supabase.from('user_locations').insert({
      user_id: user.id,
      zone_id: zone.id,
    });
  }

  return NextResponse.json({
    success: true,
    zone: {
      id: zone.id,
      name: zone.name,
      name_en: zone.name_en,
      zone_type: zone.zone_type,
    },
  });
}
