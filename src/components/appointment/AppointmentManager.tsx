'use client';

import { useState } from 'react';
import { Calendar, CheckCircle2, Download, MapPin, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCents } from '@/lib/pricing';

interface AppointmentManagerProps {
  token: string;
  confirmedBanner: boolean;
  locale: string;
  initialStatus: string;
  startsAt: string;
  waitType: string;
  customerName: string;
  vehicleLabel: string;
  locationName: string;
  locationAddress: string;
  totalCents: number;
  depositCents: number;
}

export function AppointmentManager({
  token,
  confirmedBanner,
  locale,
  initialStatus,
  startsAt,
  waitType,
  customerName,
  vehicleLabel,
  locationName,
  locationAddress,
  totalCents,
  depositCents,
}: AppointmentManagerProps) {
  const tConf = useTranslations('confirmation');
  const tAppt = useTranslations('appointment');
  const tQuote = useTranslations('quote');

  const [status, setStatus] = useState(initialStatus);
  const [cancelStep, setCancelStep] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [refunded, setRefunded] = useState<boolean | null>(null);

  const hoursUntil = (Date.parse(startsAt) - Date.now()) / 3_600_000;
  const refundEligible = hoursUntil > 24;
  const arrivalItems = tConf.raw('arrivalItems') as string[];

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/appointments/${encodeURIComponent(token)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('cancelled');
        setRefunded(Boolean(data.refunded));
        setCancelStep(false);
      }
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-[var(--color-marble-gray)] py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {confirmedBanner && status !== 'cancelled' && (
          <div className="mb-8 border-l-4 border-[var(--color-giallo-vivo)] bg-[var(--color-carbony-black)] p-8 text-white">
            <div className="flex items-center gap-2 text-xs tracking-[0.023em] text-[var(--color-giallo-vivo)] uppercase">
              <CheckCircle2 className="h-4 w-4" />
              <span>{tConf('eyebrow')}</span>
            </div>
            <h1 className="mt-2 font-display text-4xl font-normal uppercase sm:text-5xl">
              {tConf('title')}
            </h1>
            <p className="font-body mt-2 text-sm text-[var(--color-ash-border)]">
              {tConf('subtitle')}
            </p>
          </div>
        )}

        {!confirmedBanner && (
          <h1 className="mb-6 font-display text-5xl font-normal text-[var(--color-carbony-black)] uppercase">
            {tAppt('title')}
          </h1>
        )}

        <div className="border border-[var(--color-ash-border)] bg-[var(--color-pearl-white)] p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-ash-border)] pb-4">
            <div>
              <p className="font-display text-3xl font-normal text-[var(--color-carbony-black)] uppercase">
                {vehicleLabel}
              </p>
              <p className="text-xs text-[var(--color-steel-mid)] uppercase">{customerName}</p>
            </div>
            <span className="bg-[var(--color-carbony-black)] px-3 py-1 text-xs tracking-[0.023em] text-[var(--color-giallo-vivo)] uppercase">
              {status === 'confirmed'
                ? tAppt('statusConfirmed')
                : status === 'cancelled'
                  ? tAppt('statusCancelled')
                  : status === 'completed'
                    ? tAppt('statusCompleted')
                    : tAppt('statusPending')}
            </span>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="flex items-center gap-2 text-xs text-[var(--color-steel-mid)] uppercase">
                <Calendar className="h-4 w-4 text-[var(--color-carbony-black)]" /> {tAppt('dateTime')}
              </dt>
              <dd className="font-body text-right text-[var(--color-carbony-black)]">
                {new Date(startsAt).toLocaleString(locale === 'es' ? 'es-US' : 'en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}{' '}
                ({waitType === 'wait' ? tAppt('waiting') : tAppt('dropOff')})
              </dd>
            </div>

            <div className="flex items-start justify-between gap-4">
              <dt className="flex items-center gap-2 text-xs text-[var(--color-steel-mid)] uppercase">
                <MapPin className="h-4 w-4 text-[var(--color-carbony-black)]" /> {tAppt('location')}
              </dt>
              <dd className="text-right text-[var(--color-carbony-black)]">
                <span className="block uppercase">{locationName}</span>
                <span className="font-body text-xs text-[var(--color-steel-mid)]">
                  {locationAddress}
                </span>
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--color-ash-border)] pt-4">
              <dt className="text-xs text-[var(--color-steel-mid)] uppercase">
                {tQuote('ticketTotal')}
              </dt>
              <dd className="text-lg tabular-nums">{formatCents(totalCents, locale)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-xs text-[var(--color-steel-mid)] uppercase">
                {tQuote('ticketBalance')}
              </dt>
              <dd className="text-lg tabular-nums text-[var(--color-pure-black)]">
                {formatCents(Math.max(0, totalCents - depositCents), locale)}
              </dd>
            </div>
          </dl>

          {status !== 'cancelled' && (
            <div className="mt-8 flex flex-wrap gap-3 border-t border-[var(--color-ash-border)] pt-6">
              <a
                href={`/api/appointments/${encodeURIComponent(token)}/ics`}
                className="inline-flex h-12 items-center gap-2 bg-[var(--color-giallo-vivo)] px-6 text-xs tracking-[0.023em] text-[var(--color-pure-black)] uppercase hover:bg-[var(--color-giallo-ombra)] hover:text-white"
              >
                <Download className="h-4 w-4" />
                {tConf('addToCalendar')}
              </a>

              <button
                type="button"
                onClick={() => setCancelStep((v) => !v)}
                className="inline-flex h-12 items-center gap-2 border border-[var(--color-steel-mid)] px-6 text-xs tracking-[0.023em] text-[var(--color-carbony-black)] uppercase hover:border-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4" />
                {tAppt('cancel')}
              </button>
            </div>
          )}

          {cancelStep && status !== 'cancelled' && (
            <div className="mt-4 border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] p-4 text-xs">
              <p className="font-body text-[var(--color-carbony-black)]">
                {refundEligible ? tAppt('cancelRefundEligible') : tAppt('cancelNoRefund')}
              </p>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="mt-3 h-10 bg-red-700 px-5 text-xs tracking-[0.023em] text-white uppercase disabled:opacity-50"
              >
                {cancelling ? '...' : tAppt('confirmCancel')}
              </button>
            </div>
          )}

          {status === 'cancelled' && refunded !== null && (
            <p className="font-body mt-4 border border-[var(--color-ash-border)] bg-[var(--color-marble-gray)] p-3 text-xs text-[var(--color-anvil)]">
              {refunded
                ? tAppt('cancelledRefunded')
                : tAppt('cancelledNoRefund')}
            </p>
          )}
        </div>

        {status !== 'cancelled' && (
          <div className="mt-6 border border-[var(--color-ash-border)] bg-[var(--color-pearl-white)] p-8">
            <h2 className="font-display text-2xl font-normal text-[var(--color-carbony-black)] uppercase">
              {tConf('arrivalTitle')}
            </h2>
            <ul className="font-body mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--color-anvil)]">
              {arrivalItems.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
