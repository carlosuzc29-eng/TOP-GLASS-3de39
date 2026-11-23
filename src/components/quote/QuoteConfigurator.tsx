'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { CarSilhouette } from '@/components/brand/CarSilhouette';
import { ShadeScaleBar } from '@/components/brand/ShadeScaleBar';
import { CompareFilmsModal } from '@/components/quote/CompareFilmsModal';
import { FilmSpecCard } from '@/components/quote/FilmSpecCard';
import { QuoteTicket } from '@/components/quote/QuoteTicket';
import { SaveQuoteModal } from '@/components/quote/SaveQuoteModal';
import { trackClientEvent } from '@/lib/analytics/events';
import type { AvailableDay } from '@/lib/availability';
import {
  calculateQuote,
  formatCents,
  getFixedPriceCents,
  getMatrixPriceCents,
  SHADE_STEPS,
  validateShadeCompliance,
} from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { useQuoteStore } from '@/store/quote-store';
import type {
  FilmTier,
  Locale,
  PricingCatalog,
  QuoteInput,
  SilhouetteKey,
  WindowZone,
} from '@/types/domain';

interface QuoteConfiguratorProps {
  catalog: PricingCatalog;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR + 1 - 1990 + 1 }, (_, i) => CURRENT_YEAR + 1 - i);

export function QuoteConfigurator({ catalog }: QuoteConfiguratorProps) {
  const t = useTranslations('quote');
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');
  const tBrand = useTranslations('brand');
  const locale = useLocale() as Locale;
  const searchParams = useSearchParams();

  const store = useQuoteStore();

  // Local UI state
  const [zipInput, setZipInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ year: number | null; make: string; model: string; categoryKey: SilhouetteKey }>
  >([]);
  const [manualBodyMode, setManualBodyMode] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [makes, setMakes] = useState<string[]>([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [models, setModels] = useState<Array<{ model: string; categoryKey: SilhouetteKey }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const [compareOpen, setCompareOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [availabilityDays, setAvailabilityDays] = useState<AvailableDay[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [waitlistSuccess, setWaitlistSuccess] = useState<{
    quoteUrl: string;
    code: string;
  } | null>(null);

  useEffect(() => {
    if (searchParams.size > 0) {
      store.hydrateFromQueryParams(new URLSearchParams(searchParams.toString()));
    }
    fetch('/api/vehicles?action=makes')
      .then((r) => r.json())
      .then((d) => setMakes(d.makes ?? []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const qs = store.toQueryString();
    const nextUrl = `${window.location.pathname}?${qs}`;
    window.history.replaceState(null, '', nextUrl);
  }, [
    store.locationId,
    store.vehicle,
    store.mainServiceKey,
    store.mainFilmTier,
    store.frontShade,
    store.rearShade,
    store.addons,
    store.removals,
    store,
  ]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const ctrl = new AbortController();
    fetch(`/api/vehicles?action=search&q=${encodeURIComponent(searchQuery)}`, {
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((d) => setSearchResults(d.results ?? []))
      .catch(() => {});
    return () => ctrl.abort();
  }, [searchQuery]);

  useEffect(() => {
    if (!selectedMake) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    fetch(
      `/api/vehicles?action=models&make=${encodeURIComponent(selectedMake)}&year=${selectedYear}`,
    )
      .then((r) => r.json())
      .then((d) => setModels(d.models ?? []))
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false));
  }, [selectedMake, selectedYear]);

  const activeLocation = useMemo(
    () => catalog.locations.find((l) => l.id === store.locationId) ?? catalog.locations[0]!,
    [catalog.locations, store.locationId],
  );

  const mainServices = useMemo(
    () => catalog.services.filter((s) => s.type === 'main' && s.active),
    [catalog.services],
  );
  const addonServices = useMemo(
    () => catalog.services.filter((s) => s.type === 'addon' && s.active),
    [catalog.services],
  );
  const removalServices = useMemo(
    () => catalog.services.filter((s) => s.type === 'removal' && s.active),
    [catalog.services],
  );

  const selectedFilm = useMemo(
    () => catalog.films.find((f) => f.tier === store.mainFilmTier) ?? null,
    [catalog.films, store.mainFilmTier],
  );

  const quoteInput: QuoteInput | null = useMemo(() => {
    if (!store.vehicle || !store.mainFilmTier) return null;
    return {
      locationId: activeLocation.id,
      categoryKey: store.vehicle.categoryKey,
      mainServiceKey: store.mainServiceKey,
      mainFilmTier: store.mainFilmTier,
      frontShade: store.frontShade,
      rearShade: store.mainServiceKey === 'full_car' ? store.rearShade : null,
      addons: store.addons,
      removals: store.removals,
      source: 'web',
      hasMedicalExemption: store.hasMedicalExemption,
    };
  }, [
    activeLocation.id,
    store.vehicle,
    store.mainServiceKey,
    store.mainFilmTier,
    store.frontShade,
    store.rearShade,
    store.addons,
    store.removals,
    store.hasMedicalExemption,
  ]);

  const calculation = useMemo(() => {
    if (!quoteInput) return null;
    return calculateQuote(quoteInput, catalog);
  }, [quoteInput, catalog]);

  useEffect(() => {
    if (store.activeStep !== 6 || activeLocation.status !== 'active') return;
    const durationMin = calculation?.durationMin ?? 90;
    setLoadingSlots(true);
    fetch(
      `/api/availability?locationId=${encodeURIComponent(activeLocation.id)}&durationMin=${durationMin}&waitType=${store.waitType}`,
    )
      .then((r) => r.json())
      .then((d) => {
        const days = (d.days ?? []) as AvailableDay[];
        setAvailabilityDays(days);
        if (!store.selectedDate) {
          const firstWithSlots = days.find((day) => day.slots.length > 0);
          if (firstWithSlots) {
            store.setAppointmentSlot({
              date: firstWithSlots.date,
              startsAt: '',
              endsAt: '',
              label: '',
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.activeStep,
    activeLocation.id,
    activeLocation.status,
    calculation?.durationMin,
    store.waitType,
  ]);

  const highlightedZones: WindowZone[] = useMemo(() => {
    if (store.hoveredServiceKey) {
      const srv = catalog.services.find((s) => s.key === store.hoveredServiceKey);
      return srv?.zones ?? [];
    }
    return [];
  }, [store.hoveredServiceKey, catalog.services]);

  const windshieldAddon = store.addons.find((a) => a.serviceKey === 'full_windshield');
  const sunroofAddon = store.addons.find(
    (a) => a.serviceKey === 'single_sunroof' || a.serviceKey === 'panoramic_roof',
  );

  const blockedFrontShades: number[] = useMemo(() => {
    if (!selectedFilm) return [];
    return SHADE_STEPS.filter(
      (vlt) =>
        !validateShadeCompliance({
          location: activeLocation,
          zone: 'front',
          shade: vlt,
          film: selectedFilm,
          hasMedicalExemption: store.hasMedicalExemption,
        }).allowed,
    );
  }, [activeLocation, selectedFilm, store.hasMedicalExemption]);

  useEffect(() => {
    if (store.frontShade != null && blockedFrontShades.includes(store.frontShade)) {
      const legalShade = SHADE_STEPS.find(
        (s) => (selectedFilm?.shades.includes(s) ?? true) && !blockedFrontShades.includes(s),
      );
      if (legalShade) store.setFrontShade(legalShade);
    }
  }, [blockedFrontShades, selectedFilm, store]);

  const handleZipDetect = () => {
    const clean = zipInput.trim();
    if (clean.length < 3) return;
    const prefix = clean.slice(0, 3);
    const match = catalog.locations.find((l) => l.zipPrefixes.includes(prefix));
    if (match) store.setLocationId(match.id);
  };

  const handleShareQuote = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleContinueMobile = () => {
    store.unlockAndGoToStep(Math.min(8, store.activeStep + 1));
  };

  const handleCheckoutOrWaitlist = async () => {
    if (!store.vehicle || !quoteInput || !calculation?.valid) return;
    setCheckoutError(null);
    setSubmitting(true);

    try {
      if (activeLocation.status === 'coming_soon') {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: store.customer.email,
            phone: store.customer.phone,
            vehicle: store.vehicle,
            quoteInput,
            lastStep: 8,
            isWaitlist: true,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setCheckoutError(data.error || t('errorWaitlist'));
        } else {
          trackClientEvent('quote_saved', { waitlist: true, location: activeLocation.slug });
          setWaitlistSuccess({
            quoteUrl: data.quoteUrl,
            code: data.openingDiscountCode || 'SLCOPEN15',
          });
        }
        return;
      }

      if (!store.selectedSlotStartsAt || !store.selectedSlotEndsAt) {
        setCheckoutError(t('errorSelectSlot'));
        store.setActiveStep(6);
        return;
      }

      trackClientEvent('checkout_started', {
        value: calculation.totalCents / 100,
        currency: 'USD',
      });

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          vehicle: store.vehicle,
          quoteInput,
          appointment: {
            startsAt: store.selectedSlotStartsAt,
            endsAt: store.selectedSlotEndsAt,
            waitType: store.waitType,
          },
          customer: store.customer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || t('errorCheckout'));
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setCheckoutError(tCommon('networkError'));
    } finally {
      setSubmitting(false);
    }
  };

  const isSuvOrTruck =
    store.vehicle?.categoryKey === 'suv' ||
    store.vehicle?.categoryKey === 'large_suv' ||
    store.vehicle?.categoryKey === 'pickup_single' ||
    store.vehicle?.categoryKey === 'pickup_crew';

  const filmPricesByTier = useMemo(() => {
    if (!store.vehicle) return {};
    const out: Record<string, number | null> = {};
    for (const film of catalog.films) {
      out[film.tier] = getMatrixPriceCents(
        catalog,
        activeLocation.id,
        store.vehicle.categoryKey,
        store.mainServiceKey,
        film.tier,
      );
    }
    return out;
  }, [catalog, activeLocation.id, store.vehicle, store.mainServiceKey]);

  const customerValid =
    store.customer.name.trim().length >= 2 &&
    /^\+?[1-9]\d{9,14}$/.test(store.customer.phone.trim()) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.customer.email.trim()) &&
    store.customer.acceptDepositPolicy &&
    store.customer.acceptLaborPolicy;

  const selectedDayObj = availabilityDays.find((d) => d.date === store.selectedDate);

  return (
    <div className="bg-[var(--color-marble-gray)] pb-28 lg:pb-20">
      {/* Dark top stage header */}
      <div className="bg-[var(--color-carbony-black)] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
          <p className="text-xs tracking-[0.023em] text-[var(--color-ash-border)] uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="mt-2 font-display text-5xl leading-[0.95] font-normal uppercase sm:text-6xl">
            {t('title')}
          </h1>
          <p className="font-body mt-3 max-w-2xl text-sm text-[var(--color-ash-border)]">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-6 lg:px-10">
        {/* Mobile live tint stage at top */}
        <div className="mb-6 border border-[var(--color-graphite-border)] bg-[var(--color-carbon-deep)] p-4 lg:hidden">
          <CarSilhouette
            bodyType={store.vehicle?.categoryKey ?? 'suv'}
            frontShade={store.frontShade}
            rearShade={store.mainServiceKey === 'full_car' ? store.rearShade : null}
            windshieldShade={windshieldAddon?.shade ?? null}
            sunroofShade={sunroofAddon?.shade ?? null}
            highlightedZones={highlightedZones}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* LEFT COLUMN: Sequential Accordion Steps 0–8 */}
          <div className="space-y-4 lg:col-span-7">
            {/* STEP 0: Location */}
            <AccordionStep
              stepNumber={0}
              title={t('step0Title')}
              active={store.activeStep === 0}
              completed={store.maxUnlockedStep > 0}
              unlocked={true}
              summary={activeLocation.name}
              editLabel={t('edit')}
              onEdit={() => store.setActiveStep(0)}
            >
              <p className="font-body text-sm text-[var(--color-anvil)]">{t('step0Desc')}</p>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value)}
                  placeholder={t('zipPlaceholder')}
                  className="font-body h-11 flex-1 border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={handleZipDetect}
                  className="h-11 border border-[var(--color-carbony-black)] bg-[var(--color-pearl-white)] px-5 text-xs tracking-[0.023em] text-[var(--color-carbony-black)] uppercase hover:bg-[var(--color-carbony-black)] hover:text-white"
                >
                  {t('zipDetect')}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {catalog.locations.map((loc) => {
                  const selected = loc.id === activeLocation.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => store.setLocationId(loc.id)}
                      className={cn(
                        'flex flex-col items-start border p-4 text-left transition-colors',
                        selected
                          ? 'border-[var(--color-pure-black)] bg-[var(--color-marble-gray)] ring-1 ring-[var(--color-pure-black)]'
                          : 'border-[var(--color-ash-border)] bg-[var(--color-pearl-white)] hover:border-[var(--color-pure-black)]',
                      )}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-base tracking-[0.023em] text-[var(--color-carbony-black)] uppercase">
                          <MapPin className="h-4 w-4" />
                          {loc.name}
                        </span>
                        {loc.status === 'coming_soon' && (
                          <span className="bg-[var(--color-carbony-black)] px-2 py-0.5 text-[10px] text-[var(--color-giallo-vivo)] uppercase">
                            {tBrand('comingSoon')}
                          </span>
                        )}
                      </div>
                      <p className="font-body mt-1.5 text-xs text-[var(--color-steel-mid)]">
                        {loc.address}
                      </p>
                    </button>
                  );
                })}
              </div>

              {activeLocation.status === 'coming_soon' && (
                <div className="font-body mt-4 flex items-start gap-2 border border-[var(--color-carbony-black)] bg-[var(--color-marble-gray)] p-3 text-xs text-[var(--color-carbony-black)]">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{t('comingSoonNotice')}</span>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    trackClientEvent('quote_start', { location: activeLocation.slug });
                    store.unlockAndGoToStep(1);
                  }}
                  className="inline-flex h-12 items-center gap-2 bg-[var(--color-carbony-black)] px-6 text-xs tracking-[0.023em] text-white uppercase hover:bg-[var(--color-pure-black)]"
                >
                  <span>{t('continue')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </AccordionStep>

            {/* STEP 1: Your Vehicle */}
            <AccordionStep
              stepNumber={1}
              title={t('step1Title')}
              active={store.activeStep === 1}
              completed={Boolean(store.vehicle) && store.activeStep !== 1}
              unlocked={store.maxUnlockedStep >= 1}
              summary={
                store.vehicle
                  ? [store.vehicle.year, store.vehicle.make, store.vehicle.model]
                      .filter(Boolean)
                      .join(' ')
                  : undefined
              }
              editLabel={t('edit')}
              onEdit={() => store.setActiveStep(1)}
            >
              <p className="font-body text-sm text-[var(--color-anvil)]">{t('step1Desc')}</p>

              {!manualBodyMode ? (
                <div className="mt-4 space-y-5">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-[var(--color-steel-mid)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('searchPlaceholder')}
                      className="font-body h-11 w-full border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] pr-3 pl-10 text-sm"
                    />
                    {searchResults.length > 0 && (
                      <ul className="mt-1 max-h-56 divide-y divide-[var(--color-ash-border)] overflow-auto border border-[var(--color-carbony-black)] bg-[var(--color-pearl-white)]">
                        {searchResults.map((item) => (
                          <li key={`${item.make}-${item.model}`}>
                            <button
                              type="button"
                              onClick={() => {
                                const v = {
                                  year: item.year ?? selectedYear,
                                  make: item.make,
                                  model: item.model,
                                  categoryKey: item.categoryKey,
                                };
                                store.setVehicle(v);
                                setSearchQuery('');
                                setSearchResults([]);
                                trackClientEvent('vehicle_selected', {
                                  make: v.make,
                                  model: v.model,
                                  category: v.categoryKey,
                                });
                                store.unlockAndGoToStep(2);
                              }}
                              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-[var(--color-marble-gray)]"
                            >
                              <span className="uppercase text-[var(--color-carbony-black)]">
                                {item.year ? `${item.year} ` : ''}
                                {item.make} {item.model}
                              </span>
                              <span className="text-xs text-[var(--color-steel-mid)] uppercase">
                                {item.categoryKey.replace('_', ' ')}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs uppercase text-[var(--color-steel-mid)]">
                        {t('yearLabel')}
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="font-body h-11 w-full border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] px-3 text-sm"
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs uppercase text-[var(--color-steel-mid)]">
                        {t('makeLabel')}
                      </label>
                      <select
                        value={selectedMake}
                        onChange={(e) => setSelectedMake(e.target.value)}
                        className="font-body h-11 w-full border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] px-3 text-sm"
                      >
                        <option value="">{tCommon('select')}</option>
                        {makes.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs uppercase text-[var(--color-steel-mid)]">
                        {t('modelLabel')}
                      </label>
                      <select
                        disabled={!selectedMake || loadingModels}
                        value={store.vehicle?.model ?? ''}
                        onChange={(e) => {
                          const chosen = models.find((m) => m.model === e.target.value);
                          if (chosen) {
                            const v = {
                              year: selectedYear,
                              make: selectedMake,
                              model: chosen.model,
                              categoryKey: chosen.categoryKey,
                            };
                            store.setVehicle(v);
                            trackClientEvent('vehicle_selected', {
                              make: v.make,
                              model: v.model,
                              category: v.categoryKey,
                            });
                            store.unlockAndGoToStep(2);
                          }
                        }}
                        className="font-body h-11 w-full border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] px-3 text-sm disabled:opacity-50"
                      >
                        <option value="">{loadingModels ? tCommon('loading') : tCommon('select')}</option>
                        {models.map((m) => (
                          <option key={m.model} value={m.model}>
                            {m.model}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setManualBodyMode(true)}
                    className="text-xs tracking-[0.023em] text-[var(--color-carbony-black)] uppercase underline underline-offset-4 hover:text-[var(--color-giallo-ombra)]"
                  >
                    {t('cantFindCar')}
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {catalog.categories.map((cat) => {
                      const selected = store.vehicle?.categoryKey === cat.key;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            store.setVehicle({
                              year: null,
                              make: locale === 'es' ? cat.nameEs : cat.nameEn,
                              model: '',
                              categoryKey: cat.key,
                              isManualBodyType: true,
                            });
                            trackClientEvent('vehicle_selected', {
                              category: cat.key,
                              manual: true,
                            });
                            store.unlockAndGoToStep(2);
                          }}
                          className={cn(
                            'flex items-center gap-3 border p-3.5 text-left text-sm uppercase transition-colors',
                            selected
                              ? 'border-[var(--color-pure-black)] bg-[var(--color-marble-gray)]'
                              : 'border-[var(--color-ash-border)] bg-[var(--color-pearl-white)] hover:border-[var(--color-pure-black)]',
                          )}
                        >
                          <Car className="h-4 w-4" />
                          <span>{locale === 'es' ? cat.nameEs : cat.nameEn}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setManualBodyMode(false)}
                    className="text-xs tracking-[0.023em] uppercase underline underline-offset-4"
                  >
                    {t('backToSearch')}
                  </button>
                </div>
              )}
            </AccordionStep>

            {/* STEP 2: What to tint */}
            <AccordionStep
              stepNumber={2}
              title={t('step2Title')}
              active={store.activeStep === 2}
              completed={store.maxUnlockedStep >= 3 && store.activeStep !== 2}
              unlocked={store.maxUnlockedStep >= 2}
              summary={(() => {
                const s = mainServices.find((ms) => ms.key === store.mainServiceKey);
                return s ? (locale === 'es' ? s.nameEs : s.nameEn) : undefined;
              })()}
              editLabel={t('edit')}
              onEdit={() => store.setActiveStep(2)}
            >
              <p className="font-body text-sm text-[var(--color-anvil)]">{t('step2Desc')}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {mainServices.map((srv) => {
                  const selected = store.mainServiceKey === srv.key;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onMouseEnter={() => store.setHoveredServiceKey(srv.key)}
                      onMouseLeave={() => store.setHoveredServiceKey(null)}
                      onClick={() => {
                        store.setMainServiceKey(srv.key);
                        store.setHoveredServiceKey(null);
                        store.unlockAndGoToStep(3);
                      }}
                      className={cn(
                        'flex flex-col items-start border p-4 text-left transition-colors',
                        selected
                          ? 'border-[var(--color-pure-black)] bg-[var(--color-marble-gray)] ring-1 ring-[var(--color-pure-black)]'
                          : 'border-[var(--color-ash-border)] bg-[var(--color-pearl-white)] hover:border-[var(--color-pure-black)]',
                      )}
                    >
                      <span className="text-base uppercase text-[var(--color-carbony-black)]">
                        {locale === 'es' ? srv.nameEs : srv.nameEn}
                      </span>
                      <span className="font-body mt-1 text-xs text-[var(--color-steel-mid)]">
                        {locale === 'es' ? srv.descriptionEs : srv.descriptionEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </AccordionStep>

            {/* STEP 3: Your Film */}
            <AccordionStep
              stepNumber={3}
              title={t('step3Title')}
              active={store.activeStep === 3}
              completed={Boolean(store.mainFilmTier) && store.activeStep !== 3}
              unlocked={store.maxUnlockedStep >= 3}
              summary={selectedFilm ? selectedFilm.name : undefined}
              editLabel={t('edit')}
              onEdit={() => store.setActiveStep(3)}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-body text-sm text-[var(--color-anvil)]">{t('step3Desc')}</p>
                <button
                  type="button"
                  onClick={() => setCompareOpen(true)}
                  className="text-xs tracking-[0.023em] uppercase underline underline-offset-4 hover:text-[var(--color-giallo-ombra)]"
                >
                  {t('compare')}
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {catalog.films.map((film) => (
                  <FilmSpecCard
                    key={film.id}
                    film={film}
                    locale={locale}
                    priceCents={filmPricesByTier[film.tier]}
                    selected={store.mainFilmTier === film.tier}
                    mostChosenLabel={tHome('mostChosen')}
                    labels={{
                      tser: t('tserLabel'),
                      ir: t('irLabel'),
                      uv: t('uvLabel'),
                      warranty: t('warrantyLabel'),
                      shades: t('shadesAvailable'),
                    }}
                    onSelect={() => {
                      store.setMainFilmTier(film.tier);
                      if (store.frontShade && !film.shades.includes(store.frontShade)) {
                        store.setFrontShade(
                          film.shades.find((s) => s >= activeLocation.frontMinVlt) ??
                            film.shades[0]!,
                        );
                      }
                      if (store.rearShade && !film.shades.includes(store.rearShade)) {
                        store.setRearShade(
                          film.shades[film.shades.length - 2] ?? film.shades[0]!,
                        );
                      }
                      trackClientEvent('film_selected', {
                        film: film.name,
                        tier: film.tier,
                        value: (filmPricesByTier[film.tier] ?? 0) / 100,
                      });
                      store.unlockAndGoToStep(4);
                    }}
                  />
                ))}
              </div>
            </AccordionStep>

            {/* STEP 4: Your Shade */}
            <AccordionStep
              stepNumber={4}
              title={t('step4Title')}
              active={store.activeStep === 4}
              completed={store.maxUnlockedStep >= 5 && store.activeStep !== 4}
              unlocked={store.maxUnlockedStep >= 4}
              summary={
                store.mainServiceKey === 'full_car'
                  ? t('shadeSummaryFull', {
                      front: store.frontShade ?? '-',
                      rear: store.rearShade ?? '-',
                    })
                  : t('shadeSummaryFront', { front: store.frontShade ?? '-' })
              }
              editLabel={t('edit')}
              onEdit={() => store.setActiveStep(4)}
            >
              <p className="font-body text-sm text-[var(--color-anvil)]">{t('step4Desc')}</p>

              <div className="mt-5 space-y-6">
                <ShadeScaleBar
                  label={t('frontWindows')}
                  value={store.frontShade}
                  onChange={(vlt) => store.setFrontShade(vlt)}
                  availableShades={selectedFilm?.shades ?? [...SHADE_STEPS]}
                  blockedShades={blockedFrontShades}
                  blockedReason={t('belowLegalLimit', { state: activeLocation.state })}
                />

                {activeLocation.medicalExemptionEnabled && (
                  <label className="flex cursor-pointer items-start gap-3 border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] p-3.5 text-xs">
                    <input
                      type="checkbox"
                      checked={store.hasMedicalExemption}
                      onChange={(e) => store.setHasMedicalExemption(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[var(--color-carbony-black)]"
                    />
                    <span>
                      <span className="block tracking-[0.023em] text-[var(--color-carbony-black)] uppercase">
                        {t('medicalExemption')}
                      </span>
                      <span className="font-body text-[var(--color-steel-mid)]">
                        {t('medicalExemptionNote')}
                      </span>
                    </span>
                  </label>
                )}

                {store.mainServiceKey === 'full_car' && (
                  <ShadeScaleBar
                    label={t('rearWindows')}
                    value={store.rearShade}
                    onChange={(vlt) => store.setRearShade(vlt)}
                    availableShades={selectedFilm?.shades ?? [...SHADE_STEPS]}
                  />
                )}

                {isSuvOrTruck && (
                  <div className="font-body flex items-start gap-2 border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] p-3 text-xs text-[var(--color-anvil)]">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{t('suvFactoryAdvice')}</span>
                  </div>
                )}

                <p className="font-body text-xs italic text-[var(--color-steel-mid)]">
                  {t('checkInNote')}
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => store.unlockAndGoToStep(5)}
                  className="inline-flex h-12 items-center gap-2 bg-[var(--color-carbony-black)] px-6 text-xs tracking-[0.023em] text-white uppercase hover:bg-[var(--color-pure-black)]"
                >
                  <span>{t('continue')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </AccordionStep>

            {/* STEP 5: Add-ons & Removals */}
            <AccordionStep
              stepNumber={5}
              title={t('step5Title')}
              active={store.activeStep === 5}
              completed={store.maxUnlockedStep >= 6 && store.activeStep !== 5}
              unlocked={store.maxUnlockedStep >= 5}
              summary={
                store.addons.length + store.removals.length > 0
                  ? tCommon('selectedCount', {
                      count: store.addons.length + store.removals.length,
                    })
                  : tCommon('none')
              }
              editLabel={t('edit')}
              onEdit={() => store.setActiveStep(5)}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-body text-sm text-[var(--color-anvil)]">{t('step5Desc')}</p>
                <span className="inline-flex items-center gap-1.5 bg-[var(--color-carbony-black)] px-3 py-1 text-[11px] tracking-[0.023em] text-[var(--color-giallo-vivo)] uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('addonDiscountBadge', {
                    percent: Math.round(activeLocation.onlineAddonDiscount * 100),
                  })}
                </span>
              </div>

              {activeLocation.windshieldRule === 'clear_only' && (
                <p className="font-body mt-3 text-xs text-[var(--color-steel-mid)]">
                  {t('windshieldClearRule', { state: activeLocation.state })}
                </p>
              )}

              <div className="mt-4 space-y-3">
                {addonServices.map((srv) => {
                  const activeAddon = store.addons.find((a) => a.serviceKey === srv.key);
                  const isSelected = Boolean(activeAddon);
                  const isWindshield = srv.key === 'full_windshield';

                  const eligibleFilms = catalog.films.filter((f) => {
                    const p =
                      store.vehicle &&
                      getMatrixPriceCents(
                        catalog,
                        activeLocation.id,
                        store.vehicle.categoryKey,
                        srv.key,
                        f.tier,
                      );
                    if (p == null) return false;
                    if (isWindshield && activeLocation.windshieldRule === 'clear_only') {
                      return f.isClearWindshieldSafe;
                    }
                    return true;
                  });

                  const defaultTier: FilmTier =
                    eligibleFilms.find((f) => f.tier === store.mainFilmTier)?.tier ??
                    eligibleFilms[0]?.tier ??
                    'good';

                  const activeTier = activeAddon?.filmTier ?? defaultTier;
                  const priceCents = store.vehicle
                    ? getMatrixPriceCents(
                        catalog,
                        activeLocation.id,
                        store.vehicle.categoryKey,
                        srv.key,
                        activeTier,
                      )
                    : null;

                  return (
                    <div
                      key={srv.id}
                      className={cn(
                        'border p-4 transition-colors',
                        isSelected
                          ? 'border-[var(--color-pure-black)] bg-[var(--color-marble-gray)]'
                          : 'border-[var(--color-ash-border)] bg-[var(--color-pearl-white)]',
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              store.toggleAddon({
                                serviceKey: srv.key,
                                filmTier: defaultTier,
                                shade: isWindshield ? 70 : 33,
                              });
                              if (!isSelected) {
                                trackClientEvent('addon_added', { service: srv.key });
                              }
                            }}
                            className="mt-1 h-4 w-4 accent-[var(--color-carbony-black)]"
                          />
                          <span>
                            <span className="block text-sm uppercase text-[var(--color-carbony-black)]">
                              {locale === 'es' ? srv.nameEs : srv.nameEn}
                            </span>
                            <span className="font-body block text-xs text-[var(--color-steel-mid)]">
                              {locale === 'es' ? srv.descriptionEs : srv.descriptionEn}
                            </span>
                          </span>
                        </label>

                        {priceCents != null && (
                          <span className="shrink-0 text-base tabular-nums text-[var(--color-carbony-black)]">
                            {formatCents(
                              Math.round(priceCents * (1 - activeLocation.onlineAddonDiscount)),
                              locale,
                            )}
                          </span>
                        )}
                      </div>

                      {isSelected && eligibleFilms.length > 1 && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-ash-border)] pt-3">
                          {eligibleFilms.map((ef) => (
                            <button
                              key={ef.id}
                              type="button"
                              onClick={() =>
                                store.updateAddon(srv.key, {
                                  filmTier: ef.tier,
                                  shade: isWindshield ? 70 : activeAddon?.shade ?? 33,
                                })
                              }
                              className={cn(
                                'border px-2.5 py-1 text-xs uppercase',
                                activeTier === ef.tier
                                  ? 'border-[var(--color-pure-black)] bg-[var(--color-carbony-black)] text-white'
                                  : 'border-[var(--color-ash-border)] bg-[var(--color-pearl-white)] text-[var(--color-carbony-black)]',
                              )}
                            >
                              {ef.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Removals */}
              <div className="mt-6 border-t border-[var(--color-ash-border)] pt-5">
                <p className="text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                  {t('removalsTitle')}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {removalServices.map((rem) => {
                    const checked = store.removals.includes(rem.key);
                    const priceCents = getFixedPriceCents(catalog, activeLocation.id, rem.key);
                    return (
                      <label
                        key={rem.id}
                        className={cn(
                          'flex cursor-pointer items-center justify-between border px-3.5 py-2.5 text-xs uppercase',
                          checked
                            ? 'border-[var(--color-pure-black)] bg-[var(--color-marble-gray)]'
                            : 'border-[var(--color-ash-border)] bg-[var(--color-pearl-white)]',
                        )}
                      >
                        <span className="flex items-center gap-2 text-[var(--color-carbony-black)]">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => store.toggleRemoval(rem.key)}
                            className="h-3.5 w-3.5 accent-[var(--color-carbony-black)]"
                          />
                          {locale === 'es' ? rem.nameEs : rem.nameEn}
                        </span>
                        {priceCents != null && (
                          <span className="tabular-nums text-[var(--color-steel-mid)]">
                            {formatCents(priceCents, locale)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    store.unlockAndGoToStep(activeLocation.status === 'coming_soon' ? 7 : 6)
                  }
                  className="inline-flex h-12 items-center gap-2 bg-[var(--color-carbony-black)] px-6 text-xs tracking-[0.023em] text-white uppercase hover:bg-[var(--color-pure-black)]"
                >
                  <span>{t('continue')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </AccordionStep>

            {/* STEP 6: Appointment */}
            {activeLocation.status === 'active' && (
              <AccordionStep
                stepNumber={6}
                title={t('step6Title')}
                active={store.activeStep === 6}
                completed={Boolean(store.selectedSlotStartsAt) && store.activeStep !== 6}
                unlocked={store.maxUnlockedStep >= 6}
                summary={
                  store.selectedDate && store.selectedSlotLabel
                    ? `${store.selectedDate} · ${store.selectedSlotLabel}`
                    : undefined
                }
                editLabel={t('edit')}
                onEdit={() => store.setActiveStep(6)}
              >
                <p className="font-body text-sm text-[var(--color-anvil)]">{t('step6Desc')}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => store.setWaitType('drop_off')}
                    className={cn(
                      'border p-4 text-left transition-colors',
                      store.waitType === 'drop_off'
                        ? 'border-[var(--color-pure-black)] bg-[var(--color-marble-gray)] ring-1 ring-[var(--color-pure-black)]'
                        : 'border-[var(--color-ash-border)] bg-[var(--color-pearl-white)]',
                    )}
                  >
                    <span className="block text-sm uppercase text-[var(--color-carbony-black)]">
                      {t('dropOff')}
                    </span>
                    <span className="font-body mt-1 block text-xs text-[var(--color-steel-mid)]">
                      {t('dropOffDesc')}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => store.setWaitType('wait')}
                    className={cn(
                      'border p-4 text-left transition-colors',
                      store.waitType === 'wait'
                        ? 'border-[var(--color-pure-black)] bg-[var(--color-marble-gray)] ring-1 ring-[var(--color-pure-black)]'
                        : 'border-[var(--color-ash-border)] bg-[var(--color-pearl-white)]',
                    )}
                  >
                    <span className="block text-sm uppercase text-[var(--color-carbony-black)]">
                      {t('waitInLounge')}
                    </span>
                    <span className="font-body mt-1 block text-xs text-[var(--color-steel-mid)]">
                      {t('waitInLoungeDesc', { minutes: calculation?.durationMin ?? 90 })}
                    </span>
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-steel-mid)] uppercase">
                  <Clock className="h-3.5 w-3.5 text-[var(--color-carbony-black)]" />
                  <span>{t('estimatedTime', { minutes: calculation?.durationMin ?? 90 })}</span>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-xs uppercase text-[var(--color-carbony-black)]">
                    {t('selectDate')}
                  </p>
                  {loadingSlots ? (
                    <p className="font-body text-xs text-[var(--color-steel-mid)]">
                      {t('loadingAvailability')}
                    </p>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {availabilityDays.map((day) => {
                        const hasSlots = day.slots.length > 0;
                        const isSelected = store.selectedDate === day.date;
                        const dateObj = new Date(`${day.date}T12:00:00`);
                        return (
                          <button
                            key={day.date}
                            type="button"
                            disabled={!hasSlots}
                            onClick={() =>
                              store.setAppointmentSlot({
                                date: day.date,
                                startsAt: '',
                                endsAt: '',
                                label: '',
                              })
                            }
                            className={cn(
                              'flex w-16 shrink-0 flex-col items-center border py-2.5 text-xs uppercase transition-colors',
                              isSelected
                                ? 'border-[var(--color-pure-black)] bg-[var(--color-carbony-black)] text-white'
                                : 'border-[var(--color-ash-border)] bg-[var(--color-pearl-white)] text-[var(--color-carbony-black)] hover:border-[var(--color-pure-black)]',
                              !hasSlots && 'cursor-not-allowed opacity-35',
                            )}
                          >
                            <span className="opacity-80">
                              {dateObj.toLocaleDateString(locale, { weekday: 'short' })}
                            </span>
                            <span className="mt-0.5 text-lg tabular-nums">{dateObj.getDate()}</span>
                            <span className="text-[10px] opacity-80">
                              {dateObj.toLocaleDateString(locale, { month: 'short' })}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedDayObj && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs uppercase text-[var(--color-carbony-black)]">
                      {t('selectTime')}
                    </p>
                    {selectedDayObj.slots.length === 0 ? (
                      <p className="font-body text-xs text-[var(--color-steel-mid)]">
                        {t('noSlotsDay')}
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {selectedDayObj.slots.map((slot) => {
                          const isSelected = store.selectedSlotStartsAt === slot.startsAt;
                          return (
                            <button
                              key={slot.startsAt}
                              type="button"
                              onClick={() => {
                                store.setAppointmentSlot({
                                  date: selectedDayObj.date,
                                  startsAt: slot.startsAt,
                                  endsAt: slot.endsAt,
                                  label: slot.label,
                                });
                                store.unlockAndGoToStep(7);
                              }}
                              className={cn(
                                'border px-2 py-2.5 text-xs tabular-nums uppercase transition-colors',
                                isSelected
                                  ? 'border-[var(--color-pure-black)] bg-[var(--color-carbony-black)] text-white'
                                  : 'border-[var(--color-ash-border)] bg-[var(--color-pearl-white)] text-[var(--color-carbony-black)] hover:border-[var(--color-pure-black)]',
                              )}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </AccordionStep>
            )}

            {/* STEP 7: Your Details */}
            <AccordionStep
              stepNumber={7}
              title={t('step7Title')}
              active={store.activeStep === 7}
              completed={customerValid && store.activeStep !== 7}
              unlocked={store.maxUnlockedStep >= 7}
              summary={store.customer.name || undefined}
              editLabel={t('edit')}
              onEdit={() => store.setActiveStep(7)}
            >
              <p className="font-body text-sm text-[var(--color-anvil)]">{t('step7Desc')}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs uppercase text-[var(--color-steel-mid)]">
                    {t('nameLabel')}
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={store.customer.name}
                    onChange={(e) => store.setCustomer({ name: e.target.value })}
                    placeholder={t('namePlaceholder')}
                    className="font-body h-11 w-full border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase text-[var(--color-steel-mid)]">
                    {t('phoneLabel')}
                  </label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={store.customer.phone}
                    onChange={(e) => store.setCustomer({ phone: e.target.value })}
                    placeholder="+14695550199"
                    className="font-body h-11 w-full border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase text-[var(--color-steel-mid)]">
                    {t('emailLabel')}
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={store.customer.email}
                    onChange={(e) => store.setCustomer({ email: e.target.value })}
                    placeholder="alex@example.com"
                    className="font-body h-11 w-full border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] px-3 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs uppercase text-[var(--color-steel-mid)]">
                    {t('notesLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={store.customer.notes}
                    onChange={(e) => store.setCustomer({ notes: e.target.value })}
                    placeholder={t('notesPlaceholder')}
                    className="font-body w-full border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] p-3 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <label className="font-body flex cursor-pointer items-start gap-2.5 text-xs text-[var(--color-carbony-black)]">
                  <input
                    type="checkbox"
                    checked={store.customer.acceptDepositPolicy}
                    onChange={(e) => store.setCustomer({ acceptDepositPolicy: e.target.checked })}
                    className="mt-0.5 h-4 w-4 accent-[var(--color-carbony-black)]"
                  />
                  <span>
                    {t('policyDeposit', {
                      deposit: formatCents(
                        calculation?.depositCents ?? activeLocation.depositValue,
                        locale,
                      ),
                    })}
                  </span>
                </label>

                <label className="font-body flex cursor-pointer items-start gap-2.5 text-xs text-[var(--color-carbony-black)]">
                  <input
                    type="checkbox"
                    checked={store.customer.acceptLaborPolicy}
                    onChange={(e) => store.setCustomer({ acceptLaborPolicy: e.target.checked })}
                    className="mt-0.5 h-4 w-4 accent-[var(--color-carbony-black)]"
                  />
                  <span>{t('policyLabor')}</span>
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={!customerValid}
                  onClick={() => store.unlockAndGoToStep(8)}
                  className="inline-flex h-12 items-center gap-2 bg-[var(--color-carbony-black)] px-6 text-xs tracking-[0.023em] text-white uppercase hover:bg-[var(--color-pure-black)] disabled:opacity-40"
                >
                  <span>{t('continue')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </AccordionStep>

            {/* STEP 8: Deposit / Waitlist — Single Giallo Vivo CTA */}
            <AccordionStep
              stepNumber={8}
              title={t('step8Title')}
              active={store.activeStep === 8}
              completed={false}
              unlocked={store.maxUnlockedStep >= 8}
              editLabel={t('edit')}
              onEdit={() => store.setActiveStep(8)}
            >
              {waitlistSuccess ? (
                <div className="space-y-3 border border-[var(--color-carbony-black)] bg-[var(--color-marble-gray)] p-5">
                  <div className="flex items-center gap-2 text-base uppercase text-[var(--color-carbony-black)]">
                    <CheckCircle2 className="h-5 w-5 text-[var(--color-giallo-ombra)]" />
                    <span>{t('waitlistSuccessTitle')}</span>
                  </div>
                  <p className="font-body text-sm text-[var(--color-anvil)]">
                    {t('waitlistSuccessDesc')}
                  </p>
                  <p className="text-sm uppercase text-[var(--color-pure-black)]">
                    OPENING CODE: {waitlistSuccess.code}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="font-body text-sm text-[var(--color-anvil)]">{t('step8Desc')}</p>

                  {store.selectedDate &&
                    store.selectedSlotLabel &&
                    activeLocation.status === 'active' && (
                      <div className="flex items-center gap-2 border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] p-3 text-sm uppercase">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {store.selectedDate} · {store.selectedSlotLabel} ({activeLocation.name})
                        </span>
                      </div>
                    )}

                  {checkoutError && (
                    <div className="font-body flex items-center gap-2 border border-red-400 bg-red-50 p-3 text-xs text-red-800">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={submitting || !calculation?.valid}
                    onClick={handleCheckoutOrWaitlist}
                    className="inline-flex h-14 w-full items-center justify-center gap-2 bg-[var(--color-giallo-vivo)] px-6 text-sm tracking-[0.023em] text-[var(--color-pure-black)] uppercase transition-colors hover:bg-[var(--color-giallo-ombra)] hover:text-white disabled:opacity-50"
                  >
                    <span>
                      {submitting
                        ? t('processing')
                        : activeLocation.status === 'coming_soon'
                          ? t('joinWaitlistCta')
                          : t('payDepositCta', {
                              deposit: formatCents(
                                calculation?.depositCents ?? activeLocation.depositValue,
                                locale,
                              ),
                            })}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </AccordionStep>
          </div>

          {/* RIGHT COLUMN (Desktop sticky): Live tint stage + ticket */}
          <aside className="hidden space-y-4 lg:sticky lg:top-20 lg:col-span-5 lg:block">
            <div className="border border-[var(--color-graphite-border)] bg-[var(--color-carbon-deep)] p-6 text-white">
              <div className="mb-3 flex items-center justify-between text-xs tracking-[0.023em] uppercase">
                <span className="text-white">
                  {store.vehicle
                    ? [store.vehicle.year, store.vehicle.make, store.vehicle.model]
                        .filter(Boolean)
                        .join(' ')
                    : `Lamborghini Urus · ${t('livePreview')}`}
                </span>
                <span className="tabular-nums text-[var(--color-giallo-vivo)]">
                  {store.mainServiceKey === 'full_car'
                    ? t('shadeSummaryFull', {
                        front: store.frontShade ?? '-',
                        rear: store.rearShade ?? '-',
                      })
                    : `${t('shadeSummaryFront', { front: store.frontShade ?? '-' })} · ${tCommon('rear')}: ${tCommon('factory')}`}
                </span>
              </div>
              <CarSilhouette
                bodyType={store.vehicle?.categoryKey ?? 'suv'}
                frontShade={store.frontShade}
                rearShade={store.mainServiceKey === 'full_car' ? store.rearShade : null}
                windshieldShade={windshieldAddon?.shade ?? null}
                sunroofShade={sunroofAddon?.shade ?? null}
                highlightedZones={highlightedZones}
              />
            </div>

            <QuoteTicket
              locale={locale}
              location={activeLocation}
              vehicle={store.vehicle}
              calculation={calculation}
              canSave={Boolean(store.vehicle && store.mainFilmTier && store.maxUnlockedStep >= 3)}
              copied={copied}
              onShare={handleShareQuote}
              onOpenSave={() => setSaveOpen(true)}
            />
          </aside>
        </div>
      </div>

      {/* MOBILE FIXED BOTTOM TICKET BAR */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-graphite-border)] bg-[var(--color-carbony-black)] px-4 py-3 text-white lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div aria-live="polite" aria-atomic="true">
            <p className="text-[10px] tracking-[0.023em] text-[var(--color-ash-border)] uppercase">
              {t('ticketTotal')}
            </p>
            <p className="font-display text-3xl leading-none font-normal tabular-nums text-white">
              {calculation ? formatCents(calculation.totalCents, locale) : '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={store.activeStep === 8 ? handleCheckoutOrWaitlist : handleContinueMobile}
            className="inline-flex h-12 items-center gap-2 bg-[var(--color-giallo-vivo)] px-6 text-xs tracking-[0.023em] text-[var(--color-pure-black)] uppercase"
          >
            <span>
              {store.activeStep === 8
                ? activeLocation.status === 'coming_soon'
                  ? t('joinWaitlistCta')
                  : t('payDepositCta', {
                      deposit: formatCents(
                        calculation?.depositCents ?? activeLocation.depositValue,
                        locale,
                      ),
                    })
                : t('continue')}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <CompareFilmsModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        films={catalog.films}
        locale={locale}
        pricesByTier={filmPricesByTier}
      />

      {store.vehicle && quoteInput && (
        <SaveQuoteModal
          open={saveOpen}
          onClose={() => setSaveOpen(false)}
          vehicle={store.vehicle}
          quoteInput={quoteInput}
          lastStep={store.activeStep}
          onSaved={() => trackClientEvent('quote_saved', { step: store.activeStep })}
        />
      )}
    </div>
  );
}

interface AccordionStepProps {
  stepNumber: number;
  title: string;
  active: boolean;
  completed: boolean;
  unlocked: boolean;
  summary?: string;
  editLabel: string;
  onEdit: () => void;
  children: React.ReactNode;
}

function AccordionStep({
  stepNumber,
  title,
  active,
  completed,
  unlocked,
  summary,
  editLabel,
  onEdit,
  children,
}: AccordionStepProps) {
  return (
    <section
      className={cn(
        'overflow-hidden border transition-colors',
        active
          ? 'border-[var(--color-pure-black)] bg-[var(--color-pearl-white)]'
          : 'border-[var(--color-ash-border)] bg-[var(--color-pearl-white)]',
        !unlocked && 'opacity-45',
      )}
    >
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center text-xs tabular-nums',
              completed
                ? 'bg-[var(--color-carbony-black)] text-[var(--color-giallo-vivo)]'
                : active
                  ? 'bg-[var(--color-giallo-vivo)] text-[var(--color-pure-black)]'
                  : 'border border-[var(--color-ash-border)] text-[var(--color-steel-mid)]',
            )}
          >
            {completed ? <Check className="h-3.5 w-3.5" /> : stepNumber}
          </span>
          <div>
            <h2 className="font-display text-2xl leading-none font-normal text-[var(--color-carbony-black)] uppercase">
              {title}
            </h2>
            {!active && summary && (
              <p className="mt-1 text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                {summary}
              </p>
            )}
          </div>
        </div>

        {!active && unlocked && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs tracking-[0.023em] text-[var(--color-carbony-black)] uppercase underline underline-offset-4 hover:text-[var(--color-giallo-ombra)]"
          >
            {editLabel}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--color-ash-border)] px-6 py-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
