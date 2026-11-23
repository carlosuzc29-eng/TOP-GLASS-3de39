import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('faqTitle'), description: t('faqDescription') };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('faq');
  const tHome = await getTranslations('home');
  const items = t.raw('items') as Array<{ q: string; a: string }>;

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
        </div>
      </section>

      <section className="bg-[var(--color-pearl-white)] py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
          <div className="divide-y divide-[var(--color-ash-border)] border-y border-[var(--color-ash-border)]">
            {items.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="cursor-pointer list-none font-display text-2xl font-normal text-[var(--color-carbony-black)] uppercase">
                  {item.q}
                </summary>
                <p className="font-body mt-3 text-sm leading-relaxed text-[var(--color-anvil)]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/quote"
              className="inline-flex h-14 items-center gap-2 bg-[var(--color-giallo-vivo)] px-7 text-sm tracking-[0.023em] text-[var(--color-pure-black)] uppercase hover:bg-[var(--color-giallo-ombra)] hover:text-white"
            >
              <span>{tHome('heroCta')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
