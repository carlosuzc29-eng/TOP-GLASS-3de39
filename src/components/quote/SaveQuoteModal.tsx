'use client';

import { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { QuoteInput, VehicleSelection } from '@/types/domain';

interface SaveQuoteModalProps {
  open: boolean;
  onClose: () => void;
  vehicle: VehicleSelection;
  quoteInput: QuoteInput;
  lastStep: number;
  onSaved?: (quoteUrl: string) => void;
}

export function SaveQuoteModal({
  open,
  onClose,
  vehicle,
  quoteInput,
  lastStep,
  onSaved,
}: SaveQuoteModalProps) {
  const t = useTranslations('quote');
  const tCommon = useTranslations('common');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          vehicle,
          quoteInput,
          lastStep,
          isWaitlist: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('errorSave'));
      } else {
        setSavedUrl(data.quoteUrl);
        onSaved?.(data.quoteUrl);
      }
    } catch {
      setError(tCommon('networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('saveModalTitle')}
    >
      <div className="w-full max-w-md border border-[var(--color-graphite-border)] bg-[var(--color-pearl-white)] p-6 text-[var(--color-carbony-black)]">
        <div className="flex items-center justify-between border-b border-[var(--color-ash-border)] pb-3">
          <h3 className="font-display text-2xl font-normal uppercase">{t('saveModalTitle')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center border border-[var(--color-ash-border)] hover:border-[var(--color-pure-black)]"
            aria-label={tCommon('close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {savedUrl ? (
          <div className="space-y-4 py-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-[var(--color-giallo-ombra)]" />
            <p className="text-base tracking-[0.023em] uppercase">{t('saveModalSuccess')}</p>
            <a
              href={savedUrl}
              className="font-body block truncate border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] px-3 py-2 text-xs text-[var(--color-carbony-black)] underline"
            >
              {savedUrl}
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <p className="font-body text-sm text-[var(--color-anvil)]">{t('saveModalDesc')}</p>
            <div className="space-y-1.5">
              <label className="text-xs tracking-[0.023em] uppercase">{t('emailLabel')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="font-body h-11 w-full border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] px-3 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs tracking-[0.023em] uppercase">{t('phoneLabel')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+14695550199"
                className="font-body h-11 w-full border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] px-3 text-sm"
              />
            </div>
            {error && <p className="font-body text-xs text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={loading || (!email && !phone)}
              className="h-12 w-full bg-[var(--color-giallo-vivo)] text-sm tracking-[0.023em] text-[var(--color-pure-black)] uppercase transition-colors hover:bg-[var(--color-giallo-ombra)] hover:text-white disabled:opacity-50"
            >
              {loading ? '...' : t('saveModalSubmit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
