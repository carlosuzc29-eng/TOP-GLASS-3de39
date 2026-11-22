import type { Metadata } from 'next';
import { Barlow_Condensed, Open_Sans } from 'next/font/google';
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

export const metadata: Metadata = {
  title: {
    default: 'TOP GLASS WINDOW TINT — PRINCETON, TX',
    template: '%s | TOP GLASS WINDOW TINT',
  },
  description:
    'Precision ceramic automotive window tinting in Princeton, TX (Collin County) and coming soon to Salt Lake City, UT. Preview your shade and get your exact price in 3 minutes.',
  openGraph: {
    type: 'website',
    siteName: 'Top Glass Window Tint',
    title: 'TOP GLASS WINDOW TINT — LESS HEAT. MORE PRIVACY.',
    description:
      'Preview your shade live, compare ceramic films with exact pricing, and book your studio bay online.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${openSans.variable}`}>
      <body className="min-h-screen bg-[var(--color-pearl-white)] text-[var(--color-carbony-black)] antialiased">
        {children}
      </body>
    </html>
  );
}
