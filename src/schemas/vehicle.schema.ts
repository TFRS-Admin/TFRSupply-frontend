import { z } from 'zod';
import type { Fitment, FitmentIssue, FitmentRequest, FitmentResult, FitmentSubject, Make, Model, PackageFitmentRequest, ProductFitmentRequest, Vehicle, Year } from '@/types';
import { baseEntityObjectSchema } from './common.schema';

export const makeSchema = baseEntityObjectSchema.extend({
  slug: z.string(),
}) as z.ZodType<Make>;

export const modelSchema = baseEntityObjectSchema.extend({
  makeId: z.string(),
  slug: z.string(),
}) as z.ZodType<Model>;

export const yearSchema = z.object({
  value: z.number().int().min(1900).max(2100),
  label: z.string().optional(),
}) as z.ZodType<Year>;

export const vehicleSchema = baseEntityObjectSchema.extend({
  make: makeSchema,
  model: modelSchema,
  year: yearSchema,
  bodyStyle: z.string().optional(),
  trim: z.string().optional(),
  chassis: z.string().optional(),
}) as z.ZodType<Vehicle>;

export const fitmentSubjectTypeSchema = z.enum(['product', 'package']);
export const fitmentEvaluationStatusSchema = z.enum(['compatible', 'incompatible', 'unknown']);
export const fitmentIssueSeveritySchema = z.enum(['info', 'warning', 'error']);

export const fitmentSubjectSchema = z.object({
  type: fitmentSubjectTypeSchema,
  id: z.string().min(1),
  sku: z.string().optional(),
}) as z.ZodType<FitmentSubject>;

export const fitmentRequestSchema = z.object({
  vehicle: vehicleSchema,
  subject: fitmentSubjectSchema,
  requestedOptionIds: z.array(z.string()).optional(),
}) as z.ZodType<FitmentRequest>;

export const productFitmentRequestSchema = z.object({
  vehicle: vehicleSchema,
  productId: z.string().min(1),
  sku: z.string().optional(),
  requestedOptionIds: z.array(z.string()).optional(),
}) as z.ZodType<ProductFitmentRequest>;

export const packageFitmentRequestSchema = z.object({
  vehicle: vehicleSchema,
  packageId: z.string().min(1),
  sku: z.string().optional(),
  requestedOptionIds: z.array(z.string()).optional(),
}) as z.ZodType<PackageFitmentRequest>;

export const fitmentIssueSchema = z.object({
  code: z.string().min(1),
  severity: fitmentIssueSeveritySchema,
  message: z.string().min(1),
  field: z.string().optional(),
}) as z.ZodType<FitmentIssue>;

export const fitmentResultSchema = z.object({
  status: fitmentEvaluationStatusSchema,
  compatible: z.boolean(),
  vehicleId: z.string().optional(),
  subject: fitmentSubjectSchema,
  notes: z.string().optional(),
  requiredOptionIds: z.array(z.string()).optional(),
  excludedOptionIds: z.array(z.string()).optional(),
  issues: z.array(fitmentIssueSchema),
}) as z.ZodType<FitmentResult>;

export const fitmentSchema = z.object({
  vehicleId: z.string().optional(),
  productId: z.string().optional(),
  compatible: z.boolean(),
  notes: z.string().optional(),
  requiredOptionIds: z.array(z.string()).optional(),
  excludedOptionIds: z.array(z.string()).optional(),
}) as z.ZodType<Fitment>;
