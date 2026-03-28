'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// ─── Today's Sessions ──────────────────────────────────────────────────────

export async function getTodaySessions() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('event_sessions')
    .select(`
      id,
      title,
      starts_at,
      ends_at,
      capacity,
      registered_count,
      is_published,
      venue_id,
      venues ( name )
    `)
    .eq('is_published', true)
    .gte('starts_at', todayStart.toISOString())
    .lte('starts_at', todayEnd.toISOString())
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('[specialist/actions] getTodaySessions error:', error.message);
    return [];
  }

  return data ?? [];
}

// ─── Recent Check-ins ──────────────────────────────────────────────────────

export async function getRecentCheckins() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('attendance')
    .select(`
      id,
      checked_in_at,
      check_in_method,
      user_id,
      session_id,
      profiles ( full_name, email ),
      event_sessions ( title )
    `)
    .order('checked_in_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[specialist/actions] getRecentCheckins error:', error.message);
    return [];
  }

  return data ?? [];
}

// ─── Pending Complaints ────────────────────────────────────────────────────

export async function getPendingComplaints() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('complaints')
    .select('id, subject, category, priority, status, created_at')
    .in('status', ['open', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[specialist/actions] getPendingComplaints error:', error.message);
    return [];
  }

  return data ?? [];
}

// ─── Open Lost & Found Count ───────────────────────────────────────────────

export async function getOpenLostFoundCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('lost_found_items')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'open');

  if (error) {
    console.error('[specialist/actions] getOpenLostFoundCount error:', error.message);
    return 0;
  }

  return count ?? 0;
}

// ─── Today Stats ──────────────────────────────────────────────────────────

export async function getTodayCheckinCount(): Promise<number> {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('attendance')
    .select('id', { count: 'exact', head: true })
    .gte('checked_in_at', todayStart.toISOString());

  if (error) {
    console.error('[specialist/actions] getTodayCheckinCount error:', error.message);
    return 0;
  }

  return count ?? 0;
}

// ─── Session Attendees ─────────────────────────────────────────────────────

export async function getSessionAttendees(sessionId: string) {
  const supabase = await createClient();

  // Get all confirmed registrations
  const { data: registrations, error: regError } = await supabase
    .from('seat_registrations')
    .select(`
      id,
      user_id,
      status,
      registered_at,
      profiles ( full_name, email, organization )
    `)
    .eq('session_id', sessionId)
    .eq('status', 'confirmed')
    .order('registered_at', { ascending: true });

  if (regError) {
    console.error('[specialist/actions] getSessionAttendees registrations error:', regError.message);
    return [];
  }

  // Get attendance records for this session
  const { data: attendanceRows, error: attError } = await supabase
    .from('attendance')
    .select('user_id, checked_in_at, check_in_method')
    .eq('session_id', sessionId);

  if (attError) {
    console.error('[specialist/actions] getSessionAttendees attendance error:', attError.message);
  }

  const checkedInMap = new Map(
    (attendanceRows ?? []).map((a) => [a.user_id, a])
  );

  return (registrations ?? []).map((reg) => ({
    ...reg,
    attendance: checkedInMap.get(reg.user_id) ?? null,
  }));
}

// ─── Manual Check-in ──────────────────────────────────────────────────────

export async function manualCheckin(
  sessionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Check for existing attendance
  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'Энэ хэрэглэгч аль хэдийн бүртгэгдсэн байна' };
  }

  const { error } = await supabase.from('attendance').insert({
    session_id: sessionId,
    user_id: userId,
    check_in_method: 'manual',
  });

  if (error) {
    console.error('[specialist/actions] manualCheckin error:', error.message);
    return { success: false, error: error.message };
  }

  revalidatePath(`/specialist/checkin/${sessionId}`);
  revalidatePath('/specialist/dashboard');

  return { success: true };
}
