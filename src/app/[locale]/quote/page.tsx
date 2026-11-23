import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { QuoteConfigurator } from '@/components/quote/QuoteConfigurator';
import { getPricingCatalog } from '@/lib/supabase/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('quoteTitle'), description: t('quoteDescription') };
}

export default async function QuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const catalog = await getPricingCatalog();
  const tQuote = await getTranslations('quote');

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-[var(--muted)]">
          {tQuote('loadingConfigurator')}
        </div>
      }
    >
      <QuoteConfigurator catalog={catalog} />
    </Suspense>
  );
}
