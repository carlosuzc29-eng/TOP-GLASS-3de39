'use client';

import { useTranslations } from 'next-intl';
import { Check, ShieldCheck } from 'lucide-react';
import { formatCents } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import type { Film, Locale } from '@/types/domain';

interface FilmSpecCardProps {
  film: Film;
  locale: Locale;
  priceCents?: number | null;
  selected?: boolean;
  onSelect?: () => void;
  mostChosenLabel?: string;
  variant?: 'light' | 'dark';
  labels: {
    tser: string;
    ir: string;
    uv: string;
    warranty: string;
    shades: string;
  };
}

const TIER_GLASS_STRIP: Record<string, string> = {
  good: '#313131',
  better: '#202020',
  best: '#181818',
  ultimate: '#000000',
};

export function FilmSpecCard({
  film,
  locale,
  priceCents,
  selected = false,
  onSelect,
  mostChosenLabel,
  variant = 'light',
  labels,
}: FilmSpecCardProps) {
  const tCommon = useTranslations('common');
  const tHome = useTranslations('home');
  const popularLabel = mostChosenLabel ?? tHome('mostChosen');
  const description = locale === 'es' ? film.descriptionEs : film.descriptionEn;
  const warranty = locale === 'es' ? film.warrantyEs : film.warrantyEn;
  const isDark = variant === 'dark';

  const Wrapper = onSelect ? 'button' : 'div';

  return (
    <Wrapper
      type={onSelect ? 'button' : undefined}
      onClick={onSelect}
      className={cn(
        'group relative flex w-full flex-col rounded-none border text-left transition-colors',
        isDark
          ? selected
            ? 'border-[var(--color-giallo-vivo)] bg-[var(--color-carbony-black)]'
            : 'border-[var(--color-graphite-border)] bg-[var(--color-carbony-black)] hover:border-white'
          : selected
            ? 'border-[var(--color-pure-black)] bg-[var(--color-marble-gray)] ring-1 ring-[var(--color-pure-black)]'
            : 'border-[var(--color-ash-border)] bg-[var(--color-pearl-white)] hover:border-[var(--color-pure-black)]',
        onSelect && 'cursor-pointer',
      )}
    >
      {/* Top glass tint strip — 0px hard edge */}
      <div
        className="flex h-9 w-full items-center justify-between px-4"
        style={{ backgroundColor: TIER_GLASS_STRIP[film.tier] }}
      >
        <span className="text-[11px] tracking-[0.08em] text-white uppercase">
          {tCommon(`tiers.${film.tier}`)}
        </span>
        {film.isPopular && (
          <span className="bg-[var(--color-giallo-vivo)] px-2 py-0.5 text-[10px] tracking-[0.023em] text-[var(--color-pure-black)] uppercase">
            {popularLabel}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              className={cn(
                'font-display text-2xl leading-tight font-normal uppercase',
                isDark ? 'text-white' : 'text-[var(--color-carbony-black)]',
              )}
            >
              {film.name}
            </h3>
            <p
              className={cn(
                'font-body mt-2 text-xs leading-relaxed',
                isDark ? 'text-[var(--color-ash-border)]' : 'text-[var(--color-steel-mid)]',
              )}
            >
              {description}
            </p>
          </div>
          {priceCents != null && (
            <div className="shrink-0 text-right">
              <span
                className={cn(
                  'font-display text-3xl leading-none font-normal tabular-nums',
                  isDark ? 'text-white' : 'text-[var(--color-pure-black)]',
                )}
              >
                {formatCents(priceCents, locale)}
              </span>
              {selected && (
                <span className="mt-1.5 flex items-center justify-end gap-1 text-[11px] tracking-[0.023em] text-[var(--color-giallo-ombra)] uppercase">
                  <Check className="h-3.5 w-3.5" /> {tCommon('selected')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Comparable performance bars */}
        <div className="space-y-3 pt-1">
          <MetricBar label={labels.tser} value={film.tser} isDark={isDark} />
          <MetricBar label={labels.ir} value={film.irRejection} highlight isDark={isDark} />
          <MetricBar label={labels.uv} value={film.uvRejection} isDark={isDark} />
        </div>

        <div
          className={cn(
            'mt-auto space-y-3 border-t pt-4 text-xs',
            isDark
              ? 'border-[var(--color-graphite-border)] text-[var(--color-ash-border)]'
              : 'border-[var(--color-ash-border)] text-[var(--color-steel-mid)]',
          )}
        >
          <div className="flex items-start gap-2">
            <ShieldCheck
              className={cn(
                'mt-0.5 h-3.5 w-3.5 shrink-0',
                isDark ? 'text-[var(--color-giallo-vivo)]' : 'text-[var(--color-carbony-black)]',
              )}
            />
            <span className="font-body">{warranty}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span
              className={cn(
                'mr-1 text-[11px] uppercase',
                isDark ? 'text-white' : 'text-[var(--color-carbony-black)]',
              )}
            >
              {labels.shades}:
            </span>
            {film.shades.map((s) => (
              <span
                key={s}
                className={cn(
                  'border px-1.5 py-0.5 text-[11px] tabular-nums',
                  isDark
                    ? 'border-[var(--color-graphite-border)] bg-[var(--color-carbon-deep)] text-white'
                    : 'border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] text-[var(--color-carbony-black)]',
                )}
              >
                {s}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <span
          className="absolute inset-x-0 bottom-0 h-[3px] bg-[var(--color-giallo-vivo)]"
          aria-hidden="true"
        />
      )}
    </Wrapper>
  );
}

function MetricBar({
  label,
  value,
  highlight = false,
  isDark = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  isDark?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] tracking-[0.023em] uppercase">
        <span className={isDark ? 'text-[var(--color-ash-border)]' : 'text-[var(--color-steel-mid)]'}>
          {label}
        </span>
        <span className={cn('tabular-nums', isDark ? 'text-white' : 'text-[var(--color-pure-black)]')}>
          {value}%
        </span>
      </div>
      <div
        className={cn(
          'h-[3px] w-full overflow-hidden',
          isDark ? 'bg-[var(--color-graphite-border)]' : 'bg-[var(--color-ash-border)]/45',
        )}
      >
        <div
          className={cn(
            'h-full transition-all',
            highlight
              ? 'bg-[var(--color-giallo-vivo)]'
              : isDark
                ? 'bg-white'
                : 'bg-[var(--color-carbony-black)]',
          )}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
