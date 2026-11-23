import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AppointmentManager } from '@/components/appointment/AppointmentManager';
import { localStore } from '@/lib/local-store';
import { createServiceRoleClient, getPricingCatalog } from '@/lib/supabase/server';

export default async function MyAppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { locale, token } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const catalog = await getPricingCatalog();
  const supabase = createServiceRoleClient();

  let status = 'confirmed';
  let startsAt = new Date().toISOString();
  let waitType = 'drop_off';
  let customerName = '';
  let vehicleLabel = (await getTranslations('appointment'))('defaultVehicle');
  let locationId = 'loc-princeton-tx';
  let totalCents = 0;
  let depositCents = 5000;

  if (supabase) {
    const { data: appt } = await supabase
      .from('appointments')
      .select('*, customers(*), quotes(*)')
      .eq('manage_token', token)
      .maybeSingle();

    if (!appt) notFound();
    status = appt.status;
    startsAt = appt.starts_at;
    waitType = appt.wait_type;
    customerName = appt.customers?.name ?? '';
    locationId = appt.location_id;
    totalCents = appt.quotes?.total_cents ?? 0;
    depositCents = appt.quotes?.deposit_cents ?? 5000;
    const v = appt.quotes?.vehicle;
    if (v) {
      vehicleLabel = [v.year, v.make, v.model].filter(Boolean).join(' ');
    }
  } else {
    const appt = localStore.getAppointmentByToken(token);
    if (!appt) notFound();
    const quote = localStore.getQuoteByCode(appt.shortCode);
    status = appt.status;
    startsAt = appt.startsAt;
    waitType = appt.waitType;
    customerName = appt.customerName;
    locationId = appt.locationId;
    totalCents = quote?.totalCents ?? 0;
    depositCents = quote?.depositCents ?? 5000;
    if (quote?.vehicle) {
      vehicleLabel = [quote.vehicle.year, quote.vehicle.make, quote.vehicle.model]
        .filter(Boolean)
        .join(' ');
    }
  }

  const location = catalog.locations.find((l) => l.id === locationId) ?? catalog.locations[0]!;

  return (
    <AppointmentManager
      token={token}
      confirmedBanner={sp.confirmed === '1'}
      locale={locale}
      initialStatus={status}
      startsAt={startsAt}
      waitType={waitType}
      customerName={customerName}
      vehicleLabel={vehicleLabel}
      locationName={location.name}
      locationAddress={location.address}
      totalCents={totalCents}
      depositCents={depositCents}
    />
  );
}
