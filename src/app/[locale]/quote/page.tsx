import { Suspense } from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { QuoteConfigurator } from '@/components/quote/QuoteConfigurator';
import { getPricingCatalog } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Design Your Tint — Instant Exact Quote',
  description:
    'Configure your vehicle, compare ceramic film tiers with exact pricing, preview your shade live, and reserve your bay online.',
};

export default async function QuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const catalog = await getPricingCatalog();

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-[var(--muted)]">
          Loading configurator...
        </div>
      }
    >
      <QuoteConfigurator catalog={catalog} />
    </Suspense>
  );
}
