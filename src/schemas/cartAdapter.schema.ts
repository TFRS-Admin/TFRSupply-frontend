import { z } from 'zod';
import type {
  CartAdapterDiagnostic,
  CartAdapterDiagnosticCode,
  CartAdapterDiagnosticLevel,
  CartAdapterMode,
  CartAdapterStatusSnapshot,
  CartMappingIssue,
  CartMappingValidationResult,
} from '@/types';
import { shopifyStorefrontCartResultSchema } from './shopifyStorefrontCart.schema';

export const cartAdapterModeSchema = z.enum(['mock', 'unavailable', 'live']) satisfies z.ZodType<CartAdapterMode>;

export const cartAdapterDiagnosticLevelSchema = z.enum(['info', 'warning', 'error']) satisfies z.ZodType<CartAdapterDiagnosticLevel>;

export const cartAdapterDiagnosticCodeSchema = z.enum([
  'adapter-mode',
  'live-calls-disabled',
  'unmapped-merchandise',
  'empty-cart',
  'live-config-incomplete',
]) satisfies z.ZodType<CartAdapterDiagnosticCode>;

export const cartAdapterDiagnosticSchema = z.object({
  code: cartAdapterDiagnosticCodeSchema,
  level: cartAdapterDiagnosticLevelSchema,
  message: z.string(),
}) as z.ZodType<CartAdapterDiagnostic>;

export const cartMappingIssueSchema = z.object({
  cartLineId: z.string(),
  sku: z.string(),
  reason: z.string(),
}) as z.ZodType<CartMappingIssue>;

export const cartMappingValidationResultSchema = z.object({
  totalLineCount: z.number().int().nonnegative(),
  mappedLineCount: z.number().int().nonnegative(),
  unmappedLineCount: z.number().int().nonnegative(),
  issues: z.array(cartMappingIssueSchema),
}) as z.ZodType<CartMappingValidationResult>;

export const cartAdapterStatusSnapshotSchema = z.object({
  adapterMode: cartAdapterModeSchema,
  lastPreview: shopifyStorefrontCartResultSchema.nullable(),
  lastPreviewedAt: z.string().nullable(),
  mappingValidation: cartMappingValidationResultSchema.nullable(),
  diagnostics: z.array(cartAdapterDiagnosticSchema),
  usedFallback: z.boolean(),
  fallbackReason: z.string().optional(),
}) as z.ZodType<CartAdapterStatusSnapshot>;
