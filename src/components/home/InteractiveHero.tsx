'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CarSilhouette } from '@/components/brand/CarSilhouette';
import { ShadeScaleBar } from '@/components/brand/ShadeScaleBar';
import { Link } from '@/i18n/routing';

export function InteractiveHero() {
  const t = useTranslations('home');
  const [previewShade, setPreviewShade] = useState<number>(22);

  return (
    <section className="relative w-full bg-[var(--color-carbony-black)] text-white">
      <div className="mx-auto max-w-[1440px] px-4 pt-12 pb-16 sm:px-6 lg:px-10 lg:pt-20 lg:pb-24">
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

          {/* Right column: real studio Urus photo with live tint + VLT scale */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden border border-[var(--color-graphite-border)] bg-[var(--color-carbon-deep)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
              <div className="relative">
                <CarSilhouette bodyType="suv" frontShade={previewShade} rearShade={previewShade} />

                {/* Overlay readout */}
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-4">
                  <span className="flex items-center gap-2 bg-black/70 px-2.5 py-1 text-[10px] tracking-[0.08em] text-white uppercase backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-giallo-vivo)]" />
                    {t('heroStageLabel')}
                  </span>
                  <span
                    aria-live="polite"
                    className="bg-black/75 px-3 py-1.5 text-right backdrop-blur-sm"
                  >
                    <span className="block font-display text-xl leading-none tabular-nums text-[var(--color-giallo-vivo)] sm:text-2xl">
                      {t('heroVltLabel', { vlt: previewShade })}
                    </span>
                    <span className="mt-1 block text-[10px] tracking-[0.08em] text-white/80 uppercase">
                      {t(`shadeNames.${previewShade}`)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="border-t border-[var(--color-graphite-border)] p-5 sm:p-6">
                <p className="mb-3 text-xs tracking-[0.023em] text-[var(--color-ash-border)] uppercase">
                  {t('heroShadePrompt')}
                </p>
                <ShadeScaleBar value={previewShade} onChange={setPreviewShade} variant="dark" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
