'use client';

import { Bookmark, Check, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCents } from '@/lib/pricing';
import type {
  Locale,
  Location,
  QuoteCalculationResult,
  VehicleSelection,
} from '@/types/domain';

interface QuoteTicketProps {
  locale: Locale;
  location: Location;
  vehicle: VehicleSelection | null;
  calculation: QuoteCalculationResult | null;
  canSave: boolean;
  copied: boolean;
  onShare: () => void;
  onOpenSave: () => void;
}

export function QuoteTicket({
  locale,
  location,
  vehicle,
  calculation,
  canSave,
  copied,
  onShare,
  onOpenSave,
}: QuoteTicketProps) {
  const t = useTranslations('quote');

  const vehicleTitle = vehicle
    ? [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')
    : null;

  return (
    <div className="border border-[var(--color-graphite-border)] bg-[var(--color-carbony-black)] p-6 text-white">
      <div className="flex items-center justify-between border-b border-[var(--color-graphite-border)] pb-4">
        <div>
          <p className="text-[10px] tracking-[0.08em] text-[var(--color-ash-border)] uppercase">
            {t('ticketTitle')}
          </p>
          <p className="mt-1 text-base tracking-[0.023em] text-white uppercase">{location.name}</p>
        </div>
        {vehicleTitle && (
          <span className="border border-[var(--color-graphite-border)] bg-[var(--color-carbon-deep)] px-3 py-1 text-xs tracking-[0.023em] text-white uppercase">
            {vehicleTitle}
          </span>
        )}
      </div>

      {!calculation || calculation.lines.length === 0 ? (
        <p className="font-body py-8 text-sm text-[var(--color-ash-border)]">{t('ticketEmpty')}</p>
      ) : (
        <div className="space-y-4 pt-5">
          <ul className="space-y-3">
            {calculation.lines.map((line) => (
              <li
                key={`${line.serviceKey}-${line.filmTier ?? 'fixed'}`}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <div>
                  <p className="tracking-[0.023em] text-white uppercase">
                    {locale === 'es' ? line.nameEs : line.nameEn}
                  </p>
                  <p className="text-xs tracking-[0.023em] text-[var(--color-ash-border)] uppercase">
                    {[
                      line.filmName,
                      line.frontShade != null ? `FRONT ${line.frontShade}%` : null,
                      line.rearShade != null ? `REAR ${line.rearShade}%` : null,
                      line.shade != null ? `${line.shade}% VLT` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  {line.discountCents > 0 ? (
                    <>
                      <span className="mr-1.5 text-xs text-[var(--color-steel-mid)] line-through">
                        {formatCents(line.basePriceCents, locale)}
                      </span>
                      <span className="text-white">
                        {formatCents(line.finalPriceCents, locale)}
                      </span>
                    </>
                  ) : (
                    <span className="text-white">
                      {formatCents(line.finalPriceCents, locale)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {calculation.onlineAddonDiscountCents > 0 && (
            <div className="flex items-center justify-between border-t border-[var(--color-graphite-border)] pt-3 text-xs tracking-[0.023em] text-[var(--color-giallo-vivo)] uppercase">
              <span>
                {t('ticketOnlineDiscount', {
                  percent: Math.round(location.onlineAddonDiscount * 100),
                })}
              </span>
              <span className="tabular-nums">
                -{formatCents(calculation.onlineAddonDiscountCents, locale)}
              </span>
            </div>
          )}

          {/* Accessible live region for total updates */}
          <div
            aria-live="polite"
            aria-atomic="true"
            className="space-y-2 border-t border-[var(--color-graphite-border)] pt-4"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-sm tracking-[0.023em] text-white uppercase">
                {t('ticketTotal')}
              </span>
              <span className="font-display text-4xl font-normal tabular-nums text-white">
                {formatCents(calculation.totalCents, locale)}
              </span>
            </div>

            {location.status === 'active' && (
              <>
                <div className="flex items-center justify-between text-sm tracking-[0.023em] text-[var(--color-giallo-vivo)] uppercase">
                  <span>{t('ticketDueToday')}</span>
                  <span className="tabular-nums">
                    {formatCents(calculation.depositCents, locale)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs tracking-[0.023em] text-[var(--color-ash-border)] uppercase">
                  <span>{t('ticketBalance')}</span>
                  <span className="tabular-nums">
                    {formatCents(calculation.balanceCents, locale)}
                  </span>
                </div>
              </>
            )}
          </div>

          {canSave && (
            <div className="grid grid-cols-2 gap-2 pt-3">
              <button
                type="button"
                onClick={onOpenSave}
                className="inline-flex h-10 items-center justify-center gap-1.5 border border-[var(--color-graphite-border)] bg-[var(--color-carbon-deep)] px-3 text-xs tracking-[0.023em] text-white uppercase transition-colors hover:border-white"
              >
                <Bookmark className="h-3.5 w-3.5" />
                {t('saveQuote')}
              </button>
              <button
                type="button"
                onClick={onShare}
                className="inline-flex h-10 items-center justify-center gap-1.5 border border-[var(--color-graphite-border)] bg-[var(--color-carbon-deep)] px-3 text-xs tracking-[0.023em] text-white uppercase transition-colors hover:border-white"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-[var(--color-giallo-vivo)]" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                {copied ? t('linkCopied') : t('shareQuote')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
