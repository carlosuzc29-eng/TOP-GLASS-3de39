import type { Metadata } from 'next';
import { Barlow_Condensed, Open_Sans } from 'next/font/google';
import { getLocale, getTranslations } from 'next-intl/server';
import './globals.css';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-lambotype',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-open-sans',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: {
      default: t('siteTitle'),
      template: '%s | Top Glass Window Tint',
    },
    description: t('siteDescription'),
    openGraph: {
      type: 'website',
      siteName: 'Top Glass Window Tint',
      title: t('ogTitle'),
      description: t('ogDescription'),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${barlowCondensed.variable} ${openSans.variable}`}>
      <body className="min-h-screen bg-[var(--color-pearl-white)] text-[var(--color-carbony-black)] antialiased">
        {children}
      </body>
    </html>
  );
}
