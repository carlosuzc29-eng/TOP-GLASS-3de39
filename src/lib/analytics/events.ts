export type AnalyticsEventName =
  | 'quote_start'
  | 'vehicle_selected'
  | 'film_selected'
  | 'addon_added'
  | 'quote_saved'
  | 'checkout_started'
  | 'deposit_paid';

const META_EVENT_MAP: Partial<Record<AnalyticsEventName, string>> = {
  film_selected: 'ViewContent',
  quote_saved: 'Lead',
  checkout_started: 'InitiateCheckout',
  deposit_paid: 'Purchase',
};

export function createEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackClientEvent(
  eventName: AnalyticsEventName,
  params: Record<string, unknown> = {},
): string {
  const eventId = createEventId();

  if (typeof window !== 'undefined') {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, { ...params, event_id: eventId });
    }
    const metaName = META_EVENT_MAP[eventName];
    if (metaName && typeof window.fbq === 'function') {
      window.fbq('track', metaName, params, { eventID: eventId });
    }
  }

  return eventId;
}
