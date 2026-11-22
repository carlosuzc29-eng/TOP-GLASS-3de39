import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { sendBookingConfirmationEmail } from '@/lib/email/resend';
import { localStore } from '@/lib/local-store';
import { getMessagingProvider } from '@/lib/messaging/provider';
import { formatCents } from '@/lib/pricing';
import { createServiceRoleClient, getPricingCatalog } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const manageToken = session.metadata?.manageToken;
    const quoteId = session.metadata?.quoteId;
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const catalog = await getPricingCatalog();
    const supabase = createServiceRoleClient();

    if (supabase && manageToken) {
      const { data: appt } = await supabase
        .from('appointments')
        .update({
          status: 'confirmed',
          stripe_payment_intent_id: paymentIntentId ?? null,
        })
        .eq('manage_token', manageToken)
        .select('*, customers(*), quotes(*)')
        .single();

      if (quoteId) {
        await supabase.from('quotes').update({ status: 'booked' }).eq('id', quoteId);
      }

      if (appt?.customers?.email) {
        const location = catalog.locations.find((l) => l.id === appt.location_id);
        const vehicle = appt.quotes?.vehicle;
        const vehicleLabel = vehicle
          ? [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')
          : 'Your vehicle';
        const manageUrl = `${appUrl}/my-appointment/${manageToken}`;

        await sendBookingConfirmationEmail({
          to: appt.customers.email,
          customerName: appt.customers.name,
          vehicleLabel,
          locationName: location?.name ?? 'Top Glass Studio',
          locationAddress: location?.address ?? '',
          startsAtFormatted: new Date(appt.starts_at).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
          totalFormatted: formatCents(appt.quotes?.total_cents ?? 0),
          depositFormatted: formatCents(appt.quotes?.deposit_cents ?? 0),
          balanceFormatted: formatCents(
            Math.max(0, (appt.quotes?.total_cents ?? 0) - (appt.quotes?.deposit_cents ?? 0)),
          ),
          manageUrl,
        });

        if (appt.customers.phone) {
          await getMessagingProvider().send({
            to: appt.customers.phone,
            body: `Top Glass Window Tint: Confirmed for ${vehicleLabel}. Manage your appointment: ${manageUrl}`,
          });
        }
      }
    } else if (manageToken) {
      const appt = localStore.getAppointmentByToken(manageToken);
      if (appt) {
        appt.status = 'confirmed';
        appt.stripePaymentIntentId = paymentIntentId;
        localStore.saveAppointment(appt);
      }
    }
  }

  return NextResponse.json({ received: true });
}
