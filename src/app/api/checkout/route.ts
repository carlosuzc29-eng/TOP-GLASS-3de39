import { NextResponse, type NextRequest } from 'next/server';
import Stripe from 'stripe';
import { sendBookingConfirmationEmail } from '@/lib/email/resend';
import { localStore } from '@/lib/local-store';
import { getMessagingProvider } from '@/lib/messaging/provider';
import { calculateQuote, formatCents } from '@/lib/pricing';
import { createServiceRoleClient, getPricingCatalog } from '@/lib/supabase/server';
import { generateShortCode } from '@/lib/utils';
import { checkoutRequestSchema } from '@/lib/validations/quote';

function getStripe(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || secret.startsWith('sk_test_...')) return null;
  return new Stripe(secret);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid booking details', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { locale, vehicle, quoteInput, appointment, customer } = parsed.data;
    const catalog = await getPricingCatalog();

    // Server-side authoritative recalculation (never trusts client totals)
    const calc = calculateQuote({ ...quoteInput, source: 'web' }, catalog);
    if (!calc.valid) {
      return NextResponse.json({ error: calc.errors.join('; ') }, { status: 422 });
    }

    const location = catalog.locations.find((l) => l.id === quoteInput.locationId);
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    if (location.status !== 'active') {
      return NextResponse.json(
        { error: 'This location is currently accepting waitlist entries only.' },
        { status: 409 },
      );
    }

    const quoteId = crypto.randomUUID();
    const shortCode = generateShortCode('TG');
    const appointmentId = crypto.randomUUID();
    const manageToken = crypto.randomUUID().replace(/-/g, '');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const localePrefix = locale === 'es' ? '/es' : '';
    const vehicleLabel = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');

    const stripe = getStripe();

    // Persist pending records
    const supabase = createServiceRoleClient();
    const now = new Date().toISOString();

    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: customer.email,
        payment_method_types: ['card'],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: calc.depositCents,
              product_data: {
                name: `Window Tint Deposit — ${vehicleLabel}`,
                description: `${location.name} · Total ${formatCents(calc.totalCents)} · Balance at appointment ${formatCents(calc.balanceCents)}`,
              },
            },
          },
        ],
        metadata: {
          quoteId,
          shortCode,
          appointmentId,
          manageToken,
          locationId: location.id,
          totalCents: String(calc.totalCents),
        },
        success_url: `${appUrl}${localePrefix}/my-appointment/${manageToken}?confirmed=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}${localePrefix}/quote?cancelled=1`,
      });

      if (supabase) {
        const { data: cust } = await supabase
          .from('customers')
          .insert({
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            notes: customer.notes ?? null,
          })
          .select('id')
          .single();

        await supabase.from('quotes').insert({
          id: quoteId,
          short_code: shortCode,
          location_id: location.id,
          customer_id: cust?.id ?? null,
          vehicle,
          lines: calc.lines,
          medical_exemption: Boolean(quoteInput.hasMedicalExemption),
          subtotal_cents: calc.subtotalCents,
          discount_cents: calc.totalDiscountCents,
          promo_code: quoteInput.promoCode ?? null,
          total_cents: calc.totalCents,
          deposit_cents: calc.depositCents,
          duration_min: calc.durationMin,
          status: 'draft',
          source: 'web',
        });

        await supabase.from('appointments').insert({
          id: appointmentId,
          quote_id: quoteId,
          location_id: location.id,
          customer_id: cust?.id,
          starts_at: appointment.startsAt,
          ends_at: appointment.endsAt,
          wait_type: appointment.waitType,
          status: 'pending_payment',
          stripe_session_id: session.id,
          manage_token: manageToken,
          notes: customer.notes ?? null,
        });
      } else {
        localStore.saveQuote({
          id: quoteId,
          shortCode,
          locationId: location.id,
          vehicle,
          input: quoteInput,
          lines: calc.lines,
          subtotalCents: calc.subtotalCents,
          discountCents: calc.totalDiscountCents,
          totalCents: calc.totalCents,
          depositCents: calc.depositCents,
          balanceCents: calc.balanceCents,
          durationMin: calc.durationMin,
          status: 'draft',
          source: 'web',
          createdAt: now,
        });

        localStore.saveAppointment({
          id: appointmentId,
          quoteId,
          shortCode,
          locationId: location.id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          notes: customer.notes,
          startsAt: appointment.startsAt,
          endsAt: appointment.endsAt,
          waitType: appointment.waitType,
          status: 'pending_payment',
          stripeSessionId: session.id,
          manageToken,
          createdAt: now,
        });
      }

      return NextResponse.json({
        checkoutUrl: session.url,
        sessionId: session.id,
        manageToken,
      });
    }

    // Local test mode when STRIPE_SECRET_KEY is not configured yet
    localStore.saveQuote({
      id: quoteId,
      shortCode,
      locationId: location.id,
      vehicle,
      input: quoteInput,
      lines: calc.lines,
      subtotalCents: calc.subtotalCents,
      discountCents: calc.totalDiscountCents,
      totalCents: calc.totalCents,
      depositCents: calc.depositCents,
      balanceCents: calc.balanceCents,
      durationMin: calc.durationMin,
      status: 'booked',
      source: 'web',
      createdAt: now,
    });

    localStore.saveAppointment({
      id: appointmentId,
      quoteId,
      shortCode,
      locationId: location.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      notes: customer.notes,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      waitType: appointment.waitType,
      status: 'confirmed',
      stripeSessionId: `demo_sess_${Date.now()}`,
      manageToken,
      createdAt: now,
    });

    const manageUrl = `${appUrl}${localePrefix}/my-appointment/${manageToken}?confirmed=1`;
    await sendBookingConfirmationEmail({
      to: customer.email,
      customerName: customer.name,
      vehicleLabel,
      locationName: location.name,
      locationAddress: location.address,
      startsAtFormatted: new Date(appointment.startsAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      totalFormatted: formatCents(calc.totalCents),
      depositFormatted: formatCents(calc.depositCents),
      balanceFormatted: formatCents(calc.balanceCents),
      manageUrl,
    });

    const messaging = getMessagingProvider();
    await messaging.send({
      to: customer.phone,
      body: `Top Glass Window Tint: Your appointment in ${location.name} is confirmed! Manage it anytime: ${manageUrl}`,
    });

    return NextResponse.json({
      checkoutUrl: manageUrl,
      demoMode: true,
      manageToken,
    });
  } catch (err) {
    console.error('[POST /api/checkout]', err);
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 });
  }
}
