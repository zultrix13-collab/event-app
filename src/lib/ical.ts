export function generateIcal(sessions: Array<{
  id: string;
  title: string;
  description?: string | null;
  starts_at: string;
  ends_at: string;
  venue?: { name: string } | null;
}>): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Event Digital Platform//MN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const s of sessions) {
    const dtStart = new Date(s.starts_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtEnd = new Date(s.ends_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    lines.push(
      'BEGIN:VEVENT',
      `UID:${s.id}@event-platform`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${s.title}`,
      s.description ? `DESCRIPTION:${s.description.replace(/\n/g, '\\n')}` : '',
      s.venue ? `LOCATION:${s.venue.name}` : '',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.filter(Boolean).join('\r\n');
}
