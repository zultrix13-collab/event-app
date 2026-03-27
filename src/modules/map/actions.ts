'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { MapPOI, FloorPlan, IndoorZone } from './types';

export async function getMapPOIs(category?: string): Promise<{ data: MapPOI[] | null; error: string | null }> {
  const supabase = await createClient();
  let query = supabase
    .from('map_pois')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (category && category !== 'all') {
    const validCategories = ['venue', 'hotel', 'restaurant', 'transport', 'attraction', 'medical', 'other'] as const;
    type Category = (typeof validCategories)[number];
    if (validCategories.includes(category as Category)) {
      query = query.eq('category', category as Category);
    }
  }

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data: data as MapPOI[], error: null };
}

export async function getFloorPlans(): Promise<{ data: FloorPlan[] | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('floor_plans')
    .select('id, name, name_en, floor_number, svg_url, svg_content')
    .eq('is_active', true)
    .order('floor_number');

  if (error) return { data: null, error: error.message };
  return { data: data as FloorPlan[], error: null };
}

export async function getFloorPlanWithZones(floorPlanId: string): Promise<{
  floorPlan: FloorPlan | null;
  zones: IndoorZone[];
  error?: string;
}> {
  const supabase = await createClient();

  const [fpResult, zonesResult] = await Promise.all([
    supabase
      .from('floor_plans')
      .select('id, name, name_en, floor_number, svg_url, svg_content')
      .eq('id', floorPlanId)
      .single(),
    supabase
      .from('indoor_zones')
      .select('*')
      .eq('floor_plan_id', floorPlanId)
      .eq('is_active', true)
      .order('name'),
  ]);

  if (fpResult.error) return { floorPlan: null, zones: [], error: fpResult.error.message };

  return {
    floorPlan: fpResult.data as FloorPlan,
    zones: (zonesResult.data ?? []) as IndoorZone[],
  };
}

export async function checkInAtZone(qrCode: string): Promise<{
  success: boolean;
  zone?: { id: string; name: string; name_en: string | null; zone_type: string };
  error?: string;
}> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: zone, error: zoneError } = await supabase
    .from('indoor_zones')
    .select('id, name, name_en, zone_type')
    .eq('qr_code', qrCode)
    .eq('is_active', true)
    .single();

  if (zoneError || !zone) return { success: false, error: 'QR код олдсонгүй' };

  if (user) {
    await supabase.from('user_locations').insert({
      user_id: user.id,
      zone_id: zone.id,
    });
    revalidatePath('/app/map');
  }

  return {
    success: true,
    zone: {
      id: zone.id,
      name: zone.name,
      name_en: zone.name_en,
      zone_type: zone.zone_type,
    },
  };
}

export async function getUserCurrentLocation(userId: string): Promise<{
  zone: IndoorZone | null;
  error?: string;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_locations')
    .select('zone_id, indoor_zones(*)')
    .eq('user_id', userId)
    .order('located_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return { zone: null };

  return { zone: (data as unknown as { indoor_zones: IndoorZone }).indoor_zones ?? null };
}

export async function recordQRScan(checkpointId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Manual increment: fetch then update
  const { data: cp } = await supabase
    .from('qr_checkpoints')
    .select('scanned_count')
    .eq('id', checkpointId)
    .single();

  if (cp) {
    await supabase
      .from('qr_checkpoints')
      .update({ scanned_count: (cp.scanned_count ?? 0) + 1 })
      .eq('id', checkpointId);
  }

  return { success: true };
}
