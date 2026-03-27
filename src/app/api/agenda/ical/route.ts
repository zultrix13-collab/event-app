import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateIcal } from '@/lib/ical';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch agenda session IDs first, then sessions separately to avoid join type issues
  const { data: agendaItems } = await supabase
    .from('user_agenda')
    .select('session_id')
    .eq('user_id', user.id);

  const sessionIds = (agendaItems ?? []).map((a) => a.session_id);

  if (sessionIds.length === 0) {
    return new NextResponse(generateIcal([]), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="my-agenda.ics"',
      },
    });
  }

  const { data: sessionsData } = await supabase
    .from('event_sessions')
    .select('id, title, description, starts_at, ends_at, venue_id')
    .in('id', sessionIds);

  const venueIds = [...new Set((sessionsData ?? []).map((s) => s.venue_id).filter(Boolean) as string[])];

  const { data: venuesData } = await supabase
    .from('venues')
    .select('id, name')
    .in('id', venueIds);

  const venueMap = Object.fromEntries((venuesData ?? []).map((v) => [v.id, v]));

  const sessions = (sessionsData ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    starts_at: s.starts_at,
    ends_at: s.ends_at,
    venue: s.venue_id ? (venueMap[s.venue_id] ?? null) : null,
  }));

  const ical = generateIcal(sessions);

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="my-agenda.ics"',
    },
  });
}
