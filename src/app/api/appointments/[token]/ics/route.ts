import { NextResponse, type NextRequest } from 'next/server';
import { generateAppointmentIcs } from '@/lib/ics';
import { localStore } from '@/lib/local-store';
import { createServiceRoleClient, getPricingCatalog } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const catalog = await getPricingCatalog();
  const supabase = createServiceRoleClient();

  let startsAt: string | null = null;
  let endsAt: string | null = null;
  let locationId: string | null = null;
  let vehicleLabel = 'Window Tint Appointment';

  if (supabase) {
    const { data: appt } = await supabase
      .from('appointments')
      .select('starts_at, ends_at, location_id, quotes(vehicle)')
      .eq('manage_token', token)
      .maybeSingle();

    if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    startsAt = appt.starts_at;
    endsAt = appt.ends_at;
    locationId = appt.location_id;
    const v = (appt.quotes as unknown as { vehicle?: { year?: number; make?: string; model?: string } })?.vehicle;
    if (v) vehicleLabel = [v.year, v.make, v.model].filter(Boolean).join(' ');
  } else {
    const appt = localStore.getAppointmentByToken(token);
    if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    startsAt = appt.startsAt;
    endsAt = appt.endsAt;
    locationId = appt.locationId;
    const quote = localStore.getQuoteByCode(appt.shortCode);
    if (quote) {
      vehicleLabel = [quote.vehicle.year, quote.vehicle.make, quote.vehicle.model]
        .filter(Boolean)
        .join(' ');
    }
  }

  const location = catalog.locations.find((l) => l.id === locationId);
  const ics = generateAppointmentIcs({
    uid: token,
    startsAt: startsAt!,
    endsAt: endsAt!,
    summary: `Top Glass Window Tint — ${vehicleLabel}`,
    description: `Window tint appointment at Top Glass Window Tint (${location?.name ?? ''}).`,
    location: location?.address ?? 'Top Glass Window Tint',
  });

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="top-glass-appointment.ics"',
    },
  });
}
