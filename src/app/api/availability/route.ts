import { NextResponse, type NextRequest } from 'next/server';
import { computeAvailability } from '@/lib/availability';
import { localStore } from '@/lib/local-store';
import { createServiceRoleClient, getPricingCatalog } from '@/lib/supabase/server';
import type { WaitType } from '@/types/domain';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const locationId = searchParams.get('locationId') ?? 'loc-princeton-tx';
  const durationMin = Math.max(30, Number(searchParams.get('durationMin') ?? 90));
  const waitType = (searchParams.get('waitType') === 'wait' ? 'wait' : 'drop_off') as WaitType;

  const catalog = await getPricingCatalog();
  const location = catalog.locations.find((l) => l.id === locationId || l.slug === locationId);
  if (!location) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  }

  const existingBookings: Array<{ startsAt: string; endsAt: string }> = [];

  const supabase = createServiceRoleClient();
  if (supabase) {
    const nowIso = new Date().toISOString();
    const [appts, blocks] = await Promise.all([
      supabase
        .from('appointments')
        .select('starts_at, ends_at')
        .eq('location_id', location.id)
        .in('status', ['confirmed', 'pending_payment'])
        .gte('ends_at', nowIso),
      supabase
        .from('blocked_slots')
        .select('starts_at, ends_at')
        .eq('location_id', location.id)
        .gte('ends_at', nowIso),
    ]);

    for (const a of appts.data ?? []) {
      existingBookings.push({ startsAt: a.starts_at, endsAt: a.ends_at });
    }
    for (const b of blocks.data ?? []) {
      existingBookings.push({ startsAt: b.starts_at, endsAt: b.ends_at });
    }
  } else {
    for (const a of localStore.listAppointmentsByLocation(location.id)) {
      existingBookings.push({ startsAt: a.startsAt, endsAt: a.endsAt });
    }
  }

  const days = computeAvailability({
    location,
    durationMin,
    waitType,
    existingBookings,
    daysCount: 30,
  });

  return NextResponse.json({ locationId: location.id, days });
}
