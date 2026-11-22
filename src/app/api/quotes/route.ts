import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { calculateQuote } from '@/lib/pricing';
import { localStore } from '@/lib/local-store';
import { createServiceRoleClient, getPricingCatalog } from '@/lib/supabase/server';
import { generateShortCode } from '@/lib/utils';
import { quoteInputSchema, vehicleSelectionSchema } from '@/lib/validations/quote';

const createQuoteBodySchema = z.object({
  vehicle: vehicleSelectionSchema,
  quoteInput: quoteInputSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createQuoteBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid quote payload', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const catalog = await getPricingCatalog();
    const calc = calculateQuote(parsed.data.quoteInput, catalog);
    if (!calc.valid) {
      return NextResponse.json({ error: calc.errors.join('; ') }, { status: 422 });
    }

    const shortCode = generateShortCode('TG');
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const supabase = createServiceRoleClient();
    if (supabase) {
      await supabase.from('quotes').insert({
        id,
        short_code: shortCode,
        location_id: parsed.data.quoteInput.locationId,
        vehicle: parsed.data.vehicle,
        lines: calc.lines,
        medical_exemption: Boolean(parsed.data.quoteInput.hasMedicalExemption),
        subtotal_cents: calc.subtotalCents,
        discount_cents: calc.totalDiscountCents,
        promo_code: parsed.data.quoteInput.promoCode ?? null,
        total_cents: calc.totalCents,
        deposit_cents: calc.depositCents,
        duration_min: calc.durationMin,
        status: 'sent',
        source: parsed.data.quoteInput.source,
      });
    } else {
      localStore.saveQuote({
        id,
        shortCode,
        locationId: parsed.data.quoteInput.locationId,
        vehicle: parsed.data.vehicle,
        input: parsed.data.quoteInput,
        lines: calc.lines,
        subtotalCents: calc.subtotalCents,
        discountCents: calc.totalDiscountCents,
        totalCents: calc.totalCents,
        depositCents: calc.depositCents,
        balanceCents: calc.balanceCents,
        durationMin: calc.durationMin,
        status: 'sent',
        source: parsed.data.quoteInput.source,
        createdAt: now,
      });
    }

    return NextResponse.json({
      id,
      shortCode,
      calculation: calc,
    });
  } catch (err) {
    console.error('[POST /api/quotes]', err);
    return NextResponse.json({ error: 'Unable to save quote' }, { status: 500 });
  }
}
