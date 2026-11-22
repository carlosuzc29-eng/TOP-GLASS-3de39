import type {
  CalculatedLine,
  Film,
  FilmTier,
  Location,
  PricingCatalog,
  QuoteCalculationResult,
  QuoteInput,
  SilhouetteKey,
} from '@/types/domain';

export const SHADE_STEPS = [70, 56, 40, 33, 22, 15, 5] as const;

/**
 * Maps VLT percentage (70% lightest -> 5% darkest) to visual SVG opacity.
 */
export function vltToOpacity(vlt: number | null | undefined): number {
  if (vlt == null) return 0.12;
  const map: Record<number, number> = {
    70: 0.25,
    56: 0.36,
    40: 0.5,
    33: 0.6,
    22: 0.74,
    15: 0.85,
    5: 0.95,
  };
  if (map[vlt] !== undefined) return map[vlt];
  // Linear fallback clamped between 0.2 and 0.95
  const normalized = 1 - Math.min(Math.max(vlt, 5), 70) / 80;
  return Number(Math.min(0.95, Math.max(0.2, normalized)).toFixed(2));
}

export function formatCents(cents: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale === 'es' ? 'es-US' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export interface ShadeComplianceResult {
  allowed: boolean;
  reason?: 'below_front_legal_limit' | 'windshield_clear_only' | 'metallic_prohibited';
}

export function validateShadeCompliance(params: {
  location: Location;
  zone: 'front' | 'rear' | 'windshield' | 'sunroof';
  shade: number;
  film: Film;
  hasMedicalExemption?: boolean;
}): ShadeComplianceResult {
  const { location, zone, shade, film, hasMedicalExemption = false } = params;

  if (location.disallowMetallic && film.isMetallic) {
    return { allowed: false, reason: 'metallic_prohibited' };
  }

  if (zone === 'front') {
    const canBypass = location.medicalExemptionEnabled && hasMedicalExemption;
    if (!canBypass && shade < location.frontMinVlt) {
      return { allowed: false, reason: 'below_front_legal_limit' };
    }
  }

  if (zone === 'windshield' && location.windshieldRule === 'clear_only') {
    if (!film.isClearWindshieldSafe || shade < 70) {
      return { allowed: false, reason: 'windshield_clear_only' };
    }
  }

  return { allowed: true };
}

export function getMatrixPriceCents(
  catalog: PricingCatalog,
  locationId: string,
  categoryKey: SilhouetteKey,
  serviceKey: string,
  filmTier: FilmTier,
): number | null {
  const entry = catalog.priceMatrix.find(
    (row) =>
      row.locationId === locationId &&
      row.categoryKey === categoryKey &&
      row.serviceKey === serviceKey &&
      row.filmTier === filmTier,
  );
  return entry ? entry.priceCents : null;
}

export function getFixedPriceCents(
  catalog: PricingCatalog,
  locationId: string,
  serviceKey: string,
): number | null {
  const entry = catalog.fixedPrices.find(
    (row) => row.locationId === locationId && row.serviceKey === serviceKey,
  );
  return entry ? entry.priceCents : null;
}

/**
 * Pure single-source-of-truth pricing engine.
 * Used identically by public /quote, /admin/quick-quote, and server-side checkout recalculation.
 * Never trusts client-supplied totals or line prices.
 */
export function calculateQuote(
  input: QuoteInput,
  catalog: PricingCatalog,
): QuoteCalculationResult {
  const errors: string[] = [];
  const lines: CalculatedLine[] = [];

  const location = catalog.locations.find((l) => l.id === input.locationId);
  if (!location) {
    return invalidResult(['Location not found']);
  }

  const category = catalog.categories.find((c) => c.key === input.categoryKey);
  if (!category) {
    return invalidResult(['Vehicle category not found']);
  }

  const mainService = catalog.services.find(
    (s) => s.key === input.mainServiceKey && s.type === 'main' && s.active,
  );
  if (!mainService) {
    return invalidResult(['Main service not found']);
  }

  const mainFilm = catalog.films.find((f) => f.tier === input.mainFilmTier && f.active);
  if (!mainFilm) {
    return invalidResult(['Selected film not found']);
  }

  // Validate front shade legality
  if (input.frontShade != null) {
    if (!mainFilm.shades.includes(input.frontShade)) {
      errors.push(`Front shade ${input.frontShade}% is not available for ${mainFilm.name}`);
    } else {
      const check = validateShadeCompliance({
        location,
        zone: 'front',
        shade: input.frontShade,
        film: mainFilm,
        hasMedicalExemption: input.hasMedicalExemption,
      });
      if (!check.allowed) {
        errors.push(`Front shade ${input.frontShade}% violates ${location.state} regulations`);
      }
    }
  }

  // Validate rear shade if applicable
  if (input.rearShade != null && mainService.zones.includes('rear')) {
    if (!mainFilm.shades.includes(input.rearShade)) {
      errors.push(`Rear shade ${input.rearShade}% is not available for ${mainFilm.name}`);
    } else if (location.disallowMetallic && mainFilm.isMetallic) {
      errors.push(`Metallic films are not allowed in ${location.state}`);
    }
  }

  // 1. Main service price
  const mainPriceCents = getMatrixPriceCents(
    catalog,
    location.id,
    category.key,
    mainService.key,
    mainFilm.tier,
  );

  if (mainPriceCents === null) {
    errors.push(`Main service "${mainService.nameEn}" is unavailable with ${mainFilm.name}`);
  } else {
    lines.push({
      serviceKey: mainService.key,
      serviceType: mainService.type,
      nameEn: mainService.nameEn,
      nameEs: mainService.nameEs,
      filmTier: mainFilm.tier,
      filmName: mainFilm.name,
      frontShade: input.frontShade ?? null,
      rearShade: mainService.zones.includes('rear') ? (input.rearShade ?? null) : null,
      basePriceCents: mainPriceCents,
      discountCents: 0,
      finalPriceCents: mainPriceCents,
      durationMin: mainService.durationMin,
    });
  }

  // 2. Add-ons (online discount applies ONLY to addons when source === 'web')
  let onlineAddonDiscountCents = 0;
  const addonDiscountRate = input.source === 'web' ? location.onlineAddonDiscount : 0;

  for (const addon of input.addons) {
    const service = catalog.services.find(
      (s) => s.key === addon.serviceKey && s.type === 'addon' && s.active,
    );
    if (!service) {
      errors.push(`Add-on "${addon.serviceKey}" not found`);
      continue;
    }

    const tier: FilmTier = addon.filmTier ?? input.mainFilmTier;
    const film = catalog.films.find((f) => f.tier === tier && f.active);
    if (!film) {
      errors.push(`Film tier "${tier}" not found for add-on "${service.nameEn}"`);
      continue;
    }

    // Windshield clear-only check
    if (service.key === 'full_windshield' && location.windshieldRule === 'clear_only') {
      const shadeToCheck = addon.shade ?? 70;
      const check = validateShadeCompliance({
        location,
        zone: 'windshield',
        shade: shadeToCheck,
        film,
        hasMedicalExemption: false,
      });
      if (!check.allowed) {
        errors.push(
          `Full windshield in ${location.state} requires clear UV/IR film (70%+ VLT)`,
        );
        continue;
      }
    }

    const basePrice = getMatrixPriceCents(catalog, location.id, category.key, service.key, tier);
    if (basePrice === null) {
      errors.push(`Add-on "${service.nameEn}" is not available in ${film.name}`);
      continue;
    }

    const discount = Math.round(basePrice * addonDiscountRate);
    onlineAddonDiscountCents += discount;

    lines.push({
      serviceKey: service.key,
      serviceType: service.type,
      nameEn: service.nameEn,
      nameEs: service.nameEs,
      filmTier: film.tier,
      filmName: film.name,
      shade: addon.shade ?? (service.key === 'full_windshield' ? 70 : null),
      basePriceCents: basePrice,
      discountCents: discount,
      finalPriceCents: basePrice - discount,
      durationMin: service.durationMin,
    });
  }

  // 3. Removals (fixed prices, no online addon discount)
  for (const removalKey of input.removals) {
    const service = catalog.services.find(
      (s) => s.key === removalKey && s.type === 'removal' && s.active,
    );
    if (!service) {
      errors.push(`Removal service "${removalKey}" not found`);
      continue;
    }
    const fixedPrice = getFixedPriceCents(catalog, location.id, service.key);
    if (fixedPrice === null) {
      errors.push(`Price not configured for removal "${service.nameEn}"`);
      continue;
    }
    lines.push({
      serviceKey: service.key,
      serviceType: service.type,
      nameEn: service.nameEn,
      nameEs: service.nameEs,
      basePriceCents: fixedPrice,
      discountCents: 0,
      finalPriceCents: fixedPrice,
      durationMin: service.durationMin,
    });
  }

  const subtotalCents = lines.reduce((acc, l) => acc + l.basePriceCents, 0);
  const afterAddonDiscountCents = subtotalCents - onlineAddonDiscountCents;

  // 4. Promo code
  let promoDiscountCents = 0;
  if (input.promoCode && input.promoCode.trim().length > 0) {
    const normalizedCode = input.promoCode.trim().toUpperCase();
    const promo = catalog.promos.find((p) => p.code.toUpperCase() === normalizedCode && p.active);
    if (!promo) {
      errors.push(`Promo code "${normalizedCode}" is invalid or expired`);
    } else {
      const now = Date.now();
      const validFromOk = !promo.validFrom || Date.parse(promo.validFrom) <= now;
      const validToOk = !promo.validTo || Date.parse(promo.validTo) >= now;
      if (!validFromOk || !validToOk) {
        errors.push(`Promo code "${normalizedCode}" is outside its valid dates`);
      } else if (promo.type === 'fixed') {
        promoDiscountCents = Math.min(promo.value, afterAddonDiscountCents);
      } else {
        promoDiscountCents = Math.round(afterAddonDiscountCents * (promo.value / 100));
      }
    }
  }

  // 5. Manual discount (shop only)
  const manualDiscountCents =
    input.source === 'shop' && input.manualDiscountCents && input.manualDiscountCents > 0
      ? Math.min(input.manualDiscountCents, afterAddonDiscountCents - promoDiscountCents)
      : 0;

  const totalDiscountCents = onlineAddonDiscountCents + promoDiscountCents + manualDiscountCents;
  const totalCents = Math.max(0, subtotalCents - totalDiscountCents);

  // 6. Deposit (fixed cents or % of total)
  let depositCents = 0;
  if (location.depositType === 'fixed') {
    depositCents = Math.min(location.depositValue, totalCents);
  } else {
    depositCents = Math.round(totalCents * (location.depositValue / 100));
  }

  const balanceCents = Math.max(0, totalCents - depositCents);
  const durationMin = lines.reduce((acc, l) => acc + l.durationMin, 0);

  return {
    valid: errors.length === 0,
    errors,
    lines,
    subtotalCents,
    onlineAddonDiscountCents,
    promoDiscountCents,
    manualDiscountCents,
    totalDiscountCents,
    totalCents,
    depositCents,
    balanceCents,
    durationMin,
  };
}

function invalidResult(errors: string[]): QuoteCalculationResult {
  return {
    valid: false,
    errors,
    lines: [],
    subtotalCents: 0,
    onlineAddonDiscountCents: 0,
    promoDiscountCents: 0,
    manualDiscountCents: 0,
    totalDiscountCents: 0,
    totalCents: 0,
    depositCents: 0,
    balanceCents: 0,
    durationMin: 0,
  };
}
