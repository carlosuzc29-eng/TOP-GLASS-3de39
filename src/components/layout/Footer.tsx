import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/brand/Logo';

export function Footer() {
  const tNav = useTranslations('nav');
  const tBrand = useTranslations('brand');
  const tFooter = useTranslations('footer');
  const tCommon = useTranslations('common');

  return (
    <footer className="bg-[var(--color-carbon-deep)] text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-6 md:col-span-2">
            <Logo variant="dark" />
            <p className="font-body max-w-md text-sm text-[var(--color-ash-border)]">
              {tFooter('studioNote')}
            </p>
            <div className="grid gap-6 pt-2 sm:grid-cols-2">
              <div className="border-t border-[var(--color-graphite-border)] pt-4">
                <p className="text-sm tracking-[0.023em] text-white uppercase">
                  {tBrand('princeton')}
                </p>
                {/* TODO(content): Replace placeholder address & phone */}
                <p className="font-body mt-1 text-xs text-[var(--color-ash-border)]">
                  123 Main St, Princeton, TX 75407
                </p>
                <p className="font-body mt-0.5 text-xs text-[var(--color-steel-mid)]">
                  (469) 555-0194
                </p>
              </div>
              <div className="border-t border-[var(--color-graphite-border)] pt-4">
                <p className="flex items-center gap-2 text-sm tracking-[0.023em] text-white uppercase">
                  <span>{tBrand('slc')}</span>
                  <span className="border border-[var(--color-giallo-vivo)] px-1.5 py-0.5 text-[10px] text-[var(--color-giallo-vivo)]">
                    {tBrand('comingSoon')}
                  </span>
                </p>
                {/* TODO(content): Replace opening date & address */}
                <p className="font-body mt-1 text-xs text-[var(--color-ash-border)]">
                  Salt Lake City, UT 84101
                </p>
                <p className="font-body mt-0.5 text-xs text-[var(--color-steel-mid)]">
                  (801) 555-0182
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
              {tFooter('servicesTitle')}
            </p>
            <ul className="mt-5 space-y-3 text-sm uppercase">
              <li>
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-1.5 text-white hover:text-[var(--color-giallo-vivo)]"
                >
                  {tNav('quote')} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/films" className="text-white/80 hover:text-white">
                  {tNav('films')}
                </Link>
              </li>
              <li>
                <Link href="/tint-laws" className="text-white/80 hover:text-white">
                  {tNav('laws')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/80 hover:text-white">
                  {tNav('faq')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase">
              {tFooter('locationsTitle')}
            </p>
            <ul className="mt-5 space-y-3 text-sm uppercase">
              <li>
                <Link href="/princeton-tx" className="text-white/80 hover:text-white">
                  {tNav('princeton')}
                </Link>
              </li>
              <li>
                <Link
                  href="/quote?loc=loc-salt-lake-city-ut"
                  className="text-white/80 hover:text-white"
                >
                  {tNav('slc')} ({tBrand('comingSoon')})
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-[var(--color-graphite-border)] pt-8 text-xs tracking-[0.023em] text-[var(--color-steel-mid)] uppercase sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} {tBrand('name')}. {tFooter('rights')}
          </p>
          <p>{tCommon('region')}</p>
        </div>
      </div>
    </footer>
  );
}
