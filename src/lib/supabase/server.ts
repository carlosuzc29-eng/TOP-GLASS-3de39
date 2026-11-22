import { createClient } from '@supabase/supabase-js';
import { SEED_CATALOG } from '@/lib/seed-data';
import type { PricingCatalog } from '@/types/domain';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project'),
  );
}

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes('your-project')) {
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('your-project')) {
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Loads the active pricing catalog from Supabase when configured,
 * or falls back cleanly to SEED_CATALOG for local development.
 */
export async function getPricingCatalog(): Promise<PricingCatalog> {
  if (!isSupabaseConfigured()) {
    return SEED_CATALOG;
  }

  const supabase = createAnonClient();
  if (!supabase) return SEED_CATALOG;

  try {
    const [locRes, catRes, filmRes, srvRes, matrixRes, fixedRes, promoRes] = await Promise.all([
      supabase.from('locations').select('*'),
      supabase.from('vehicle_categories').select('*').order('sort_order'),
      supabase.from('films').select('*').eq('active', true).order('sort_order'),
      supabase.from('services').select('*').eq('active', true).order('sort_order'),
      supabase.from('price_matrix').select('*'),
      supabase.from('fixed_prices').select('*'),
      supabase.from('promos').select('*').eq('active', true),
    ]);

    if (locRes.error || !locRes.data?.length) {
      return SEED_CATALOG;
    }

    const catById = new Map((catRes.data ?? []).map((c) => [c.id, c.key]));
    const srvById = new Map((srvRes.data ?? []).map((s) => [s.id, s.key]));
    const filmById = new Map((filmRes.data ?? []).map((f) => [f.id, f.tier]));

    return {
      locations: locRes.data.map((l) => ({
        id: l.id,
        slug: l.slug,
        name: l.name,
        city: l.city,
        state: l.state,
        stateCode: l.state_code,
        address: l.address,
        zipPrefixes: l.zip_prefixes ?? [],
        timezone: l.timezone,
        phone: l.phone,
        status: l.status,
        depositType: l.deposit_type,
        depositValue: l.deposit_value,
        onlineAddonDiscount: Number(l.online_addon_discount),
        frontMinVlt: l.front_min_vlt,
        windshieldRule: l.windshield_rule,
        disallowMetallic: l.disallow_metallic,
        medicalExemptionEnabled: l.medical_exemption_enabled,
        businessHours: l.business_hours,
        bays: l.bays,
        openingDiscountCode: l.opening_discount_code,
      })),
      categories: (catRes.data ?? []).map((c) => ({
        id: c.id,
        key: c.key,
        nameEn: c.name_en,
        nameEs: c.name_es,
        silhouetteKey: c.silhouette_key,
        sortOrder: c.sort_order,
      })),
      films: (filmRes.data ?? []).map((f) => ({
        id: f.id,
        tier: f.tier,
        name: f.name,
        brand: f.brand,
        descriptionEn: f.description_en,
        descriptionEs: f.description_es,
        tser: f.tser,
        irRejection: f.ir_rejection,
        uvRejection: f.uv_rejection,
        warrantyEn: f.warranty_en,
        warrantyEs: f.warranty_es,
        shades: f.shades,
        isMetallic: f.is_metallic,
        isClearWindshieldSafe: f.is_clear_windshield_safe,
        sortOrder: f.sort_order,
        isPopular: f.is_popular,
        active: f.active,
      })),
      services: (srvRes.data ?? []).map((s) => ({
        id: s.id,
        key: s.key,
        businessLine: s.business_line,
        nameEn: s.name_en,
        nameEs: s.name_es,
        descriptionEn: s.description_en,
        descriptionEs: s.description_es,
        type: s.type,
        durationMin: s.duration_min,
        zones: s.zones,
        sortOrder: s.sort_order,
        active: s.active,
      })),
      priceMatrix: (matrixRes.data ?? [])
        .map((m) => ({
          locationId: m.location_id,
          categoryKey: catById.get(m.category_id),
          serviceKey: srvById.get(m.service_id),
          filmTier: filmById.get(m.film_id),
          priceCents: m.price_cents,
        }))
        .filter((m) => m.categoryKey && m.serviceKey && m.filmTier),
      fixedPrices: (fixedRes.data ?? [])
        .map((fp) => ({
          locationId: fp.location_id,
          serviceKey: srvById.get(fp.service_id),
          priceCents: fp.price_cents,
        }))
        .filter((fp) => fp.serviceKey),
      promos: (promoRes.data ?? []).map((p) => ({
        code: p.code,
        type: p.type,
        value: p.value,
        validFrom: p.valid_from,
        validTo: p.valid_to,
        active: p.active,
      })),
    };
  } catch {
    return SEED_CATALOG;
  }
}
