'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { formatCents } from '@/lib/pricing';
import type { Film, Locale } from '@/types/domain';

interface CompareFilmsModalProps {
  open: boolean;
  onClose: () => void;
  films: Film[];
  locale: Locale;
  pricesByTier?: Record<string, number | null>;
}

export function CompareFilmsModal({
  open,
  onClose,
  films,
  locale,
  pricesByTier,
}: CompareFilmsModalProps) {
  const t = useTranslations('quote');
  const tCommon = useTranslations('common');
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('compareTitle')}
    >
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto border border-[var(--color-graphite-border)] bg-[var(--color-pearl-white)] p-6 text-[var(--color-carbony-black)]">
        <div className="flex items-center justify-between border-b border-[var(--color-ash-border)] pb-4">
          <h2 className="font-display text-3xl font-normal uppercase">
            {t('compareTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center border border-[var(--color-ash-border)] text-[var(--color-carbony-black)] hover:border-[var(--color-pure-black)]"
            aria-label={tCommon('close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-carbony-black)]">
                <th className="py-3 pr-4 text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
                  {t('compareSpec')}
                </th>
                {films.map((f) => (
                  <th
                    key={f.id}
                    className="px-3 py-3 font-display text-lg font-normal text-[var(--color-carbony-black)] uppercase"
                  >
                    <div>{f.name}</div>
                    {pricesByTier?.[f.tier] != null && (
                      <div className="mt-0.5 text-base text-[var(--color-giallo-ombra)] tabular-nums">
                        {formatCents(pricesByTier[f.tier]!, locale)}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-ash-border)]">
              <tr>
                <td className="py-3 pr-4 text-xs uppercase text-[var(--color-steel-mid)]">
                  {t('compareTser')}
                </td>
                {films.map((f) => (
                  <td key={f.id} className="px-3 py-3 tabular-nums">
                    {f.tser}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-xs uppercase text-[var(--color-steel-mid)]">
                  {t('compareIr')}
                </td>
                {films.map((f) => (
                  <td key={f.id} className="px-3 py-3 tabular-nums text-[var(--color-pure-black)]">
                    {f.irRejection}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-xs uppercase text-[var(--color-steel-mid)]">
                  {t('compareUv')}
                </td>
                {films.map((f) => (
                  <td key={f.id} className="px-3 py-3 tabular-nums">
                    {f.uvRejection}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-xs uppercase text-[var(--color-steel-mid)]">
                  {t('shadesAvailable')}
                </td>
                {films.map((f) => (
                  <td key={f.id} className="px-3 py-3 text-xs tabular-nums">
                    {f.shades.map((s) => `${s}%`).join(', ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-xs uppercase text-[var(--color-steel-mid)]">
                  {t('warrantyLabel')}
                </td>
                {films.map((f) => (
                  <td key={f.id} className="font-body px-3 py-3 text-xs text-[var(--color-anvil)]">
                    {locale === 'es' ? f.warrantyEs : f.warrantyEn}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
