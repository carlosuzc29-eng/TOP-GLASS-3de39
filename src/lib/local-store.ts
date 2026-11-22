import type { CalculatedLine, QuoteInput, VehicleSelection, WaitType } from '@/types/domain';

export interface StoredQuote {
  id: string;
  shortCode: string;
  locationId: string;
  vehicle: VehicleSelection;
  input: QuoteInput;
  lines: CalculatedLine[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  depositCents: number;
  balanceCents: number;
  durationMin: number;
  status: 'draft' | 'sent' | 'viewed' | 'booked' | 'expired';
  source: 'web' | 'shop';
  createdAt: string;
}

export interface StoredAppointment {
  id: string;
  quoteId: string;
  shortCode: string;
  locationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  startsAt: string;
  endsAt: string;
  waitType: WaitType;
  status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  manageToken: string;
  createdAt: string;
}

export interface StoredLead {
  id: string;
  contactEmail?: string;
  contactPhone?: string;
  quoteId?: string;
  shortCode?: string;
  locationId: string;
  lastStep: number;
  isWaitlist: boolean;
  createdAt: string;
}

interface LocalStoreState {
  quotes: Map<string, StoredQuote>;
  appointments: Map<string, StoredAppointment>;
  leads: StoredLead[];
}

const globalForStore = globalThis as unknown as {
  __topGlassLocalStore?: LocalStoreState;
};

function getStore(): LocalStoreState {
  if (!globalForStore.__topGlassLocalStore) {
    globalForStore.__topGlassLocalStore = {
      quotes: new Map(),
      appointments: new Map(),
      leads: [],
    };
  }
  return globalForStore.__topGlassLocalStore;
}

export const localStore = {
  saveQuote(quote: StoredQuote) {
    getStore().quotes.set(quote.shortCode, quote);
    return quote;
  },
  getQuoteByCode(shortCode: string): StoredQuote | undefined {
    return getStore().quotes.get(shortCode);
  },
  saveAppointment(appt: StoredAppointment) {
    getStore().appointments.set(appt.manageToken, appt);
    return appt;
  },
  getAppointmentByToken(token: string): StoredAppointment | undefined {
    return getStore().appointments.get(token);
  },
  getAppointmentByStripeSession(sessionId: string): StoredAppointment | undefined {
    for (const appt of getStore().appointments.values()) {
      if (appt.stripeSessionId === sessionId) return appt;
    }
    return undefined;
  },
  listAppointmentsByLocation(locationId: string): StoredAppointment[] {
    return Array.from(getStore().appointments.values()).filter(
      (a) => a.locationId === locationId && a.status !== 'cancelled',
    );
  },
  addLead(lead: StoredLead) {
    getStore().leads.push(lead);
    return lead;
  },
};
