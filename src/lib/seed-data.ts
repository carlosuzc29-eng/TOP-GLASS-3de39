import type {
  Film,
  FilmTier,
  FixedPriceEntry,
  Location,
  PriceMatrixEntry,
  PricingCatalog,
  Promo,
  Service,
  SilhouetteKey,
  VehicleCategory,
} from '@/types/domain';

export const CATEGORY_MULTIPLIERS: Record<SilhouetteKey, number> = {
  coupe: 0.85,
  sedan: 0.9,
  suv: 1.0,
  large_suv: 1.15,
  pickup_single: 0.8,
  pickup_crew: 1.05,
};

function roundTo5DollarsInCents(usd: number): number {
  return Math.round(usd / 5) * 500;
}

export const SEED_LOCATIONS: Location[] = [
  {
    id: 'loc-princeton-tx',
    slug: 'princeton-tx',
    name: 'Princeton, TX',
    city: 'Princeton',
    state: 'Texas',
    stateCode: 'TX',
    address: '123 Main St, Princeton, TX 75407', // TODO(content): replace with final address
    zipPrefixes: ['754', '750', '751', '752'],
    timezone: 'America/Chicago',
    phone: '(469) 555-0194', // TODO(content): replace with final phone
    status: 'active',
    depositType: 'fixed',
    depositValue: 5000, // $50.00
    onlineAddonDiscount: 0.1,
    frontMinVlt: 25,
    windshieldRule: 'clear_only',
    disallowMetallic: false,
    medicalExemptionEnabled: true,
    businessHours: {
      mon: { open: '09:00', close: '18:00' },
      tue: { open: '09:00', close: '18:00' },
      wed: { open: '09:00', close: '18:00' },
      thu: { open: '09:00', close: '18:00' },
      fri: { open: '09:00', close: '18:00' },
      sat: { open: '09:00', close: '16:00' },
      sun: null,
    },
    bays: 2,
    openingDiscountCode: null,
  },
  {
    id: 'loc-salt-lake-city-ut',
    slug: 'salt-lake-city-ut',
    name: 'Salt Lake City, UT',
    city: 'Salt Lake City',
    state: 'Utah',
    stateCode: 'UT',
    address: 'Salt Lake City, UT 84101', // TODO(content): replace with opening address
    zipPrefixes: ['840', '841', '844'],
    timezone: 'America/Denver',
    phone: '(801) 555-0182', // TODO(content): replace with final phone
    status: 'coming_soon',
    depositType: 'fixed',
    depositValue: 5000,
    onlineAddonDiscount: 0.1,
    frontMinVlt: 35,
    windshieldRule: 'clear_only',
    disallowMetallic: true,
    medicalExemptionEnabled: false,
    businessHours: {
      mon: { open: '09:00', close: '18:00' },
      tue: { open: '09:00', close: '18:00' },
      wed: { open: '09:00', close: '18:00' },
      thu: { open: '09:00', close: '18:00' },
      fri: { open: '09:00', close: '18:00' },
      sat: { open: '09:00', close: '16:00' },
      sun: null,
    },
    bays: 2,
    openingDiscountCode: 'SLCOPEN15',
  },
];

export const SEED_CATEGORIES: VehicleCategory[] = [
  {
    id: 'cat-coupe',
    key: 'coupe',
    nameEn: 'Coupe (2-Door)',
    nameEs: 'Coupé (2 puertas)',
    silhouetteKey: 'coupe',
    sortOrder: 1,
  },
  {
    id: 'cat-sedan',
    key: 'sedan',
    nameEn: 'Sedan (4-Door)',
    nameEs: 'Sedán (4 puertas)',
    silhouetteKey: 'sedan',
    sortOrder: 2,
  },
  {
    id: 'cat-suv',
    key: 'suv',
    nameEn: 'SUV / Crossover',
    nameEs: 'SUV / Crossover',
    silhouetteKey: 'suv',
    sortOrder: 3,
  },
  {
    id: 'cat-large-suv',
    key: 'large_suv',
    nameEn: 'Large SUV / Minivan',
    nameEs: 'SUV grande / Minivan',
    silhouetteKey: 'large_suv',
    sortOrder: 4,
  },
  {
    id: 'cat-pickup-single',
    key: 'pickup_single',
    nameEn: 'Single Cab Pickup',
    nameEs: 'Pickup cabina sencilla',
    silhouetteKey: 'pickup_single',
    sortOrder: 5,
  },
  {
    id: 'cat-pickup-crew',
    key: 'pickup_crew',
    nameEn: 'Crew Cab Pickup',
    nameEs: 'Pickup doble cabina',
    silhouetteKey: 'pickup_crew',
    sortOrder: 6,
  },
];

// TODO(content): Replace film names, brands, and technical specs with final film lineup
export const SEED_FILMS: Film[] = [
  {
    id: 'film-good',
    tier: 'good',
    name: 'Carbon Matte',
    brand: 'Top Glass Series',
    descriptionEn:
      'Color-stable carbon film for crisp privacy, glare reduction, and zero signal interference.',
    descriptionEs:
      'Película de carbono que no cambia de color: privacidad, menos reflejos y cero interferencia con tu celular o GPS.',
    tser: 44,
    irRejection: 52,
    uvRejection: 99,
    warrantyEn: 'Lifetime limited warranty against bubbling, peeling, and fading',
    warrantyEs: 'Garantía limitada de por vida contra burbujas, desprendimiento y decoloración',
    shades: [56, 40, 33, 22, 15, 5],
    isMetallic: false,
    isClearWindshieldSafe: false,
    sortOrder: 1,
    isPopular: false,
    active: true,
  },
  {
    id: 'film-better',
    tier: 'better',
    name: 'Nano Ceramic',
    brand: 'Top Glass Series',
    descriptionEn:
      'Balanced ceramic heat rejection that noticeably cools the cabin without darkening your view.',
    descriptionEs:
      'Cerámica equilibrada que refresca la cabina de forma notable sin quitarte visibilidad.',
    tser: 56,
    irRejection: 78,
    uvRejection: 99,
    warrantyEn: 'Lifetime nationwide warranty covering fading, bubbling, and delamination',
    warrantyEs: 'Garantía de por vida en todo el país contra decoloración, burbujas y desprendimiento',
    shades: [70, 56, 40, 33, 22, 15, 5],
    isMetallic: false,
    isClearWindshieldSafe: true,
    sortOrder: 2,
    isPopular: false,
    active: true,
  },
  {
    id: 'film-best',
    tier: 'best',
    name: 'Ceramic Pro',
    brand: 'Top Glass Series',
    descriptionEn:
      'Multi-layer nano-ceramic engineered for Texas summer heat. High infrared rejection with optical clarity.',
    descriptionEs:
      'Nanocerámica multicapa pensada para el calor de Texas. Bloquea mucho calor infrarrojo y mantiene una vista nítida.',
    tser: 63,
    irRejection: 88,
    uvRejection: 99,
    warrantyEn: 'Lifetime transferable warranty including glass-break replacement credit',
    warrantyEs: 'Garantía de por vida transferible, con crédito para reponer la película si se rompe el vidrio',
    shades: [70, 56, 40, 33, 22, 15, 5],
    isMetallic: false,
    isClearWindshieldSafe: true,
    sortOrder: 3,
    isPopular: true,
    active: true,
  },
  {
    id: 'film-ultimate',
    tier: 'ultimate',
    name: 'Ceramic IR Max',
    brand: 'Top Glass Series',
    descriptionEn:
      'Maximum infrared and solar energy rejection available. Built for flagship comfort and interior preservation.',
    descriptionEs:
      'El mayor bloqueo de calor infrarrojo y solar que ofrecemos. Para máxima comodidad y para proteger tu interior.',
    tser: 71,
    irRejection: 96,
    uvRejection: 99,
    warrantyEn: 'Lifetime premier warranty with priority service and no-fade guarantee',
    warrantyEs: 'Garantía premium de por vida con atención prioritaria y garantía contra decoloración',
    shades: [70, 56, 40, 33, 22, 15, 5],
    isMetallic: false,
    isClearWindshieldSafe: true,
    sortOrder: 4,
    isPopular: false,
    active: true,
  },
];

export const SEED_SERVICES: Service[] = [
  {
    id: 'srv-full-car',
    key: 'full_car',
    businessLine: 'auto_tint',
    nameEn: 'Full Car (Sides + Rear)',
    nameEs: 'Vehículo completo (laterales + medallón)',
    descriptionEn: 'All side windows plus full rear windshield.',
    descriptionEs: 'Todas las ventanas laterales y el medallón completo.',
    type: 'main',
    durationMin: 90,
    zones: ['front', 'rear', 'back'],
    sortOrder: 1,
    active: true,
  },
  {
    id: 'srv-front-two',
    key: 'front_two',
    businessLine: 'auto_tint',
    nameEn: 'Front Two Doors Only',
    nameEs: 'Solo las dos puertas delanteras',
    descriptionEn: 'Match factory-tinted rear glass on SUVs and trucks.',
    descriptionEs: 'Para igualar los vidrios traseros oscuros de fábrica en SUVs y pickups.',
    type: 'main',
    durationMin: 40,
    zones: ['front'],
    sortOrder: 2,
    active: true,
  },
  {
    id: 'srv-full-windshield',
    key: 'full_windshield',
    businessLine: 'auto_tint',
    nameEn: 'Full Windshield',
    nameEs: 'Parabrisas completo',
    descriptionEn: 'Clear UV/IR heat-shielding film across the entire front glass.',
    descriptionEs: 'Película transparente UV/IR que bloquea el calor en todo el parabrisas.',
    type: 'addon',
    durationMin: 45,
    zones: ['windshield'],
    sortOrder: 3,
    active: true,
  },
  {
    id: 'srv-sun-strip',
    key: 'sun_strip',
    businessLine: 'auto_tint',
    nameEn: 'Sun Strip (Brow)',
    nameEs: 'Franja superior (visera)',
    descriptionEn: 'Top glare-blocking visor strip along the upper windshield.',
    descriptionEs: 'Franja en la parte de arriba del parabrisas que reduce el deslumbramiento.',
    type: 'addon',
    durationMin: 15,
    zones: ['windshield'],
    sortOrder: 4,
    active: true,
  },
  {
    id: 'srv-single-sunroof',
    key: 'single_sunroof',
    businessLine: 'auto_tint',
    nameEn: 'Single Sunroof',
    nameEs: 'Quemacocos sencillo',
    descriptionEn: 'Overhead solar heat rejection for a standard sunroof panel.',
    descriptionEs: 'Bloquea el calor del sol que entra por un quemacocos estándar.',
    type: 'addon',
    durationMin: 30,
    zones: ['sunroof'],
    sortOrder: 5,
    active: true,
  },
  {
    id: 'srv-panoramic-roof',
    key: 'panoramic_roof',
    businessLine: 'auto_tint',
    nameEn: 'Full Panoramic Roof',
    nameEs: 'Techo panorámico completo',
    descriptionEn: 'Full coverage for dual-pane or panoramic glass roofs.',
    descriptionEs: 'Cobertura completa para techos panorámicos o de dos paneles de vidrio.',
    type: 'addon',
    durationMin: 60,
    zones: ['sunroof'],
    sortOrder: 6,
    active: true,
  },
  {
    id: 'srv-removal-front',
    key: 'removal_front',
    businessLine: 'auto_tint',
    nameEn: 'Old Tint Removal — Front Two',
    nameEs: 'Retiro de polarizado viejo — delanteras',
    descriptionEn: 'Safe adhesive and film removal on front doors.',
    descriptionEs: 'Quitamos la película y el pegamento de las puertas delanteras sin dañar el vidrio.',
    type: 'removal',
    durationMin: 30,
    zones: ['front'],
    sortOrder: 7,
    active: true,
  },
  {
    id: 'srv-removal-full',
    key: 'removal_full',
    businessLine: 'auto_tint',
    nameEn: 'Old Tint Removal — Full Car',
    nameEs: 'Retiro de polarizado viejo — vehículo completo',
    descriptionEn: 'Complete removal on all side windows and rear glass.',
    descriptionEs: 'Retiro completo en ventanas laterales y medallón.',
    type: 'removal',
    durationMin: 60,
    zones: ['front', 'rear', 'back'],
    sortOrder: 8,
    active: true,
  },
  {
    id: 'srv-removal-windshield',
    key: 'removal_windshield',
    businessLine: 'auto_tint',
    nameEn: 'Old Tint Removal — Windshield',
    nameEs: 'Retiro de polarizado viejo — parabrisas',
    descriptionEn: 'Removal of existing full windshield film.',
    descriptionEs: 'Retiro de la película que ya tiene el parabrisas.',
    type: 'removal',
    durationMin: 35,
    zones: ['windshield'],
    sortOrder: 9,
    active: true,
  },
  {
    id: 'srv-removal-sun-strip',
    key: 'removal_sun_strip',
    businessLine: 'auto_tint',
    nameEn: 'Old Tint Removal — Sun Strip',
    nameEs: 'Retiro de polarizado viejo — franja superior',
    descriptionEn: 'Removal of upper windshield visor strip.',
    descriptionEs: 'Retiro de la franja de la parte de arriba del parabrisas.',
    type: 'removal',
    durationMin: 15,
    zones: ['windshield'],
    sortOrder: 10,
    active: true,
  },
  {
    id: 'srv-removal-rear',
    key: 'removal_rear',
    businessLine: 'auto_tint',
    nameEn: 'Old Tint Removal — Rear Glass',
    nameEs: 'Retiro de polarizado viejo — medallón',
    descriptionEn: 'Careful defroster-safe rear glass film removal.',
    descriptionEs: 'Retiro cuidadoso sin dañar las líneas del desempañador.',
    type: 'removal',
    durationMin: 40,
    zones: ['back'],
    sortOrder: 11,
    active: true,
  },
];

// Base SUV prices in USD (Princeton seed matrix)
const BASE_SUV_PRICES_USD: Record<string, Record<FilmTier, number | null>> = {
  full_car: { good: 375, better: 515, best: 675, ultimate: 835 },
  front_two: { good: 175, better: 205, best: 240, ultimate: 300 },
  full_windshield: { good: 210, better: 265, best: 375, ultimate: 425 },
  sun_strip: { good: 65, better: null, best: null, ultimate: null },
  single_sunroof: { good: 130, better: 160, best: 195, ultimate: 225 },
  panoramic_roof: { good: 240, better: 300, best: 365, ultimate: 430 },
};

const REMOVAL_PRICES_CENTS: Record<string, number> = {
  removal_front: 8500,
  removal_full: 21500,
  removal_windshield: 11000,
  removal_sun_strip: 3000,
  removal_rear: 11000,
};

function buildSeedPriceMatrix(): PriceMatrixEntry[] {
  const entries: PriceMatrixEntry[] = [];
  const tiers: FilmTier[] = ['good', 'better', 'best', 'ultimate'];

  for (const loc of SEED_LOCATIONS) {
    for (const cat of SEED_CATEGORIES) {
      const mult = CATEGORY_MULTIPLIERS[cat.key];
      for (const [serviceKey, tierMap] of Object.entries(BASE_SUV_PRICES_USD)) {
        for (const tier of tiers) {
          const baseUsd = tierMap[tier];
          entries.push({
            locationId: loc.id,
            categoryKey: cat.key,
            serviceKey,
            filmTier: tier,
            priceCents: baseUsd === null ? null : roundTo5DollarsInCents(baseUsd * mult),
          });
        }
      }
    }
  }
  return entries;
}

function buildSeedFixedPrices(): FixedPriceEntry[] {
  const entries: FixedPriceEntry[] = [];
  for (const loc of SEED_LOCATIONS) {
    for (const [serviceKey, priceCents] of Object.entries(REMOVAL_PRICES_CENTS)) {
      entries.push({
        locationId: loc.id,
        serviceKey,
        priceCents,
      });
    }
  }
  return entries;
}

export const SEED_PROMOS: Promo[] = [
  { code: 'SLCOPEN15', type: 'percentage', value: 15, active: true },
  { code: 'WELCOME25', type: 'fixed', value: 2500, active: true },
];

export const SEED_CATALOG: PricingCatalog = {
  locations: SEED_LOCATIONS,
  categories: SEED_CATEGORIES,
  films: SEED_FILMS,
  services: SEED_SERVICES,
  priceMatrix: buildSeedPriceMatrix(),
  fixedPrices: buildSeedFixedPrices(),
  promos: SEED_PROMOS,
};

// Popular vehicle quick-mapping for instant search & category detection
export const POPULAR_VEHICLES: Array<{
  make: string;
  model: string;
  categoryKey: SilhouetteKey;
}> = [
  { make: 'Lamborghini', model: 'Urus', categoryKey: 'suv' },
  { make: 'Lamborghini', model: 'Huracán', categoryKey: 'coupe' },
  { make: 'Toyota', model: 'RAV4', categoryKey: 'suv' },
  { make: 'Toyota', model: 'Camry', categoryKey: 'sedan' },
  { make: 'Toyota', model: 'Corolla', categoryKey: 'sedan' },
  { make: 'Toyota', model: 'Tacoma', categoryKey: 'pickup_crew' },
  { make: 'Toyota', model: 'Tundra', categoryKey: 'pickup_crew' },
  { make: 'Toyota', model: '4Runner', categoryKey: 'suv' },
  { make: 'Toyota', model: 'Highlander', categoryKey: 'large_suv' },
  { make: 'Toyota', model: 'Sienna', categoryKey: 'large_suv' },
  { make: 'Toyota', model: 'GR86', categoryKey: 'coupe' },
  { make: 'Honda', model: 'Civic', categoryKey: 'sedan' },
  { make: 'Honda', model: 'Accord', categoryKey: 'sedan' },
  { make: 'Honda', model: 'CR-V', categoryKey: 'suv' },
  { make: 'Honda', model: 'Pilot', categoryKey: 'large_suv' },
  { make: 'Honda', model: 'Odyssey', categoryKey: 'large_suv' },
  { make: 'Ford', model: 'F-150', categoryKey: 'pickup_crew' },
  { make: 'Ford', model: 'F-150 Regular Cab', categoryKey: 'pickup_single' },
  { make: 'Ford', model: 'Mustang', categoryKey: 'coupe' },
  { make: 'Ford', model: 'Bronco', categoryKey: 'suv' },
  { make: 'Ford', model: 'Explorer', categoryKey: 'large_suv' },
  { make: 'Ford', model: 'Expedition', categoryKey: 'large_suv' },
  { make: 'Chevrolet', model: 'Silverado 1500', categoryKey: 'pickup_crew' },
  { make: 'Chevrolet', model: 'Tahoe', categoryKey: 'large_suv' },
  { make: 'Chevrolet', model: 'Suburban', categoryKey: 'large_suv' },
  { make: 'Chevrolet', model: 'Camaro', categoryKey: 'coupe' },
  { make: 'Chevrolet', model: 'Corvette', categoryKey: 'coupe' },
  { make: 'Tesla', model: 'Model 3', categoryKey: 'sedan' },
  { make: 'Tesla', model: 'Model Y', categoryKey: 'suv' },
  { make: 'Tesla', model: 'Model S', categoryKey: 'sedan' },
  { make: 'Tesla', model: 'Model X', categoryKey: 'large_suv' },
  { make: 'Tesla', model: 'Cybertruck', categoryKey: 'pickup_crew' },
  { make: 'BMW', model: '3 Series', categoryKey: 'sedan' },
  { make: 'BMW', model: '4 Series', categoryKey: 'coupe' },
  { make: 'BMW', model: 'X3', categoryKey: 'suv' },
  { make: 'BMW', model: 'X5', categoryKey: 'suv' },
  { make: 'BMW', model: 'X7', categoryKey: 'large_suv' },
  { make: 'Porsche', model: '911', categoryKey: 'coupe' },
  { make: 'Porsche', model: 'Macan', categoryKey: 'suv' },
  { make: 'Porsche', model: 'Cayenne', categoryKey: 'suv' },
  { make: 'Ram', model: '1500', categoryKey: 'pickup_crew' },
  { make: 'GMC', model: 'Sierra 1500', categoryKey: 'pickup_crew' },
  { make: 'GMC', model: 'Yukon', categoryKey: 'large_suv' },
  { make: 'Jeep', model: 'Wrangler', categoryKey: 'suv' },
  { make: 'Jeep', model: 'Grand Cherokee', categoryKey: 'suv' },
  { make: 'Lexus', model: 'RX', categoryKey: 'suv' },
  { make: 'Lexus', model: 'ES', categoryKey: 'sedan' },
  { make: 'Mercedes-Benz', model: 'C-Class', categoryKey: 'sedan' },
  { make: 'Mercedes-Benz', model: 'GLE', categoryKey: 'suv' },
  { make: 'Audi', model: 'Q5', categoryKey: 'suv' },
  { make: 'Audi', model: 'A4', categoryKey: 'sedan' },
  { make: 'Subaru', model: 'Outback', categoryKey: 'suv' },
  { make: 'Hyundai', model: 'Tucson', categoryKey: 'suv' },
  { make: 'Kia', model: 'Telluride', categoryKey: 'large_suv' },
  { make: 'Rivian', model: 'R1S', categoryKey: 'large_suv' },
  { make: 'Rivian', model: 'R1T', categoryKey: 'pickup_crew' },
];

export function inferCategoryFromModelName(model: string): SilhouetteKey {
  const lower = model.toLowerCase();
  const exact = POPULAR_VEHICLES.find((v) => v.model.toLowerCase() === lower);
  if (exact) return exact.categoryKey;

  if (/(suburban|tahoe|expedition|yukon|escalade|sienna|odyssey|pacifica|carnival|telluride|palisade|pilot|highlander|explorer|sequoia|armada|wagoneer|r1s|model x|x7|gls)/i.test(lower)) {
    return 'large_suv';
  }
  if (/(regular cab|single cab)/i.test(lower)) {
    return 'pickup_single';
  }
  if (/(f-150|f-250|f-350|silverado|sierra|ram|tacoma|tundra|ranger|colorado|canyon|frontier|gladiator|ridgeline|maverick|cybertruck|r1t|pickup|truck)/i.test(lower)) {
    return 'pickup_crew';
  }
  if (/(mustang|camaro|corvette|911|718|cayman|challenger|supra|gr86|brz|miata|mx-5|z4|coupe|2-door|gt-r|370z|400z)/i.test(lower)) {
    return 'coupe';
  }
  if (/(rav4|cr-v|crv|cx-5|cx-50|cx-90|rogue|tucson|sportage|forester|outback|crosstrek|bronco|wrangler|cherokee|model y|macan|cayenne|x3|x5|q5|q7|gle|glc|rx|nx|gx|rdx|mdx|escape|equinox|blazer|traverse|4runner|suv)/i.test(lower)) {
    return 'suv';
  }
  return 'sedan';
}
