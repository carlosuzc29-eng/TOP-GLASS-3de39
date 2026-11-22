import { describe, expect, it } from 'vitest';
import { calculateQuote, validateShadeCompliance } from './pricing';
import { SEED_CATALOG } from './seed-data';
import type { PricingCatalog, QuoteInput } from '@/types/domain';

const PRINCETON_ID = 'loc-princeton-tx';
const SLC_ID = 'loc-salt-lake-city-ut';

describe('Pricing Engine (lib/pricing.ts)', () => {
  it('calculates total without add-ons accurately for SUV in Princeton', () => {
    const input: QuoteInput = {
      locationId: PRINCETON_ID,
      categoryKey: 'suv',
      mainServiceKey: 'full_car',
      mainFilmTier: 'best',
      frontShade: 33,
      rearShade: 15,
      addons: [],
      removals: [],
      source: 'web',
    };

    const result = calculateQuote(input, SEED_CATALOG);
    expect(result.valid).toBe(true);
    expect(result.subtotalCents).toBe(67500);
    expect(result.onlineAddonDiscountCents).toBe(0);
    expect(result.totalCents).toBe(67500);
    expect(result.depositCents).toBe(5000);
    expect(result.balanceCents).toBe(62500);
    expect(result.durationMin).toBe(90);
  });

  it('applies 10% online discount ONLY to add-ons and not to main service or removals', () => {
    const input: QuoteInput = {
      locationId: PRINCETON_ID,
      categoryKey: 'suv',
      mainServiceKey: 'full_car', // $675
      mainFilmTier: 'best',
      frontShade: 33,
      rearShade: 15,
      addons: [
        { serviceKey: 'full_windshield', filmTier: 'best', shade: 70 }, // $375 -> 10% off = $37.50
        { serviceKey: 'single_sunroof', filmTier: 'better', shade: 33 }, // $160 -> 10% off = $16.00
      ],
      removals: ['removal_front'], // $85 -> no discount
      source: 'web',
    };

    const result = calculateQuote(input, SEED_CATALOG);
    expect(result.valid).toBe(true);
    expect(result.subtotalCents).toBe(67500 + 37500 + 16000 + 8500); // 129500
    expect(result.onlineAddonDiscountCents).toBe(3750 + 1600); // 5350
    expect(result.totalCents).toBe(129500 - 5350); // 124150
    expect(result.depositCents).toBe(5000);
    expect(result.balanceCents).toBe(124150 - 5000);
    expect(result.durationMin).toBe(90 + 45 + 30 + 30); // 195 min
  });

  it('supports fixed deposit vs percentage deposit per location', () => {
    const percentageCatalog: PricingCatalog = {
      ...SEED_CATALOG,
      locations: SEED_CATALOG.locations.map((loc) =>
        loc.id === PRINCETON_ID
          ? { ...loc, depositType: 'percentage', depositValue: 20 }
          : loc,
      ),
    };

    const input: QuoteInput = {
      locationId: PRINCETON_ID,
      categoryKey: 'sedan', // 0.90 multiplier: 515 * 0.9 = 463.5 -> rounded to 5 = $465
      mainServiceKey: 'full_car',
      mainFilmTier: 'better',
      frontShade: 33,
      rearShade: 22,
      addons: [],
      removals: [],
      source: 'web',
    };

    const result = calculateQuote(input, percentageCatalog);
    expect(result.valid).toBe(true);
    expect(result.totalCents).toBe(46500);
    expect(result.depositCents).toBe(9300); // 20% of $465
    expect(result.balanceCents).toBe(37200);
  });

  it('rejects unavailable (null) service + film combinations', () => {
    const input: QuoteInput = {
      locationId: PRINCETON_ID,
      categoryKey: 'suv',
      mainServiceKey: 'full_car',
      mainFilmTier: 'best',
      frontShade: 33,
      rearShade: 15,
      addons: [
        // Sun strip is only priced in "good" tier; "best" is null
        { serviceKey: 'sun_strip', filmTier: 'best', shade: 5 },
      ],
      removals: [],
      source: 'web',
    };

    const result = calculateQuote(input, SEED_CATALOG);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('not available'))).toBe(true);
  });

  it('ignores any tampered client-supplied totals and recalculates strictly from catalog', () => {
    // Even if a malicious payload passes extra fields like totalCents: 100, calculateQuote ignores them
    const tamperedPayload = {
      locationId: PRINCETON_ID,
      categoryKey: 'suv',
      mainServiceKey: 'full_car',
      mainFilmTier: 'ultimate',
      frontShade: 33,
      rearShade: 15,
      addons: [],
      removals: [],
      source: 'web',
      totalCents: 100, // tampered!
      manualDiscountCents: 50000, // ignored when source === 'web'!
    } as QuoteInput;

    const result = calculateQuote(tamperedPayload, SEED_CATALOG);
    expect(result.valid).toBe(true);
    expect(result.totalCents).toBe(83500);
    expect(result.manualDiscountCents).toBe(0);
  });

  it('blocks illegal front shades per location and unlocks TX with medical exemption', () => {
    const txLoc = SEED_CATALOG.locations.find((l) => l.id === PRINCETON_ID)!;
    const utLoc = SEED_CATALOG.locations.find((l) => l.id === SLC_ID)!;
    const bestFilm = SEED_CATALOG.films.find((f) => f.tier === 'best')!;

    // TX min front VLT is 25% -> 22% should be blocked
    expect(
      validateShadeCompliance({
        location: txLoc,
        zone: 'front',
        shade: 22,
        film: bestFilm,
        hasMedicalExemption: false,
      }).allowed,
    ).toBe(false);

    // TX medical exemption unlocks 22%
    expect(
      validateShadeCompliance({
        location: txLoc,
        zone: 'front',
        shade: 22,
        film: bestFilm,
        hasMedicalExemption: true,
      }).allowed,
    ).toBe(true);

    // UT min front VLT is 35% -> 33% should be blocked even if medical exemption flag is passed (disabled in UT)
    expect(
      validateShadeCompliance({
        location: utLoc,
        zone: 'front',
        shade: 33,
        film: bestFilm,
        hasMedicalExemption: true,
      }).allowed,
    ).toBe(false);

    // Full windshield in TX rejects non-clear shade (e.g., 40%)
    const badWindshield = calculateQuote(
      {
        locationId: PRINCETON_ID,
        categoryKey: 'suv',
        mainServiceKey: 'full_car',
        mainFilmTier: 'best',
        frontShade: 33,
        rearShade: 15,
        addons: [{ serviceKey: 'full_windshield', filmTier: 'best', shade: 40 }],
        removals: [],
        source: 'web',
      },
      SEED_CATALOG,
    );
    expect(badWindshield.valid).toBe(false);
    expect(badWindshield.errors.some((e) => e.includes('clear UV/IR'))).toBe(true);
  });
});
