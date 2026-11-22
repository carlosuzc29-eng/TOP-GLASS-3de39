import { z } from 'zod';

export const silhouetteKeySchema = z.enum([
  'coupe',
  'sedan',
  'suv',
  'large_suv',
  'pickup_single',
  'pickup_crew',
]);

export const filmTierSchema = z.enum(['good', 'better', 'best', 'ultimate']);

export const vehicleSelectionSchema = z.object({
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1).nullable(),
  make: z.string().min(1).max(80),
  model: z.string().min(1).max(100),
  categoryKey: silhouetteKeySchema,
  isManualBodyType: z.boolean().optional(),
});

export const addonSelectionSchema = z.object({
  serviceKey: z.string().min(1),
  filmTier: filmTierSchema.optional(),
  shade: z.number().int().min(5).max(80).optional(),
});

export const quoteInputSchema = z.object({
  locationId: z.string().min(1),
  categoryKey: silhouetteKeySchema,
  mainServiceKey: z.string().min(1),
  mainFilmTier: filmTierSchema,
  frontShade: z.number().int().min(5).max(80).nullable().optional(),
  rearShade: z.number().int().min(5).max(80).nullable().optional(),
  addons: z.array(addonSelectionSchema).default([]),
  removals: z.array(z.string()).default([]),
  promoCode: z.string().max(32).nullable().optional(),
  source: z.enum(['web', 'shop']).default('web'),
  hasMedicalExemption: z.boolean().optional(),
});

export const customerDetailsSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid mobile number (e.g. +14695550199)'),
  email: z.string().trim().email('Enter a valid email address'),
  notes: z.string().max(600).optional(),
  acceptDepositPolicy: z.literal(true, {
    errorMap: () => ({ message: 'Please accept the deposit policy' }),
  }),
  acceptLaborPolicy: z.literal(true, {
    errorMap: () => ({ message: 'Please accept the installation labor policy' }),
  }),
});

export const checkoutRequestSchema = z.object({
  locale: z.enum(['en', 'es']).default('en'),
  vehicle: vehicleSelectionSchema,
  quoteInput: quoteInputSchema,
  appointment: z.object({
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    waitType: z.enum(['drop_off', 'wait']),
  }),
  customer: customerDetailsSchema,
});

export const saveLeadRequestSchema = z
  .object({
    email: z.string().trim().email().optional().or(z.literal('')),
    phone: z.string().trim().optional().or(z.literal('')),
    vehicle: vehicleSelectionSchema,
    quoteInput: quoteInputSchema,
    lastStep: z.number().int().min(0).max(8).default(3),
    isWaitlist: z.boolean().default(false),
  })
  .refine((data) => Boolean(data.email || data.phone), {
    message: 'Provide an email or phone number',
  });
