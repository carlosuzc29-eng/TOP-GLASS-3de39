import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowRight, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getPricingCatalog } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Princeton, TX Window Tint Studio — Collin County',
  description:
    'Ceramic automotive window tinting in Princeton, TX serving McKinney, Allen, Frisco, Plano, Wylie, and Melissa. Exact upfront pricing and online booking.',
};

export default async function PrincetonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('princeton');
  const tLaws = await getTranslations('laws');
  const catalog = await getPricingCatalog();
  const princeton =
    catalog.locations.find((l) => l.slug === 'princeton-tx') ?? catalog.locations[0]!;

  return (
    <div>
      <section className="relative overflow-hidden bg-[var(--color-carbony-black)] py-20 text-white">
        <Image
          src="/images/studio-princeton.jpg"
          alt="Princeton Texas ceramic window tint studio"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-30"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#202020] via-[#202020]/85 to-transparent"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <p className="text-xs tracking-[0.023em] text-[var(--color-ash-border)] uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="mt-2 max-w-4xl font-display text-5xl leading-[0.95] font-normal uppercase sm:text-7xl">
            {t('title')}
          </h1>
          <p className="font-body mt-4 max-w-2xl text-base text-[var(--color-ash-border)]">
            {t('subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/quote"
              className="inline-flex h-14 items-center gap-2 bg-[var(--color-giallo-vivo)] px-7 text-sm tracking-[0.023em] text-[var(--color-pure-black)] uppercase hover:bg-[var(--color-giallo-ombra)] hover:text-white"
            >
              <span>{t('cta')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tint-laws"
              className="inline-flex h-14 items-center gap-2 border border-[var(--color-steel-mid)] px-7 text-sm tracking-[0.023em] text-white uppercase hover:border-white"
            >
              <span>TEXAS TINT LAWS</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-pearl-white)] py-20">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:px-6 md:grid-cols-2 lg:px-10">
          <div className="flex flex-col border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)]">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-carbony-black)]">
              <Image
                src="/images/gallery-urus.jpg"
                alt="Red Lamborghini Urus inside Princeton studio"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-6 p-8">
              <h2 className="font-display text-3xl font-normal text-[var(--color-carbony-black)] uppercase">
                PRINCETON STUDIO
              </h2>
              <div className="font-body space-y-3 text-sm text-[var(--color-carbony-black)]">
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{princeton.address}</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{princeton.phone}</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Mon–Fri 9:00 AM – 6:00 PM · Sat 9:00 AM – 4:00 PM · Sun Closed</span>
                </p>
              </div>

              <div className="border-t border-[var(--color-ash-border)] pt-5">
                <p className="text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                  {t('areasTitle')}
                </p>
                <p className="mt-2 text-base tracking-[0.023em] text-[var(--color-carbony-black)] uppercase">
                  {t('areasList')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between border border-[var(--color-graphite-border)] bg-[var(--color-carbony-black)] p-8 text-white">
            <div>
              <p className="text-xs tracking-[0.023em] text-[var(--color-giallo-vivo)] uppercase">
                TEXAS LEGAL STANDARDS
              </p>
              <h2 className="mt-1 font-display text-3xl font-normal uppercase">
                COMPLIANT BY DEFAULT
              </h2>
              <ul className="font-body mt-6 space-y-3 text-sm text-[var(--color-ash-border)]">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-giallo-vivo)]" />
                  <span>
                    <strong className="text-white">{tLaws('frontSides')}:</strong> {tLaws('txFront')}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-giallo-vivo)]" />
                  <span>
                    <strong className="text-white">{tLaws('frontWindshield')}:</strong>{' '}
                    {tLaws('txWindshield')}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-giallo-vivo)]" />
                  <span>
                    <strong className="text-white">{tLaws('medical')}:</strong> {tLaws('txMedical')}
                  </span>
                </li>
              </ul>
            </div>
            <p className="font-body mt-8 border border-[var(--color-graphite-border)] bg-[var(--color-carbon-deep)] p-4 text-xs text-[var(--color-steel-mid)]">
              TODO(content): Embed interactive Google Map once exact Princeton, TX street address is
              confirmed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
