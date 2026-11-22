import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { localStore } from '@/lib/local-store';
import { createServiceRoleClient, getPricingCatalog } from '@/lib/supabase/server';

const rescheduleSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const catalog = await getPricingCatalog();
  const supabase = createServiceRoleClient();

  if (supabase) {
    const { data: appt } = await supabase
      .from('appointments')
      .select('*, customers(*), quotes(*)')
      .eq('manage_token', token)
      .maybeSingle();

    if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const location = catalog.locations.find((l) => l.id === appt.location_id);
    return NextResponse.json({ appointment: appt, location });
  }

  const localAppt = localStore.getAppointmentByToken(token);
  if (!localAppt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const localQuote = localStore.getQuoteByCode(localAppt.shortCode);
  const location = catalog.locations.find((l) => l.id === localAppt.locationId);

  return NextResponse.json({
    appointment: localAppt,
    quote: localQuote ?? null,
    location,
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const body = await request.json();
  const parsed = rescheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid date/time' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        starts_at: parsed.data.startsAt,
        ends_at: parsed.data.endsAt,
      })
      .eq('manage_token', token)
      .select()
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, appointment: data });
  }

  const appt = localStore.getAppointmentByToken(token);
  if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  appt.startsAt = parsed.data.startsAt;
  appt.endsAt = parsed.data.endsAt;
  localStore.saveAppointment(appt);

  return NextResponse.json({ ok: true, appointment: appt });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripe = stripeKey && !stripeKey.startsWith('sk_test_...') ? new Stripe(stripeKey) : null;

  const supabase = createServiceRoleClient();
  let startsAtIso: string | null = null;
  let paymentIntentId: string | null = null;

  if (supabase) {
    const { data: appt } = await supabase
      .from('appointments')
      .select('id, starts_at, stripe_payment_intent_id, status')
      .eq('manage_token', token)
      .maybeSingle();

    if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    startsAtIso = appt.starts_at;
    paymentIntentId = appt.stripe_payment_intent_id;

    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appt.id);
  } else {
    const appt = localStore.getAppointmentByToken(token);
    if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    startsAtIso = appt.startsAt;
    paymentIntentId = appt.stripePaymentIntentId ?? null;
    appt.status = 'cancelled';
    localStore.saveAppointment(appt);
  }

  const hoursUntil = startsAtIso ? (Date.parse(startsAtIso) - Date.now()) / 3_600_000 : 0;
  let refunded = false;

  if (hoursUntil > 24) {
    if (stripe && paymentIntentId) {
      await stripe.refunds.create({ payment_intent: paymentIntentId });
      refunded = true;
    } else {
      refunded = true; // Demo/local automatic refund eligible
    }
  }

  return NextResponse.json({ ok: true, refunded, hoursUntil: Math.round(hoursUntil) });
}
