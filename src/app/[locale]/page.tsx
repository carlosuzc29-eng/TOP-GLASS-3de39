import { ArrowRight, Eye, Flame, MapPin, Shield, Star } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { InteractiveHero } from '@/components/home/InteractiveHero';
import { FilmSpecCard } from '@/components/quote/FilmSpecCard';
import { Link } from '@/i18n/routing';
import { getPricingCatalog } from '@/lib/supabase/server';
import type { Locale } from '@/types/domain';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tQuote = await getTranslations('quote');
  const catalog = await getPricingCatalog();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'Top Glass Window Tint — Princeton, TX',
    description:
      'Precision ceramic automotive window tinting in Princeton, TX serving Collin County.',
    telephone: catalog.locations[0]?.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main St', // TODO(content)
      addressLocality: 'Princeton',
      addressRegion: 'TX',
      postalCode: '75407',
      addressCountry: 'US',
    },
    areaServed: ['Princeton', 'McKinney', 'Allen', 'Frisco', 'Plano', 'Wylie', 'Melissa'],
  };

  // TODO(content): Replace placeholder reviews with live Google Reviews feed
  const sampleReviews = [
    {
      author: 'Marcus D.',
      vehicle: '2024 LAMBORGHINI URUS · CERAMIC PRO',
      text: 'Zero dust, razor-clean micro edges, and the cabin stays noticeably cooler in 100-degree Princeton heat. Booking online took two minutes.',
    },
    {
      author: 'Elena R.',
      vehicle: '2023 TOYOTA RAV4 · NANO CERAMIC',
      text: 'Loved seeing the exact price before arriving. They showed shade samples on my actual glass at check-in and finished right on schedule.',
    },
    {
      author: 'Jordan K.',
      vehicle: '2024 FORD F-150 · CERAMIC IR MAX',
      text: 'Matched my front doors to the factory rear glass and added clear windshield film. Feels like an exotic car showroom, not a typical tint shop.',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* BAND 1: DARK HERO STAGE (#202020) */}
      <InteractiveHero />

      {/* BAND 2: PEARL WHITE (#ffffff) — THREE BENEFITS */}
      <section className="bg-[var(--color-pearl-white)] py-20 text-[var(--color-carbony-black)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-[var(--color-ash-border)] pb-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                {t('benefitsEyebrow')}
              </p>
              <h2 className="mt-2 font-display text-4xl leading-[1.1] font-normal text-[var(--color-carbony-black)] uppercase sm:text-[54px]">
                {t('benefitsTitle')}
              </h2>
            </div>
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 text-xs tracking-[0.023em] text-[var(--color-carbony-black)] uppercase hover:text-[var(--color-giallo-ombra)]"
            >
              <span>{t('heroCta')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Flame, title: t('benefitHeatTitle'), desc: t('benefitHeatDesc') },
              { icon: Eye, title: t('benefitPrivacyTitle'), desc: t('benefitPrivacyDesc') },
              { icon: Shield, title: t('benefitUvTitle'), desc: t('benefitUvDesc') },
            ].map((b) => (
              <div
                key={b.title}
                className="border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] p-6"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center bg-[var(--color-carbony-black)] text-[var(--color-giallo-vivo)]">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-2xl leading-[1.2] font-normal text-[var(--color-carbony-black)] uppercase">
                  {b.title}
                </h3>
                <p className="font-body mt-3 text-sm leading-relaxed text-[var(--color-anvil)]">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BAND 3: CARBON DEEP (#181818) — FILM TIERS SHOWCASE */}
      <section className="bg-[var(--color-carbon-deep)] py-20 text-white">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-[var(--color-graphite-border)] pb-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs tracking-[0.023em] text-[var(--color-ash-border)] uppercase">
                {t('filmsEyebrow')}
              </p>
              <h2 className="mt-2 font-display text-4xl leading-[1.1] font-normal text-white uppercase sm:text-[54px]">
                {t('filmsTitle')}
              </h2>
              <p className="font-body mt-2 text-sm text-[var(--color-ash-border)]">
                {t('filmsSubtitle')}
              </p>
            </div>
            <Link
              href="/films"
              className="inline-flex items-center gap-2 text-xs tracking-[0.023em] text-white uppercase hover:text-[var(--color-giallo-vivo)]"
            >
              <span>{t('filmsCta')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {catalog.films.map((film) => (
              <FilmSpecCard
                key={film.id}
                film={film}
                locale={locale as Locale}
                variant="dark"
                mostChosenLabel={t('mostChosen')}
                labels={{
                  tser: tQuote('tserLabel'),
                  ir: tQuote('irLabel'),
                  uv: tQuote('uvLabel'),
                  warranty: tQuote('warrantyLabel'),
                  shades: tQuote('shadesAvailable'),
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BAND 4: MARBLE GRAY (#f5f5f5) — THREE-COLUMN STORY GRID (BEFORE / AFTER) */}
      <section className="bg-[var(--color-marble-gray)] py-20 text-[var(--color-carbony-black)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col items-start justify-between gap-4 pb-10 md:flex-row md:items-end">
            <div>
              <p className="text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                {t('galleryEyebrow')}
              </p>
              <h2 className="mt-2 font-display text-4xl leading-[1.1] font-normal text-[var(--color-pure-black)] uppercase sm:text-[54px]">
                {t('galleryTitle')}
              </h2>
            </div>
            <p className="font-body text-sm text-[var(--color-anvil)]">{t('gallerySubtitle')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                tag: 'PRINCETON STUDIO',
                title: '2024 LAMBORGHINI URUS',
                spec: 'CERAMIC PRO · 33% FRONT / 15% REAR',
              },
              {
                tag: 'COLLIN COUNTY',
                title: '2024 FORD F-150 CREW',
                spec: 'CERAMIC IR MAX · 33% FRONT MATCH + 70% WINDSHIELD',
              },
              {
                tag: 'PRINCETON STUDIO',
                title: '2023 PORSCHE MACAN',
                spec: 'CERAMIC PRO · 33% FRONT / 22% REAR',
              },
            ].map((item) => (
              <article key={item.title} className="bg-[var(--color-pearl-white)]">
                {/* TODO(content): Replace with real before/after studio photography via next/image */}
                <div className="grid h-52 grid-cols-2">
                  <div className="flex flex-col justify-between bg-[#DCDCDC] p-4">
                    <span className="w-fit bg-[var(--color-pearl-white)] px-2 py-0.5 text-[10px] tracking-[0.023em] text-[var(--color-carbony-black)] uppercase">
                      BEFORE
                    </span>
                    <span className="text-[10px] tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                      FACTORY GLASS
                    </span>
                  </div>
                  <div className="flex flex-col justify-between bg-[var(--color-pure-black)] p-4 text-white">
                    <span className="w-fit bg-[var(--color-giallo-vivo)] px-2 py-0.5 text-[10px] tracking-[0.023em] text-[var(--color-pure-black)] uppercase">
                      AFTER
                    </span>
                    <span className="text-[10px] tracking-[0.023em] text-[var(--color-ash-border)] uppercase">
                      TOP GLASS CERAMIC
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[10px] tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                    {item.tag}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-normal text-[var(--color-carbony-black)] uppercase">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                    {item.spec}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BAND 5: PEARL WHITE (#ffffff) — REVIEWS */}
      <section className="bg-[var(--color-pearl-white)] py-20 text-[var(--color-carbony-black)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--color-ash-border)] pb-8">
            <div>
              <p className="text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                {t('reviewsEyebrow')}
              </p>
              <h2 className="mt-2 font-display text-4xl leading-[1.1] font-normal text-[var(--color-carbony-black)] uppercase sm:text-[54px]">
                {t('reviewsTitle')}
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 border border-[var(--color-carbony-black)] px-4 py-2 text-xs tracking-[0.023em] uppercase">
              <Star className="h-3.5 w-3.5 fill-[var(--color-giallo-vivo)] text-[var(--color-giallo-vivo)]" />
              <span>{t('reviewsGoogleBadge')}</span>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {sampleReviews.map((rev) => (
              <figure
                key={rev.author}
                className="flex flex-col justify-between border border-[var(--color-ash-border)] bg-[var(--color-pearl-white)] p-6"
              >
                <blockquote className="font-body text-sm leading-relaxed text-[var(--color-carbony-black)]">
                  &ldquo;{rev.text}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-[var(--color-ash-border)] pt-4">
                  <p className="text-sm tracking-[0.023em] text-[var(--color-carbony-black)] uppercase">
                    {rev.author}
                  </p>
                  <p className="mt-0.5 text-[11px] tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                    {rev.vehicle}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* BAND 6: MARBLE GRAY (#f5f5f5) — LOCATIONS */}
      <section className="bg-[var(--color-marble-gray)] py-20 text-[var(--color-carbony-black)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="pb-10">
            <p className="text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
              {t('locationsEyebrow')}
            </p>
            <h2 className="mt-2 font-display text-4xl leading-[1.1] font-normal text-[var(--color-pure-black)] uppercase sm:text-[54px]">
              {t('locationsTitle')}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {catalog.locations.map((loc) => (
              <div
                key={loc.id}
                className="flex flex-col justify-between border border-[var(--color-ash-border)] bg-[var(--color-pearl-white)] p-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="flex items-center gap-2 font-display text-3xl font-normal text-[var(--color-carbony-black)] uppercase">
                      <MapPin className="h-5 w-5 text-[var(--color-carbony-black)]" />
                      {loc.name}
                    </h3>
                    {loc.status === 'coming_soon' && (
                      <span className="bg-[var(--color-carbony-black)] px-3 py-1 text-[10px] tracking-[0.023em] text-[var(--color-giallo-vivo)] uppercase">
                        COMING SOON
                      </span>
                    )}
                  </div>

                  <dl className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-[var(--color-ash-border)] pb-3">
                      <dt className="text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                        {t('locationsAddress')}
                      </dt>
                      <dd className="font-body text-right text-[var(--color-carbony-black)]">
                        {loc.address}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[var(--color-ash-border)] pb-3">
                      <dt className="text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                        {t('locationsHours')}
                      </dt>
                      <dd className="font-body text-right text-[var(--color-carbony-black)]">
                        Mon–Fri 9:00–18:00 · Sat 9:00–16:00
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href={loc.status === 'active' ? '/quote' : '/quote?loc=loc-salt-lake-city-ut'}
                    className="inline-flex h-12 items-center gap-2 bg-[var(--color-carbony-black)] px-6 text-xs tracking-[0.023em] text-white uppercase transition-colors hover:bg-[var(--color-pure-black)]"
                  >
                    <span>{loc.status === 'active' ? t('locationsBook') : t('locationsWaitlist')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  {loc.slug === 'princeton-tx' && (
                    <Link
                      href="/princeton-tx"
                      className="inline-flex h-12 items-center gap-2 border border-[var(--color-steel-mid)] px-6 text-xs tracking-[0.023em] text-[var(--color-carbony-black)] uppercase hover:border-[var(--color-pure-black)]"
                    >
                      <span>STUDIO DETAILS</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
