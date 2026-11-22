export type Locale = 'en' | 'es';

export type SilhouetteKey =
  | 'coupe'
  | 'sedan'
  | 'suv'
  | 'large_suv'
  | 'pickup_single'
  | 'pickup_crew';

export type WindowZone = 'front' | 'rear' | 'back' | 'windshield' | 'sunroof';

export type FilmTier = 'good' | 'better' | 'best' | 'ultimate';

export type ServiceType = 'main' | 'addon' | 'removal' | 'a_la_carte';

export type LocationStatus = 'active' | 'coming_soon';

export type DepositType = 'fixed' | 'percentage';

export type WindshieldRule = 'clear_only' | 'standard' | 'none';

export type WaitType = 'drop_off' | 'wait';

export interface BusinessDayHours {
  open: string; // "09:00"
  close: string; // "18:00"
}

export type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export type BusinessHours = Record<DayKey, BusinessDayHours | null>;

export interface Location {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  stateCode: string;
  address: string;
  zipPrefixes: string[];
  timezone: string;
  phone: string;
  status: LocationStatus;
  depositType: DepositType;
  depositValue: number; // cents if fixed, integer % if percentage
  onlineAddonDiscount: number; // e.g., 0.10
  frontMinVlt: number;
  windshieldRule: WindshieldRule;
  disallowMetallic: boolean;
  medicalExemptionEnabled: boolean;
  businessHours: BusinessHours;
  bays: number;
  openingDiscountCode?: string | null;
}

export interface VehicleCategory {
  id: string;
  key: SilhouetteKey;
  nameEn: string;
  nameEs: string;
  silhouetteKey: SilhouetteKey;
  sortOrder: number;
}

export interface VehicleSelection {
  year: number | null;
  make: string;
  model: string;
  categoryKey: SilhouetteKey;
  isManualBodyType?: boolean;
}

export interface Film {
  id: string;
  tier: FilmTier;
  name: string;
  brand: string;
  descriptionEn: string;
  descriptionEs: string;
  tser: number;
  irRejection: number;
  uvRejection: number;
  warrantyEn: string;
  warrantyEs: string;
  shades: number[];
  isMetallic: boolean;
  isClearWindshieldSafe: boolean;
  sortOrder: number;
  isPopular: boolean;
  active: boolean;
}

export interface Service {
  id: string;
  key: string;
  businessLine: 'auto_tint' | 'ppf' | 'wraps' | 'ceramic' | 'detail';
  nameEn: string;
  nameEs: string;
  descriptionEn?: string | null;
  descriptionEs?: string | null;
  type: ServiceType;
  durationMin: number;
  zones: WindowZone[];
  sortOrder: number;
  active: boolean;
}

export interface PriceMatrixEntry {
  locationId: string;
  categoryKey: SilhouetteKey;
  serviceKey: string;
  filmTier: FilmTier;
  priceCents: number | null; // null = unavailable
}

export interface FixedPriceEntry {
  locationId: string;
  serviceKey: string;
  priceCents: number;
}

export interface Promo {
  code: string;
  type: 'fixed' | 'percentage';
  value: number; // cents or %
  validFrom?: string | null;
  validTo?: string | null;
  active: boolean;
}

export interface PricingCatalog {
  locations: Location[];
  categories: VehicleCategory[];
  films: Film[];
  services: Service[];
  priceMatrix: PriceMatrixEntry[];
  fixedPrices: FixedPriceEntry[];
  promos: Promo[];
}

export interface AddonSelection {
  serviceKey: string;
  filmTier?: FilmTier;
  shade?: number;
}

export interface QuoteInput {
  locationId: string;
  categoryKey: SilhouetteKey;
  mainServiceKey: string;
  mainFilmTier: FilmTier;
  frontShade?: number | null;
  rearShade?: number | null;
  addons: AddonSelection[];
  removals: string[]; // service keys
  promoCode?: string | null;
  manualDiscountCents?: number;
  source: 'web' | 'shop';
  hasMedicalExemption?: boolean;
}

export interface CalculatedLine {
  serviceKey: string;
  serviceType: ServiceType;
  nameEn: string;
  nameEs: string;
  filmTier?: FilmTier;
  filmName?: string;
  frontShade?: number | null;
  rearShade?: number | null;
  shade?: number | null;
  basePriceCents: number;
  discountCents: number;
  finalPriceCents: number;
  durationMin: number;
}

export interface QuoteCalculationResult {
  valid: boolean;
  errors: string[];
  lines: CalculatedLine[];
  subtotalCents: number;
  onlineAddonDiscountCents: number;
  promoDiscountCents: number;
  manualDiscountCents: number;
  totalDiscountCents: number;
  totalCents: number;
  depositCents: number;
  balanceCents: number;
  durationMin: number;
}
