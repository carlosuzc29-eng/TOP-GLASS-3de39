'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CarSilhouette } from '@/components/brand/CarSilhouette';
import { ShadeScaleBar } from '@/components/brand/ShadeScaleBar';
import { Link } from '@/i18n/routing';

export function InteractiveHero() {
  const t = useTranslations('home');
  const [previewShade, setPreviewShade] = useState<number>(22);

  return (
    <section className="relative w-full overflow-hidden bg-[var(--color-carbony-black)] text-white">
      {/* Subtle architectural dark studio photography backdrop */}
      <Image
        src="/images/studio-princeton.jpg"
        alt="Top Glass Window Tint studio bay"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-20"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#202020] via-[#202020]/90 to-[#181818]/85"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1440px] px-4 pt-12 pb-16 sm:px-6 lg:px-10 lg:pt-20 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left column: Monolithic uppercase LamboType headline + single Giallo CTA */}
          <div className="space-y-6 lg:col-span-6">
            <p className="text-xs tracking-[0.023em] text-[var(--color-ash-border)] uppercase">
              {t('eyebrow')}
            </p>
            <h1 className="font-display text-5xl leading-[0.94] font-normal tracking-[0.023em] text-white uppercase sm:text-7xl lg:text-[84px]">
              {t('heroTitle')}
            </h1>
            <p className="font-body max-w-lg text-base leading-relaxed text-[var(--color-ash-border)]">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              {/* Single Giallo Vivo CTA hit per screen */}
              <Link
                href="/quote"
                className="inline-flex h-14 items-center gap-3 bg-[var(--color-giallo-vivo)] px-7 text-sm tracking-[0.023em] text-[var(--color-pure-black)] uppercase transition-colors hover:bg-[var(--color-giallo-ombra)] hover:text-white"
              >
                <span>{t('heroCta')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Ghost link secondary CTA */}
              <Link
                href="/films"
                className="inline-flex h-14 items-center gap-2 text-sm tracking-[0.023em] text-white uppercase transition-colors hover:text-[var(--color-giallo-vivo)]"
              >
                <span>{t('heroSecondary')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right column: Red Lamborghini Urus under dark showroom spotlights + live VLT bar */}
          <div className="lg:col-span-6">
            <div className="border border-[var(--color-graphite-border)] bg-[var(--color-carbon-deep)]/95 p-6 sm:p-8">
              <div className="mb-4 flex items-center justify-between text-xs tracking-[0.023em] uppercase">
                <span className="text-[var(--color-ash-border)]">{t('heroShadePrompt')}</span>
                <span className="border border-[var(--color-graphite-border)] bg-[var(--color-pure-black)] px-3 py-1 tabular-nums text-[var(--color-giallo-vivo)]">
                  {t('heroVltLabel', { vlt: previewShade })}
                </span>
              </div>

              <CarSilhouette
                bodyType="suv"
                frontShade={previewShade}
                rearShade={previewShade}
                className="my-4"
              />

              <ShadeScaleBar
                value={previewShade}
                onChange={setPreviewShade}
                variant="dark"
                className="mt-6"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
