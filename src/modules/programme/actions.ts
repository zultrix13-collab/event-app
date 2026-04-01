'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/** HTML datetime-local → timestamptz-safe ISO (UTC) */
function localDatetimeInputToIso(value: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// Register for session with race condition protection
export async function registerForSession(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Нэвтрэх шаардлагатай' };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('register_for_session', {
    p_session_id: sessionId,
    p_user_id: user.id,
  });

  if (error) return { success: false, error: 'Бүртгэл хийхэд алдаа гарлаа' };

  const result = data as { success: boolean; status?: string; error?: string };

  if (result.success && result.status === 'confirmed') {
    revalidatePath('/app/programme');
    revalidatePath(`/app/programme/${sessionId}`);
  }

  return result;
}

// Cancel registration
export async function cancelRegistration(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Нэвтрэх шаардлагатай' };

  const { error } = await supabase
    .from('seat_registrations')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('session_id', sessionId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: 'Цуцлахад алдаа гарлаа' };

  await supabase.rpc('decrement_session_count', { p_session_id: sessionId });

  const { data: waitlisted } = await supabase
    .from('seat_registrations')
    .select('id, user_id')
    .eq('session_id', sessionId)
    .eq('status', 'waitlisted')
    .order('registered_at', { ascending: true })
    .limit(1)
    .single();

  if (waitlisted) {
    await supabase
      .from('seat_registrations')
      .update({ status: 'confirmed' })
      .eq('id', waitlisted.id);
    await supabase.rpc('increment_session_count', { p_session_id: sessionId });
  }

  revalidatePath('/app/programme');
  return { success: true };
}

// Add to personal agenda
export async function addToAgenda(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Нэвтрэх шаардлагатай' };

  await supabase.from('user_agenda').upsert({ user_id: user.id, session_id: sessionId });
  revalidatePath('/app/programme/agenda');
  return { success: true };
}

// Remove from agenda
export async function removeFromAgenda(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Нэвтрэх шаардлагатай' };

  await supabase.from('user_agenda').delete()
    .eq('user_id', user.id)
    .eq('session_id', sessionId);
  revalidatePath('/app/programme/agenda');
  return { success: true };
}

// Check in via QR
export async function checkInToSession(sessionId: string, method: 'qr' | 'nfc' | 'manual' = 'qr') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Нэвтрэх шаардлагатай' };

  const { error } = await supabase.from('attendance').upsert({
    session_id: sessionId,
    user_id: user.id,
    check_in_method: method,
    checked_in_at: new Date().toISOString(),
  });

  if (error) return { success: false, error: 'Бүртгэхэд алдаа гарлаа' };
  return { success: true };
}

// Submit survey
export async function submitSurvey(sessionId: string, rating: number, feedback?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('session_surveys').insert({
    session_id: sessionId,
    user_id: user?.id ?? null,
    rating,
    feedback,
  });

  if (error) return { success: false, error: 'Илгээхэд алдаа гарлаа' };
  return { success: true };
}

// Get sessions for calendar view
export async function getSessions(date?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('event_sessions')
    .select(`
      *,
      venue:venues(id, name, name_en, capacity, location, floor),
      session_speakers(
        role,
        speaker:speakers(id, full_name, full_name_en, title, organization, avatar_url)
      )
    `)
    .eq('is_published', true)
    .order('starts_at', { ascending: true });

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query = query.gte('starts_at', start.toISOString()).lte('starts_at', end.toISOString());
  }

  const { data, error } = await query;
  return { data, error };
}

// Get user's agenda sessions
export async function getAgendaSessions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Нэвтрэх шаардлагатай' };

  const { data, error } = await supabase
    .from('user_agenda')
    .select(`
      added_at,
      session:event_sessions(
        id, title, title_en, description, starts_at, ends_at, session_type, zone,
        venue:venues(id, name, name_en, location)
      )
    `)
    .eq('user_id', user.id)
    .order('added_at', { ascending: true });

  return { data, error };
}

// Get user's registrations
export async function getUserRegistrations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Нэвтрэх шаардлагатай' };

  const { data, error } = await supabase
    .from('seat_registrations')
    .select('session_id, status')
    .eq('user_id', user.id)
    .neq('status', 'cancelled');

  return { data, error };
}

// Get user's attendance
export async function getUserAttendance() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Нэвтрэх шаардлагатай' };

  const { data, error } = await supabase
    .from('attendance')
    .select('session_id, checked_in_at')
    .eq('user_id', user.id);

  return { data, error };
}

// Send notification (admin only)
export async function sendNotification(params: {
  title: string;
  title_en?: string;
  body: string;
  body_en?: string;
  type?: string;
  targetRoles?: string[];
  isEmergency?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase.from('notifications').insert({
    title: params.title,
    title_en: params.title_en,
    body: params.body,
    body_en: params.body_en,
    notification_type: (params.type ?? 'general') as 'general' | 'programme' | 'emergency' | 'system',
    target_roles: params.targetRoles,
    sent_by: user.id,
    is_emergency: params.isEmergency ?? false,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/notifications');
  return { success: true };
}

// Admin: get all sessions
export async function getAllSessions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('event_sessions')
    .select(`
      *,
      venue:venues(id, name, name_en)
    `)
    .order('starts_at', { ascending: true });

  return { data, error };
}

// Admin: create session
export async function createSession(params: {
  title: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  session_type: string;
  venue_id?: string;
  starts_at: string;
  ends_at: string;
  capacity?: number;
  zone?: string;
  tags?: string[];
  is_published?: boolean;
  speaker_ids?: string[];
}) {
  const supabase = await createClient();

  const { speaker_ids, ...rest } = params;
  const sessionData = {
    ...rest,
    session_type: rest.session_type as 'general' | 'keynote' | 'workshop' | 'panel' | 'exhibition' | 'networking' | 'other',
    zone: rest.zone as 'green' | 'blue' | 'both' | undefined,
  };

  const { data: session, error } = await supabase
    .from('event_sessions')
    .insert(sessionData)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  if (speaker_ids?.length) {
    const { error: spError } = await supabase.from('session_speakers').insert(
      speaker_ids.map((id, idx) => ({
        session_id: session.id,
        speaker_id: id,
        sort_order: idx,
      }))
    );
    if (spError) {
      await supabase.from('event_sessions').delete().eq('id', session.id);
      return { success: false, error: spError.message };
    }
  }

  revalidatePath('/admin/programme');
  return { success: true, session };
}

/** Admin new programme form — redirects with ?error= on failure */
export async function createSessionFormAction(formData: FormData) {
  const speakerIds = formData
    .getAll('speaker_ids')
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0);

  const tagsRaw = formData.get('tags') as string | null;
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [];

  const startsRaw = formData.get('starts_at') as string | null;
  const endsRaw = formData.get('ends_at') as string | null;
  const starts_at = startsRaw ? localDatetimeInputToIso(startsRaw) : null;
  const ends_at = endsRaw ? localDatetimeInputToIso(endsRaw) : null;

  if (!starts_at || !ends_at) {
    redirect(
      `/admin/programme/new?error=${encodeURIComponent('Эхлэх болон дуусах цагийг зөв сонгоно уу.')}`
    );
  }

  const title = (formData.get('title') as string | null)?.trim() ?? '';
  if (!title) {
    redirect(`/admin/programme/new?error=${encodeURIComponent('Гарчиг оруулна уу.')}`);
  }

  const venueRaw = (formData.get('venue_id') as string | null)?.trim();
  const venue_id = venueRaw || undefined;

  const result = await createSession({
    title,
    title_en: ((formData.get('title_en') as string | null) || undefined)?.trim() || undefined,
    description: ((formData.get('description') as string | null) || undefined)?.trim() || undefined,
    description_en: ((formData.get('description_en') as string | null) || undefined)?.trim() || undefined,
    session_type: (formData.get('session_type') as string) || 'general',
    venue_id,
    starts_at,
    ends_at,
    capacity: parseInt(String(formData.get('capacity') ?? '0'), 10) || 0,
    zone: (formData.get('zone') as string) || 'green',
    tags,
    is_published: formData.get('is_published') === 'true',
    speaker_ids: speakerIds,
  });

  if (!result.success) {
    redirect(`/admin/programme/new?error=${encodeURIComponent(result.error ?? 'Хадгалахад алдаа гарлаа.')}`);
  }

  redirect('/admin/programme');
}

// Admin: update session
export async function updateSession(sessionId: string, params: {
  title?: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  session_type?: string;
  venue_id?: string;
  starts_at?: string;
  ends_at?: string;
  capacity?: number;
  zone?: string;
  tags?: string[];
  is_published?: boolean;
  speaker_ids?: string[];
}) {
  const supabase = await createClient();

  const { speaker_ids, ...rest } = params;
  const sessionData = {
    ...rest,
    session_type: rest.session_type as 'general' | 'keynote' | 'workshop' | 'panel' | 'exhibition' | 'networking' | 'other' | undefined,
    zone: rest.zone as 'green' | 'blue' | 'both' | undefined,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('event_sessions')
    .update(sessionData)
    .eq('id', sessionId);

  if (error) return { success: false, error: error.message };

  if (speaker_ids !== undefined) {
    const { error: delErr } = await supabase.from('session_speakers').delete().eq('session_id', sessionId);
    if (delErr) return { success: false, error: delErr.message };
    if (speaker_ids.length) {
      const { error: insErr } = await supabase.from('session_speakers').insert(
        speaker_ids.map((id, idx) => ({
          session_id: sessionId,
          speaker_id: id,
          sort_order: idx,
        }))
      );
      if (insErr) return { success: false, error: insErr.message };
    }
  }

  revalidatePath('/admin/programme');
  revalidatePath(`/app/programme/${sessionId}`);
  return { success: true };
}

// Admin: delete session
export async function deleteSession(sessionId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('event_sessions').delete().eq('id', sessionId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/programme');
  return { success: true };
}

// Admin: toggle publish
export async function togglePublishSession(sessionId: string, isPublished: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('event_sessions')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/programme');
  return { success: true };
}

// Admin: CRUD for speakers
export async function getAllSpeakers() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('speakers').select('*').order('full_name');
  return { data, error };
}

export async function createSpeaker(params: {
  full_name: string;
  full_name_en?: string;
  title?: string;
  title_en?: string;
  organization?: string;
  organization_en?: string;
  bio?: string;
  bio_en?: string;
  avatar_url?: string;
  country?: string;
  social_links?: Record<string, string>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('speakers').insert(params).select().single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/speakers');
  return { success: true, speaker: data };
}

export async function updateSpeaker(speakerId: string, params: Partial<{
  full_name: string;
  full_name_en: string;
  title: string;
  organization: string;
  bio: string;
  bio_en: string;
  avatar_url: string;
  country: string;
  is_active: boolean;
}>) {
  const supabase = await createClient();
  const { error } = await supabase.from('speakers').update(params).eq('id', speakerId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/speakers');
  return { success: true };
}

export async function deleteSpeaker(speakerId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('speakers').delete().eq('id', speakerId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/speakers');
  return { success: true };
}

// Admin: CRUD for venues
export async function getAllVenues() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('venues').select('*').order('name');
  return { data, error };
}

export async function createVenue(params: {
  name: string;
  name_en?: string;
  description?: string;
  capacity?: number;
  location?: string;
  floor?: number;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('venues').insert(params).select().single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/venues');
  return { success: true, venue: data };
}

export async function updateVenue(venueId: string, params: Partial<{
  name: string;
  name_en: string;
  description: string;
  capacity: number;
  location: string;
  floor: number;
  is_active: boolean;
}>) {
  const supabase = await createClient();
  const { error } = await supabase.from('venues').update(params).eq('id', venueId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/venues');
  return { success: true };
}

export async function deleteVenue(venueId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('venues').delete().eq('id', venueId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/venues');
  return { success: true };
}

// Get notifications
export async function getNotifications() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('sent_at', { ascending: false });
  return { data, error };
}
