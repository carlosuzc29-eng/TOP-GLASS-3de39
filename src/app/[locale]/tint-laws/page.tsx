import type { Metadata } from 'next';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Window Tint Laws — Texas & Utah',
  description:
    'Official automotive window tint VLT limits for Texas (25% front) and Utah (35% front), windshield rules, and medical exemption guidelines.',
};

export default async function TintLawsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('laws');
  const tHome = await getTranslations('home');

  const rows = [
    { zone: t('frontSides'), tx: t('txFront'), ut: t('utFront') },
    { zone: t('rearSides'), tx: t('txRear'), ut: t('utRear') },
    { zone: t('rearWindshield'), tx: t('txBack'), ut: t('utBack') },
    { zone: t('frontWindshield'), tx: t('txWindshield'), ut: t('utWindshield') },
    { zone: t('reflectivity'), tx: t('txReflect'), ut: t('utReflect') },
    { zone: t('medical'), tx: t('txMedical'), ut: t('utMedical') },
  ];

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
          <p className="font-body mt-4 max-w-2xl text-base text-[var(--color-ash-border)]">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-pearl-white)] py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="overflow-x-auto border border-[var(--color-carbony-black)]">
            <table className="w-full min-w-[600px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[var(--color-carbony-black)] text-white">
                  <th className="px-6 py-4 text-xs tracking-[0.023em] uppercase">
                    {t('tableZone')}
                  </th>
                  <th className="px-6 py-4 font-display text-xl font-normal uppercase">
                    {t('tableTexas')}
                  </th>
                  <th className="px-6 py-4 font-display text-xl font-normal uppercase">
                    {t('tableUtah')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-ash-border)]">
                {rows.map((r) => (
                  <tr key={r.zone} className="even:bg-[var(--color-marble-gray)]">
                    <td className="px-6 py-4 text-sm tracking-[0.023em] text-[var(--color-carbony-black)] uppercase">
                      {r.zone}
                    </td>
                    <td className="font-body px-6 py-4 text-[var(--color-anvil)]">{r.tx}</td>
                    <td className="font-body px-6 py-4 text-[var(--color-anvil)]">{r.ut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] p-6">
            <h2 className="font-display text-2xl font-normal text-[var(--color-carbony-black)] uppercase">
              {t('sourcesTitle')}
            </h2>
            <ul className="font-body mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href="https://www.dps.texas.gov/section/vehicle-inspection/window-tinting-standards"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[var(--color-carbony-black)] underline hover:text-[var(--color-giallo-ombra)]"
                >
                  Texas Department of Public Safety — Window Tinting Standards (TRC §547.613)
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://le.utah.gov/xcode/Title41/Chapter6a/41-6a-S1635.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[var(--color-carbony-black)] underline hover:text-[var(--color-giallo-ombra)]"
                >
                  Utah Code §41-6a-1635 — Windshields and windows tinting standards
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>

          <div className="mt-10">
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
