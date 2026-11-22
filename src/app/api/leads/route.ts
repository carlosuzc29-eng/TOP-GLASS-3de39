import { NextResponse, type NextRequest } from 'next/server';
import { sendSavedQuoteEmail } from '@/lib/email/resend';
import { localStore } from '@/lib/local-store';
import { getMessagingProvider } from '@/lib/messaging/provider';
import { calculateQuote, formatCents } from '@/lib/pricing';
import { createServiceRoleClient, getPricingCatalog } from '@/lib/supabase/server';
import { generateShortCode } from '@/lib/utils';
import { saveLeadRequestSchema } from '@/lib/validations/quote';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = saveLeadRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please provide a valid email or phone number', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, phone, vehicle, quoteInput, lastStep, isWaitlist } = parsed.data;
    const catalog = await getPricingCatalog();
    const calc = calculateQuote(quoteInput, catalog);
    if (!calc.valid) {
      return NextResponse.json({ error: calc.errors.join('; ') }, { status: 422 });
    }

    const shortCode = generateShortCode('TG');
    const quoteId = crypto.randomUUID();
    const leadId = crypto.randomUUID();
    const now = new Date().toISOString();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const quoteUrl = `${appUrl}/q/${shortCode}`;

    const supabase = createServiceRoleClient();
    if (supabase) {
      await supabase.from('quotes').insert({
        id: quoteId,
        short_code: shortCode,
        location_id: quoteInput.locationId,
        vehicle,
        lines: calc.lines,
        medical_exemption: Boolean(quoteInput.hasMedicalExemption),
        subtotal_cents: calc.subtotalCents,
        discount_cents: calc.totalDiscountCents,
        promo_code: quoteInput.promoCode ?? null,
        total_cents: calc.totalCents,
        deposit_cents: calc.depositCents,
        duration_min: calc.durationMin,
        status: 'sent',
        source: 'web',
      });

      await supabase.from('leads').insert({
        id: leadId,
        contact_email: email || null,
        contact_phone: phone || null,
        quote_id: quoteId,
        location_id: quoteInput.locationId,
        last_step: lastStep,
        is_waitlist: isWaitlist,
      });
    } else {
      localStore.saveQuote({
        id: quoteId,
        shortCode,
        locationId: quoteInput.locationId,
        vehicle,
        input: quoteInput,
        lines: calc.lines,
        subtotalCents: calc.subtotalCents,
        discountCents: calc.totalDiscountCents,
        totalCents: calc.totalCents,
        depositCents: calc.depositCents,
        balanceCents: calc.balanceCents,
        durationMin: calc.durationMin,
        status: 'sent',
        source: 'web',
        createdAt: now,
      });

      localStore.addLead({
        id: leadId,
        contactEmail: email || undefined,
        contactPhone: phone || undefined,
        quoteId,
        shortCode,
        locationId: quoteInput.locationId,
        lastStep,
        isWaitlist,
        createdAt: now,
      });
    }

    const vehicleLabel = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');
    const totalFormatted = formatCents(calc.totalCents);

    if (email) {
      await sendSavedQuoteEmail({
        to: email,
        vehicleLabel,
        totalFormatted,
        quoteUrl,
        isWaitlist,
      });
    }

    if (phone) {
      const messaging = getMessagingProvider();
      await messaging.send({
        to: phone,
        body: isWaitlist
          ? `Top Glass Window Tint: You're on the Salt Lake City waitlist! Your saved quote (${totalFormatted}): ${quoteUrl}`
          : `Top Glass Window Tint: Your exact quote for ${vehicleLabel} (${totalFormatted}) is ready: ${quoteUrl}`,
      });
    }

    const location = catalog.locations.find((l) => l.id === quoteInput.locationId);

    return NextResponse.json({
      ok: true,
      shortCode,
      quoteUrl,
      openingDiscountCode: isWaitlist ? location?.openingDiscountCode ?? 'SLCOPEN15' : null,
    });
  } catch (err) {
    console.error('[POST /api/leads]', err);
    return NextResponse.json({ error: 'Could not save quote' }, { status: 500 });
  }
}
