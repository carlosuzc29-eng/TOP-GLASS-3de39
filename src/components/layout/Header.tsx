'use client';

import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/films' as const, label: t('films') },
    { href: '/tint-laws' as const, label: t('laws') },
    { href: '/princeton-tx' as const, label: t('princeton') },
    { href: '/faq' as const, label: t('faq') },
  ];

  const switchLocale = (nextLocale: 'en' | 'es') => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-carbony-black)] text-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Left: Logo */}
        <Link href="/" aria-label="Top Glass Window Tint Home">
          <Logo variant="dark" />
        </Link>

        {/* Center: Uppercase LamboType nav */}
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-xs tracking-[0.023em] uppercase transition-colors',
                pathname === item.href
                  ? 'text-[var(--color-giallo-vivo)]'
                  : 'text-white/80 hover:text-white',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: EN/ES + Outlined Nav CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <div
            className="inline-flex items-center border border-[var(--color-graphite-border)] text-xs uppercase"
            role="group"
            aria-label={t('language')}
          >
            <button
              type="button"
              onClick={() => switchLocale('en')}
              className={cn(
                'px-2.5 py-1.5 tracking-[0.023em] transition-colors',
                locale === 'en'
                  ? 'bg-white text-[var(--color-carbony-black)]'
                  : 'text-white/75 hover:text-white',
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => switchLocale('es')}
              className={cn(
                'px-2.5 py-1.5 tracking-[0.023em] transition-colors',
                locale === 'es'
                  ? 'bg-white text-[var(--color-carbony-black)]'
                  : 'text-white/75 hover:text-white',
              )}
            >
              ES
            </button>
          </div>

          <Link
            href="/quote"
            className="inline-flex h-10 items-center gap-2 border border-[var(--color-steel-mid)] px-5 text-xs tracking-[0.023em] text-white uppercase transition-colors hover:border-[var(--color-giallo-vivo)] hover:text-[var(--color-giallo-vivo)]"
          >
            <span>{t('quote')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => switchLocale(locale === 'en' ? 'es' : 'en')}
            className="border border-[var(--color-graphite-border)] px-2.5 py-1.5 text-xs tracking-[0.023em] text-white uppercase"
            aria-label={t('language')}
          >
            {locale === 'en' ? 'ES' : 'EN'}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 items-center gap-1.5 border border-[var(--color-graphite-border)] px-3 text-xs tracking-[0.023em] text-white uppercase"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span>MENU</span>
          </button>
        </div>
      </div>

      {/* Mobile full-width dark drawer */}
      {mobileOpen && (
        <div className="border-t border-[var(--color-graphite-border)] bg-[var(--color-carbon-deep)] px-4 py-6 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-[var(--color-anvil)] pb-3 text-lg tracking-[0.023em] text-white uppercase hover:text-[var(--color-giallo-vivo)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/quote"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex h-12 items-center justify-center gap-2 bg-[var(--color-giallo-vivo)] px-6 text-sm tracking-[0.023em] text-[var(--color-pure-black)] uppercase"
            >
              <span>{t('quote')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
