function toIcsTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function generateAppointmentIcs(params: {
  uid: string;
  startsAt: string;
  endsAt: string;
  summary: string;
  description: string;
  location: string;
}): string {
  const now = toIcsTimestamp(new Date().toISOString());
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Top Glass Window Tint//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${params.uid}@topglasswindowtint.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcsTimestamp(params.startsAt)}`,
    `DTEND:${toIcsTimestamp(params.endsAt)}`,
    `SUMMARY:${escapeIcsText(params.summary)}`,
    `DESCRIPTION:${escapeIcsText(params.description)}`,
    `LOCATION:${escapeIcsText(params.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
