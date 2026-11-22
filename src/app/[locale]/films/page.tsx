import type { Metadata } from 'next';
import { ArrowRight, Play } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FilmSpecCard } from '@/components/quote/FilmSpecCard';
import { Link } from '@/i18n/routing';
import { getPricingCatalog } from '@/lib/supabase/server';
import type { Locale } from '@/types/domain';

export const metadata: Metadata = {
  title: 'Window Film Specifications & Comparison',
  description:
    'Compare Carbon Matte, Nano Ceramic, Ceramic Pro, and Ceramic IR Max side by side across TSER, IR rejection, UV block, and lifetime warranty.',
};

export default async function FilmsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('filmsPage');
  const tHome = await getTranslations('home');
  const tQuote = await getTranslations('quote');
  const catalog = await getPricingCatalog();

  return (
    <div>
      <section className="bg-[var(--color-carbony-black)] py-16 text-white">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <p className="text-xs tracking-[0.023em] text-[var(--color-ash-border)] uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="mt-2 font-display text-5xl leading-[0.95] font-normal uppercase sm:text-7xl">
            {t('title')}
          </h1>
          <p className="font-body mt-4 max-w-2xl text-base text-[var(--color-ash-border)]">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-pearl-white)] py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {catalog.films.map((film) => (
              <FilmSpecCard
                key={film.id}
                film={film}
                locale={locale as Locale}
                mostChosenLabel={tHome('mostChosen')}
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

      <section className="bg-[var(--color-marble-gray)] py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="grid items-center gap-8 border border-[var(--color-ash-border)] bg-[var(--color-pearl-white)] p-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-4xl font-normal text-[var(--color-carbony-black)] uppercase">
                {t('heatLampTitle')}
              </h2>
              <p className="font-body mt-3 text-sm text-[var(--color-anvil)]">
                {t('heatLampDesc')}
              </p>
              <Link
                href="/quote"
                className="mt-6 inline-flex h-12 items-center gap-2 bg-[var(--color-giallo-vivo)] px-6 text-xs tracking-[0.023em] text-[var(--color-pure-black)] uppercase hover:bg-[var(--color-giallo-ombra)] hover:text-white"
              >
                <span>{tHome('heroCta')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex aspect-video items-center justify-center bg-[var(--color-carbony-black)] text-white">
              <div className="flex flex-col items-center gap-3 text-xs tracking-[0.023em] text-[var(--color-ash-border)] uppercase">
                <span className="flex h-14 w-14 items-center justify-center border border-white text-white">
                  <Play className="h-5 w-5" />
                </span>
                <span>HEAT LAMP STUDIO VIDEO (TODO(CONTENT))</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
