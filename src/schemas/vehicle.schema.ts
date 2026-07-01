import { z } from 'zod';
import type { Fitment, Make, Model, Vehicle, Year } from '@/types';
import { baseEntityObjectSchema } from './common.schema';

export const makeSchema = baseEntityObjectSchema.extend({
  slug: z.string(),
}) as z.ZodType<Make>;

export const modelSchema = baseEntityObjectSchema.extend({
  makeId: z.string(),
  slug: z.string(),
}) as z.ZodType<Model>;

export const yearSchema = z.object({
  value: z.number(),
  label: z.string().optional(),
}) as z.ZodType<Year>;

export const vehicleSchema = baseEntityObjectSchema.extend({
  make: makeSchema,
  model: modelSchema,
  year: yearSchema,
  bodyStyle: z.string().optional(),
  trim: z.string().optional(),
}) as z.ZodType<Vehicle>;

export const fitmentSchema = z.object({
  vehicleId: z.string().optional(),
  productId: z.string().optional(),
  compatible: z.boolean(),
  notes: z.string().optional(),
  requiredOptionIds: z.array(z.string()).optional(),
  excludedOptionIds: z.array(z.string()).optional(),
}) as z.ZodType<Fitment>;
