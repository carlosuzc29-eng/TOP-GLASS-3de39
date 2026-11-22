-- Seed data for Top Glass Window Tint
-- Temporary placeholder values marked as editable via /admin/pricing and /admin/locations

-- Locations
insert into public.locations (
  slug, name, city, state, state_code, address, zip_prefixes, timezone, phone,
  status, deposit_type, deposit_value, online_addon_discount,
  front_min_vlt, windshield_rule, disallow_metallic, medical_exemption_enabled,
  business_hours, bays, opening_discount_code
) values
(
  'princeton-tx',
  'Princeton, TX',
  'Princeton',
  'Texas',
  'TX',
  'TODO(content): 123 Main St, Princeton, TX 75407',
  array['754', '750', '751', '752'],
  'America/Chicago',
  '(469) 555-0194',
  'active',
  'fixed',
  5000,
  0.10,
  25,
  'clear_only',
  false,
  true,
  '{"mon":{"open":"09:00","close":"18:00"},"tue":{"open":"09:00","close":"18:00"},"wed":{"open":"09:00","close":"18:00"},"thu":{"open":"09:00","close":"18:00"},"fri":{"open":"09:00","close":"18:00"},"sat":{"open":"09:00","close":"16:00"},"sun":null}'::jsonb,
  2,
  null
),
(
  'salt-lake-city-ut',
  'Salt Lake City, UT',
  'Salt Lake City',
  'Utah',
  'UT',
  'TODO(content): Opening Soon — Salt Lake City, UT 84101',
  array['840', '841', '844'],
  'America/Denver',
  '(801) 555-0182',
  'coming_soon',
  'fixed',
  5000,
  0.10,
  35,
  'clear_only',
  true,
  false,
  '{"mon":{"open":"09:00","close":"18:00"},"tue":{"open":"09:00","close":"18:00"},"wed":{"open":"09:00","close":"18:00"},"thu":{"open":"09:00","close":"18:00"},"fri":{"open":"09:00","close":"18:00"},"sat":{"open":"09:00","close":"16:00"},"sun":null}'::jsonb,
  2,
  'SLCOPEN15'
)
on conflict (slug) do nothing;

-- Vehicle categories
insert into public.vehicle_categories (key, name_en, name_es, silhouette_key, sort_order) values
  ('coupe', 'Coupe (2-Door)', 'Coupé (2 puertas)', 'coupe', 1),
  ('sedan', 'Sedan (4-Door)', 'Sedán (4 puertas)', 'sedan', 2),
  ('suv', 'SUV / Crossover', 'SUV / Crossover', 'suv', 3),
  ('large_suv', 'Large SUV / Minivan', 'SUV Grande / Minivan', 'large_suv', 4),
  ('pickup_single', 'Single Cab Pickup', 'Pickup Cabina Sencilla', 'pickup_single', 5),
  ('pickup_crew', 'Crew Cab Pickup', 'Pickup Doble Cabina', 'pickup_crew', 6)
on conflict (key) do nothing;

-- Films (Good / Better / Best / Ultimate)
insert into public.films (
  tier, name, brand, description_en, description_es,
  tser, ir_rejection, uv_rejection, warranty_en, warranty_es,
  shades, is_metallic, is_clear_windshield_safe, sort_order, is_popular, active
) values
(
  'good',
  'Carbon Matte',
  'Top Glass Series',
  'Color-stable carbon film for crisp privacy, glare reduction, and zero signal interference.',
  'Lámina de carbono de color estable para privacidad nítida, menor reflejo y cero interferencia de señal.',
  44, 52, 99,
  'Lifetime limited warranty against bubbling, peeling, and fading',
  'Garantía limitada de por vida contra burbujas, desprendimiento y decoloración',
  array[56, 40, 33, 22, 15, 5],
  false, false, 1, false, true
),
(
  'better',
  'Nano Ceramic',
  'Top Glass Series',
  'Balanced ceramic heat rejection that noticeably cools the cabin without darkening your view.',
  'Rechazo térmico cerámico equilibrado que enfría la cabina notablemente sin oscurecer tu visibilidad.',
  56, 78, 99,
  'Lifetime nationwide warranty covering fading, bubbling, and delamination',
  'Garantía de por vida que cubre decoloración, burbujas y delaminación',
  array[70, 56, 40, 33, 22, 15, 5],
  false, true, 2, false, true
),
(
  'best',
  'Ceramic Pro',
  'Top Glass Series',
  'Multi-layer nano-ceramic engineered for Texas summer heat. High infrared rejection with optical clarity.',
  'Nanocerámica multicapa diseñada para el calor extremo de Texas. Alto rechazo infrarrojo con claridad óptica.',
  63, 88, 99,
  'Lifetime transferable warranty including glass-break replacement credit',
  'Garantía de por vida transferible con crédito de reposición por rotura de vidrio',
  array[70, 56, 40, 33, 22, 15, 5],
  false, true, 3, true, true
),
(
  'ultimate',
  'Ceramic IR Max',
  'Top Glass Series',
  'Maximum infrared and solar energy rejection available. Built for flagship comfort and interior preservation.',
  'Máximo rechazo infrarrojo y de energía solar disponible. Diseñada para confort superior y cuidado del interior.',
  71, 96, 99,
  'Lifetime premier warranty with priority service and no-fade guarantee',
  'Garantía premier de por vida con atención prioritaria y cobertura total',
  array[70, 56, 40, 33, 22, 15, 5],
  false, true, 4, false, true
)
on conflict (tier) do nothing;

-- Services
insert into public.services (key, business_line, name_en, name_es, description_en, description_es, type, duration_min, zones, sort_order, active) values
  ('full_car', 'auto_tint', 'Full Car (Sides + Rear)', 'Auto Completo (Laterales + Trasero)', 'All side windows plus full rear windshield.', 'Todas las ventanas laterales más el vidrio trasero completo.', 'main', 90, array['front', 'rear', 'back'], 1, true),
  ('front_two', 'auto_tint', 'Front Two Doors Only', 'Solo Dos Puertas Delanteras', 'Match factory-tinted rear glass on SUVs and trucks.', 'Ideal para igualar el tono de fábrica en SUVs y pickups.', 'main', 40, array['front'], 2, true),
  ('full_windshield', 'auto_tint', 'Full Windshield', 'Parabrisas Completo', 'Clear UV/IR heat-shielding film across the entire front glass.', 'Lámina transparente UV/IR de protección térmica en todo el parabrisas.', 'addon', 45, array['windshield'], 3, true),
  ('sun_strip', 'auto_tint', 'Sun Strip (Brow)', 'Franja Solar (Visera)', 'Top glare-blocking visor strip along the upper windshield.', 'Franja superior antideslumbrante en la parte alta del parabrisas.', 'addon', 15, array['windshield'], 4, true),
  ('single_sunroof', 'auto_tint', 'Single Sunroof', 'Sunroof Simple', 'Overhead solar heat rejection for a standard sunroof panel.', 'Rechazo térmico superior para techo corredizo estándar.', 'addon', 30, array['sunroof'], 5, true),
  ('panoramic_roof', 'auto_tint', 'Full Panoramic Roof', 'Techo Panorámico Completo', 'Full coverage for dual-pane or panoramic glass roofs.', 'Cobertura total para techos de cristal panorámicos o dobles.', 'addon', 60, array['sunroof'], 6, true),
  ('removal_front', 'auto_tint', 'Old Tint Removal — Front Two', 'Retiro de Tinte Viejo — Delanteras', 'Safe adhesive and film removal on front doors.', 'Retiro seguro de lámina y adhesivo en puertas delanteras.', 'removal', 30, array['front'], 7, true),
  ('removal_full', 'auto_tint', 'Old Tint Removal — Full Car', 'Retiro de Tinte Viejo — Completo', 'Complete removal on all side windows and rear glass.', 'Retiro completo en laterales y vidrio trasero.', 'removal', 60, array['front', 'rear', 'back'], 8, true),
  ('removal_windshield', 'auto_tint', 'Old Tint Removal — Windshield', 'Retiro de Tinte Viejo — Parabrisas', 'Removal of existing full windshield film.', 'Retiro de lámina existente en parabrisas.', 'removal', 35, array['windshield'], 9, true),
  ('removal_sun_strip', 'auto_tint', 'Old Tint Removal — Sun Strip', 'Retiro de Tinte Viejo — Franja Solar', 'Removal of upper windshield visor strip.', 'Retiro de franja solar superior.', 'removal', 15, array['windshield'], 10, true),
  ('removal_rear', 'auto_tint', 'Old Tint Removal — Rear Glass', 'Retiro de Tinte Viejo — Vidrio Trasero', 'Careful defroster-safe rear glass film removal.', 'Retiro cuidadoso protegiendo el desempañador trasero.', 'removal', 40, array['back'], 11, true)
on conflict (key) do nothing;

-- Price Matrix & Fixed Prices seeded dynamically via function for both locations
do $$
declare
  loc record;
  cat record;
  mult numeric;
  f_good uuid;
  f_better uuid;
  f_best uuid;
  f_ult uuid;
  s_full uuid;
  s_front uuid;
  s_ws uuid;
  s_strip uuid;
  s_sun uuid;
  s_pano uuid;
  r_front uuid;
  r_full uuid;
  r_ws uuid;
  r_strip uuid;
  r_rear uuid;
begin
  select id into f_good from public.films where tier = 'good';
  select id into f_better from public.films where tier = 'better';
  select id into f_best from public.films where tier = 'best';
  select id into f_ult from public.films where tier = 'ultimate';

  select id into s_full from public.services where key = 'full_car';
  select id into s_front from public.services where key = 'front_two';
  select id into s_ws from public.services where key = 'full_windshield';
  select id into s_strip from public.services where key = 'sun_strip';
  select id into s_sun from public.services where key = 'single_sunroof';
  select id into s_pano from public.services where key = 'panoramic_roof';

  select id into r_front from public.services where key = 'removal_front';
  select id into r_full from public.services where key = 'removal_full';
  select id into r_ws from public.services where key = 'removal_windshield';
  select id into r_strip from public.services where key = 'removal_sun_strip';
  select id into r_rear from public.services where key = 'removal_rear';

  for loc in select id from public.locations loop
    -- Fixed prices (removals)
    insert into public.fixed_prices (location_id, service_id, price_cents) values
      (loc.id, r_front, 8500),
      (loc.id, r_full, 21500),
      (loc.id, r_ws, 11000),
      (loc.id, r_strip, 3000),
      (loc.id, r_rear, 11000)
    on conflict (location_id, service_id) do nothing;

    for cat in select id, key from public.vehicle_categories loop
      mult := case cat.key
        when 'coupe' then 0.85
        when 'sedan' then 0.90
        when 'suv' then 1.00
        when 'large_suv' then 1.15
        when 'pickup_single' then 0.80
        when 'pickup_crew' then 1.05
        else 1.00
      end;

      -- Helper rounding to nearest $5 (500 cents)
      insert into public.price_matrix (location_id, category_id, service_id, film_id, price_cents) values
        -- Full car
        (loc.id, cat.id, s_full, f_good,   (round((375 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_full, f_better, (round((515 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_full, f_best,   (round((675 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_full, f_ult,    (round((835 * mult) / 5.0) * 500)::int),
        -- Front two doors
        (loc.id, cat.id, s_front, f_good,   (round((175 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_front, f_better, (round((205 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_front, f_best,   (round((240 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_front, f_ult,    (round((300 * mult) / 5.0) * 500)::int),
        -- Full windshield
        (loc.id, cat.id, s_ws, f_good,   (round((210 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_ws, f_better, (round((265 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_ws, f_best,   (round((375 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_ws, f_ult,    (round((425 * mult) / 5.0) * 500)::int),
        -- Sun strip (only good tier priced, others null)
        (loc.id, cat.id, s_strip, f_good,   (round((65 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_strip, f_better, null),
        (loc.id, cat.id, s_strip, f_best,   null),
        (loc.id, cat.id, s_strip, f_ult,    null),
        -- Single sunroof
        (loc.id, cat.id, s_sun, f_good,   (round((130 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_sun, f_better, (round((160 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_sun, f_best,   (round((195 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_sun, f_ult,    (round((225 * mult) / 5.0) * 500)::int),
        -- Panoramic roof
        (loc.id, cat.id, s_pano, f_good,   (round((240 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_pano, f_better, (round((300 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_pano, f_best,   (round((365 * mult) / 5.0) * 500)::int),
        (loc.id, cat.id, s_pano, f_ult,    (round((430 * mult) / 5.0) * 500)::int)
      on conflict (location_id, category_id, service_id, film_id) do nothing;
    end loop;
  end loop;
end $$;

-- Sample promo
insert into public.promos (code, type, value, active) values
  ('SLCOPEN15', 'percentage', 15, true),
  ('WELCOME25', 'fixed', 2500, true)
on conflict (code) do nothing;
