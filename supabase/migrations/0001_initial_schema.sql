-- Top Glass Window Tint — Initial Schema & Row Level Security
-- Run via Supabase CLI or SQL Editor

create extension if not exists "pgcrypto";

-- 1. Staff users (admin panel access)
create table if not exists public.staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'staff' check (role in ('owner', 'manager', 'staff')),
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.staff_users where user_id = auth.uid()
  );
$$;

-- 2. Locations
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text not null,
  state text not null,
  state_code text not null,
  address text not null,
  zip_prefixes text[] not null default '{}',
  timezone text not null,
  phone text not null,
  status text not null default 'active' check (status in ('active', 'coming_soon')),
  deposit_type text not null default 'fixed' check (deposit_type in ('fixed', 'percentage')),
  deposit_value integer not null default 5000, -- cents if fixed, integer % if percentage
  online_addon_discount numeric(5,4) not null default 0.1000,
  front_min_vlt integer not null default 25,
  windshield_rule text not null default 'clear_only' check (windshield_rule in ('clear_only', 'standard', 'none')),
  disallow_metallic boolean not null default false,
  medical_exemption_enabled boolean not null default false,
  business_hours jsonb not null default '{}'::jsonb,
  bays integer not null default 2,
  opening_discount_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Vehicle categories
create table if not exists public.vehicle_categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name_en text not null,
  name_es text not null,
  silhouette_key text not null check (silhouette_key in ('coupe', 'sedan', 'suv', 'large_suv', 'pickup_single', 'pickup_crew')),
  sort_order integer not null default 0
);

-- 4. Vehicle models (override or cached mappings)
create table if not exists public.vehicle_models (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  year_from integer not null default 1990,
  year_to integer not null default 2030,
  category_id uuid not null references public.vehicle_categories(id) on delete restrict,
  unique (make, model, year_from, year_to)
);

-- 5. NHTSA vPIC Cache
create table if not exists public.nhtsa_cache (
  cache_key text primary key,
  payload jsonb not null,
  expires_at timestamptz not null
);

-- 6. Films
create table if not exists public.films (
  id uuid primary key default gen_random_uuid(),
  tier text not null unique check (tier in ('good', 'better', 'best', 'ultimate')),
  name text not null,
  brand text not null,
  description_en text not null,
  description_es text not null,
  tser integer not null,
  ir_rejection integer not null,
  uv_rejection integer not null default 99,
  warranty_en text not null,
  warranty_es text not null,
  shades integer[] not null,
  is_metallic boolean not null default false,
  is_clear_windshield_safe boolean not null default false,
  sort_order integer not null default 0,
  is_popular boolean not null default false,
  active boolean not null default true
);

-- 7. Services
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  business_line text not null default 'auto_tint' check (business_line in ('auto_tint', 'ppf', 'wraps', 'ceramic', 'detail')),
  name_en text not null,
  name_es text not null,
  description_en text,
  description_es text,
  type text not null check (type in ('main', 'addon', 'removal', 'a_la_carte')),
  duration_min integer not null default 30,
  zones text[] not null default '{}',
  sort_order integer not null default 0,
  active boolean not null default true
);

-- 8. Price matrix (null price_cents = unavailable combination)
create table if not exists public.price_matrix (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  category_id uuid not null references public.vehicle_categories(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  film_id uuid not null references public.films(id) on delete cascade,
  price_cents integer,
  unique (location_id, category_id, service_id, film_id)
);

-- 9. Fixed prices (removals, etc.)
create table if not exists public.fixed_prices (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  price_cents integer not null,
  unique (location_id, service_id)
);

-- 10. Promos
create table if not exists public.promos (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('fixed', 'percentage')),
  value integer not null,
  valid_from timestamptz,
  valid_to timestamptz,
  active boolean not null default true
);

-- 11. Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

-- 12. Quotes
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  short_code text not null unique,
  location_id uuid not null references public.locations(id) on delete restrict,
  customer_id uuid references public.customers(id) on delete set null,
  vehicle jsonb not null,
  lines jsonb not null,
  medical_exemption boolean not null default false,
  subtotal_cents integer not null,
  discount_cents integer not null default 0,
  promo_code text,
  total_cents integer not null,
  deposit_cents integer not null,
  duration_min integer not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'viewed', 'booked', 'expired')),
  source text not null default 'web' check (source in ('web', 'shop')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 13. Appointments
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete restrict,
  location_id uuid not null references public.locations(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  wait_type text not null check (wait_type in ('drop_off', 'wait')),
  status text not null default 'pending_payment' check (status in ('pending_payment', 'confirmed', 'completed', 'cancelled', 'no_show')),
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  manage_token text not null unique,
  notes text,
  reminded_at timestamptz,
  warranty_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 14. Blocked slots
create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text
);

-- 15. Leads (abandoned quotes + waitlist)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  contact_email text,
  contact_phone text,
  quote_id uuid references public.quotes(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  last_step integer not null default 3,
  is_waitlist boolean not null default false,
  reminded_at timestamptz,
  waitlist_notified_at timestamptz,
  created_at timestamptz not null default now()
);

-- 16. Gallery items
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  make text not null,
  model text not null,
  year integer not null,
  film_id uuid references public.films(id) on delete set null,
  front_shade integer,
  rear_shade integer,
  before_image_url text,
  after_image_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- 17. Analytics events (internal funnel dashboard)
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_name text not null,
  location_id uuid references public.locations(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_price_matrix_lookup on public.price_matrix (location_id, category_id, service_id);
create index if not exists idx_appointments_location_time on public.appointments (location_id, starts_at, ends_at);
create index if not exists idx_quotes_short_code on public.quotes (short_code);
create index if not exists idx_leads_reminder on public.leads (reminded_at, created_at);

-- Enable Row Level Security
alter table public.staff_users enable row level security;
alter table public.locations enable row level security;
alter table public.vehicle_categories enable row level security;
alter table public.vehicle_models enable row level security;
alter table public.nhtsa_cache enable row level security;
alter table public.films enable row level security;
alter table public.services enable row level security;
alter table public.price_matrix enable row level security;
alter table public.fixed_prices enable row level security;
alter table public.promos enable row level security;
alter table public.customers enable row level security;
alter table public.quotes enable row level security;
alter table public.appointments enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.leads enable row level security;
alter table public.gallery_items enable row level security;
alter table public.analytics_events enable row level security;

-- Public read-only catalog policies
create policy "Public read locations" on public.locations for select using (true);
create policy "Public read vehicle_categories" on public.vehicle_categories for select using (true);
create policy "Public read vehicle_models" on public.vehicle_models for select using (true);
create policy "Public read active films" on public.films for select using (active = true);
create policy "Public read active services" on public.services for select using (active = true);
create policy "Public read price_matrix" on public.price_matrix for select using (true);
create policy "Public read fixed_prices" on public.fixed_prices for select using (true);
create policy "Public read gallery_items" on public.gallery_items for select using (true);

-- Staff full-access policies
create policy "Staff manage locations" on public.locations for all using (public.is_staff());
create policy "Staff manage vehicle_categories" on public.vehicle_categories for all using (public.is_staff());
create policy "Staff manage vehicle_models" on public.vehicle_models for all using (public.is_staff());
create policy "Staff manage films" on public.films for all using (public.is_staff());
create policy "Staff manage services" on public.services for all using (public.is_staff());
create policy "Staff manage price_matrix" on public.price_matrix for all using (public.is_staff());
create policy "Staff manage fixed_prices" on public.fixed_prices for all using (public.is_staff());
create policy "Staff manage promos" on public.promos for all using (public.is_staff());
create policy "Staff manage customers" on public.customers for all using (public.is_staff());
create policy "Staff manage quotes" on public.quotes for all using (public.is_staff());
create policy "Staff manage appointments" on public.appointments for all using (public.is_staff());
create policy "Staff manage blocked_slots" on public.blocked_slots for all using (public.is_staff());
create policy "Staff manage leads" on public.leads for all using (public.is_staff());
create policy "Staff manage gallery_items" on public.gallery_items for all using (public.is_staff());
create policy "Staff manage analytics_events" on public.analytics_events for all using (public.is_staff());
create policy "Staff read self" on public.staff_users for select using (auth.uid() = user_id);
