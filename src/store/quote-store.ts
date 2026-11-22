'use client';

import { create } from 'zustand';
import type {
  AddonSelection,
  FilmTier,
  SilhouetteKey,
  VehicleSelection,
  WaitType,
} from '@/types/domain';

export interface CustomerFormState {
  name: string;
  phone: string;
  email: string;
  notes: string;
  acceptDepositPolicy: boolean;
  acceptLaborPolicy: boolean;
}

export interface QuoteStoreState {
  activeStep: number;
  maxUnlockedStep: number;

  locationId: string;
  vehicle: VehicleSelection | null;
  mainServiceKey: string;
  mainFilmTier: FilmTier | null;
  frontShade: number | null;
  rearShade: number | null;
  hasMedicalExemption: boolean;
  addons: AddonSelection[];
  removals: string[];
  waitType: WaitType;
  selectedDate: string | null; // YYYY-MM-DD
  selectedSlotStartsAt: string | null;
  selectedSlotEndsAt: string | null;
  selectedSlotLabel: string | null;
  customer: CustomerFormState;

  // Hover state for Step 2 zone highlighting
  hoveredServiceKey: string | null;

  // Actions
  setActiveStep: (step: number) => void;
  unlockAndGoToStep: (step: number) => void;
  setLocationId: (locationId: string) => void;
  setVehicle: (vehicle: VehicleSelection) => void;
  setMainServiceKey: (key: string) => void;
  setMainFilmTier: (tier: FilmTier) => void;
  setFrontShade: (shade: number | null) => void;
  setRearShade: (shade: number | null) => void;
  setHasMedicalExemption: (val: boolean) => void;
  toggleAddon: (addon: AddonSelection) => void;
  updateAddon: (serviceKey: string, patch: Partial<AddonSelection>) => void;
  toggleRemoval: (serviceKey: string) => void;
  setWaitType: (waitType: WaitType) => void;
  setAppointmentSlot: (params: {
    date: string;
    startsAt: string;
    endsAt: string;
    label: string;
  }) => void;
  clearAppointmentSlot: () => void;
  setCustomer: (patch: Partial<CustomerFormState>) => void;
  setHoveredServiceKey: (key: string | null) => void;
  hydrateFromQueryParams: (params: URLSearchParams) => void;
  toQueryString: () => string;
  reset: () => void;
}

const DEFAULT_CUSTOMER: CustomerFormState = {
  name: '',
  phone: '',
  email: '',
  notes: '',
  acceptDepositPolicy: false,
  acceptLaborPolicy: false,
};

export const useQuoteStore = create<QuoteStoreState>((set, get) => ({
  activeStep: 0,
  maxUnlockedStep: 0,

  locationId: 'loc-princeton-tx',
  vehicle: null,
  mainServiceKey: 'full_car',
  mainFilmTier: null,
  frontShade: 33,
  rearShade: 15,
  hasMedicalExemption: false,
  addons: [],
  removals: [],
  waitType: 'drop_off',
  selectedDate: null,
  selectedSlotStartsAt: null,
  selectedSlotEndsAt: null,
  selectedSlotLabel: null,
  customer: DEFAULT_CUSTOMER,
  hoveredServiceKey: null,

  setActiveStep: (step) => set({ activeStep: step }),

  unlockAndGoToStep: (step) =>
    set((s) => ({
      activeStep: step,
      maxUnlockedStep: Math.max(s.maxUnlockedStep, step),
    })),

  setLocationId: (locationId) =>
    set({
      locationId,
      selectedDate: null,
      selectedSlotStartsAt: null,
      selectedSlotEndsAt: null,
      selectedSlotLabel: null,
    }),

  setVehicle: (vehicle) =>
    set((s) => ({
      vehicle,
      maxUnlockedStep: Math.max(s.maxUnlockedStep, 2),
    })),

  setMainServiceKey: (key) =>
    set((s) => ({
      mainServiceKey: key,
      maxUnlockedStep: Math.max(s.maxUnlockedStep, 3),
    })),

  setMainFilmTier: (tier) =>
    set((s) => ({
      mainFilmTier: tier,
      maxUnlockedStep: Math.max(s.maxUnlockedStep, 4),
    })),

  setFrontShade: (frontShade) => set({ frontShade }),
  setRearShade: (rearShade) => set({ rearShade }),
  setHasMedicalExemption: (hasMedicalExemption) => set({ hasMedicalExemption }),

  toggleAddon: (addon) =>
    set((s) => {
      const exists = s.addons.some((a) => a.serviceKey === addon.serviceKey);
      if (exists) {
        return { addons: s.addons.filter((a) => a.serviceKey !== addon.serviceKey) };
      }
      return { addons: [...s.addons, addon] };
    }),

  updateAddon: (serviceKey, patch) =>
    set((s) => ({
      addons: s.addons.map((a) => (a.serviceKey === serviceKey ? { ...a, ...patch } : a)),
    })),

  toggleRemoval: (serviceKey) =>
    set((s) => {
      const exists = s.removals.includes(serviceKey);
      return {
        removals: exists
          ? s.removals.filter((k) => k !== serviceKey)
          : [...s.removals, serviceKey],
      };
    }),

  setWaitType: (waitType) =>
    set({
      waitType,
      selectedSlotStartsAt: null,
      selectedSlotEndsAt: null,
      selectedSlotLabel: null,
    }),

  setAppointmentSlot: ({ date, startsAt, endsAt, label }) =>
    set((s) => ({
      selectedDate: date,
      selectedSlotStartsAt: startsAt,
      selectedSlotEndsAt: endsAt,
      selectedSlotLabel: label,
      maxUnlockedStep: Math.max(s.maxUnlockedStep, 7),
    })),

  clearAppointmentSlot: () =>
    set({
      selectedSlotStartsAt: null,
      selectedSlotEndsAt: null,
      selectedSlotLabel: null,
    }),

  setCustomer: (patch) =>
    set((s) => ({
      customer: { ...s.customer, ...patch },
    })),

  setHoveredServiceKey: (hoveredServiceKey) => set({ hoveredServiceKey }),

  hydrateFromQueryParams: (params) => {
    const loc = params.get('loc');
    const cat = params.get('cat') as SilhouetteKey | null;
    const yearStr = params.get('yr');
    const make = params.get('mk');
    const model = params.get('md');
    const srv = params.get('srv');
    const film = params.get('film') as FilmTier | null;
    const fs = params.get('fs');
    const rs = params.get('rs');
    const addonsParam = params.get('addons');
    const remParam = params.get('rem');

    const patch: Partial<QuoteStoreState> = {};
    let unlocked = 0;

    if (loc) {
      patch.locationId = loc;
      unlocked = Math.max(unlocked, 1);
    }
    if (cat && make && model) {
      patch.vehicle = {
        year: yearStr ? Number(yearStr) : null,
        make,
        model,
        categoryKey: cat,
      };
      unlocked = Math.max(unlocked, 2);
    }
    if (srv) {
      patch.mainServiceKey = srv;
      unlocked = Math.max(unlocked, 3);
    }
    if (film && ['good', 'better', 'best', 'ultimate'].includes(film)) {
      patch.mainFilmTier = film;
      unlocked = Math.max(unlocked, 4);
    }
    if (fs) patch.frontShade = Number(fs);
    if (rs) patch.rearShade = Number(rs);
    if (addonsParam) {
      try {
        patch.addons = JSON.parse(addonsParam);
      } catch {
        // ignore malformed
      }
    }
    if (remParam) {
      patch.removals = remParam.split(',').filter(Boolean);
    }

    if (unlocked > 0) {
      patch.maxUnlockedStep = unlocked;
      patch.activeStep = Math.min(unlocked, 5);
    }

    set(patch);
  },

  toQueryString: () => {
    const s = get();
    const p = new URLSearchParams();
    p.set('loc', s.locationId);
    if (s.vehicle) {
      if (s.vehicle.year) p.set('yr', String(s.vehicle.year));
      p.set('mk', s.vehicle.make);
      p.set('md', s.vehicle.model);
      p.set('cat', s.vehicle.categoryKey);
    }
    if (s.mainServiceKey) p.set('srv', s.mainServiceKey);
    if (s.mainFilmTier) p.set('film', s.mainFilmTier);
    if (s.frontShade != null) p.set('fs', String(s.frontShade));
    if (s.rearShade != null) p.set('rs', String(s.rearShade));
    if (s.addons.length > 0) p.set('addons', JSON.stringify(s.addons));
    if (s.removals.length > 0) p.set('rem', s.removals.join(','));
    return p.toString();
  },

  reset: () =>
    set({
      activeStep: 0,
      maxUnlockedStep: 0,
      vehicle: null,
      mainServiceKey: 'full_car',
      mainFilmTier: null,
      frontShade: 33,
      rearShade: 15,
      hasMedicalExemption: false,
      addons: [],
      removals: [],
      waitType: 'drop_off',
      selectedDate: null,
      selectedSlotStartsAt: null,
      selectedSlotEndsAt: null,
      selectedSlotLabel: null,
      customer: DEFAULT_CUSTOMER,
    }),
}));
