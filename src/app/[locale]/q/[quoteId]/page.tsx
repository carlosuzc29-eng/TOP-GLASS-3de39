import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { localStore } from '@/lib/local-store';
import { formatCents } from '@/lib/pricing';
import { createServiceRoleClient, getPricingCatalog } from '@/lib/supabase/server';
import type { CalculatedLine, Locale, VehicleSelection } from '@/types/domain';

export default async function SharedQuotePage({
  params,
}: {
  params: Promise<{ locale: string; quoteId: string }>;
}) {
  const { locale, quoteId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('sharedQuote');
  const tQuote = await getTranslations('quote');
  const catalog = await getPricingCatalog();

  let vehicle: VehicleSelection | null = null;
  let lines: CalculatedLine[] = [];
  let totalCents = 0;
  let depositCents = 5000;
  let locationId = 'loc-princeton-tx';

  const supabase = createServiceRoleClient();
  if (supabase) {
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .eq('short_code', quoteId)
      .maybeSingle();

    if (!data) notFound();
    vehicle = data.vehicle as VehicleSelection;
    lines = (data.lines as CalculatedLine[]) ?? [];
    totalCents = data.total_cents;
    depositCents = data.deposit_cents;
    locationId = data.location_id;

    if (data.status === 'sent') {
      await supabase.from('quotes').update({ status: 'viewed' }).eq('id', data.id);
    }
  } else {
    const stored = localStore.getQuoteByCode(quoteId);
    if (!stored) notFound();
    vehicle = stored.vehicle;
    lines = stored.lines;
    totalCents = stored.totalCents;
    depositCents = stored.depositCents;
    locationId = stored.locationId;
  }

  const location = catalog.locations.find((l) => l.id === locationId);
  const vehicleLabel = vehicle
    ? [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')
    : '';

  const qs = new URLSearchParams();
  qs.set('loc', locationId);
  if (vehicle) {
    if (vehicle.year) qs.set('yr', String(vehicle.year));
    qs.set('mk', vehicle.make);
    qs.set('md', vehicle.model);
    qs.set('cat', vehicle.categoryKey);
  }

  return (
    <div className="bg-[var(--color-marble-gray)] py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <p className="text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
          {t('eyebrow')} · {quoteId}
        </p>
        <h1 className="mt-2 font-display text-5xl font-normal text-[var(--color-carbony-black)] uppercase">
          {t('title')}
        </h1>
        <p className="font-body mt-2 text-sm text-[var(--color-anvil)]">{t('subtitle')}</p>

        <div className="mt-8 border border-[var(--color-graphite-border)] bg-[var(--color-carbony-black)] p-8 text-white">
          <div className="flex items-center justify-between border-b border-[var(--color-graphite-border)] pb-4">
            <div>
              <p className="font-display text-2xl font-normal uppercase">{vehicleLabel}</p>
              <p className="text-xs text-[var(--color-ash-border)] uppercase">{location?.name}</p>
            </div>
            <span className="text-xs text-[var(--color-giallo-vivo)] uppercase">{quoteId}</span>
          </div>

          <ul className="divide-y divide-[var(--color-graphite-border)] py-2">
            {lines.map((line) => (
              <li key={line.serviceKey} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="uppercase">
                    {(locale as Locale) === 'es' ? line.nameEs : line.nameEn}
                  </p>
                  {line.filmName && (
                    <p className="text-xs text-[var(--color-ash-border)] uppercase">
                      {line.filmName}
                    </p>
                  )}
                </div>
                <span className="tabular-nums">{formatCents(line.finalPriceCents, locale)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1.5 border-t border-[var(--color-graphite-border)] pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm uppercase">{tQuote('ticketTotal')}</span>
              <span className="font-display text-4xl font-normal tabular-nums">
                {formatCents(totalCents, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-[var(--color-giallo-vivo)] uppercase">
              <span>{tQuote('ticketDueToday')}</span>
              <span className="tabular-nums">{formatCents(depositCents, locale)}</span>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href={`/quote?${qs.toString()}`}
              className="inline-flex h-14 w-full items-center justify-center gap-2 bg-[var(--color-giallo-vivo)] px-6 text-sm tracking-[0.023em] text-[var(--color-pure-black)] uppercase hover:bg-[var(--color-giallo-ombra)] hover:text-white"
            >
              <span>{t('bookThisQuote', { deposit: formatCents(depositCents, locale) })}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
