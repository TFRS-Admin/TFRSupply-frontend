import { z } from 'zod';
import type {
  CatalogAdapterCapabilities,
  CatalogAdapterCollectionsResult,
  CatalogAdapterError,
  CatalogAdapterErrorCode,
  CatalogAdapterFetchStatus,
  CatalogAdapterMode,
  CatalogAdapterProductsResult,
  CatalogAdapterStatusSnapshot,
  CatalogMappingIssue,
  CatalogMappingValidationResult,
} from '@/types';
import { categorySchema, productSchema } from './product.schema';

export const catalogAdapterModeSchema = z.enum(['mock', 'unavailable', 'live']) satisfies z.ZodType<CatalogAdapterMode>;

export const catalogAdapterFetchStatusSchema = z.enum(['idle', 'success', 'failed', 'adapter-unavailable']) satisfies z.ZodType<CatalogAdapterFetchStatus>;

export const catalogAdapterErrorCodeSchema = z.enum([
  'not-configured',
  'network-error',
  'http-error',
  'graphql-error',
  'adapter-unavailable',
  'unknown',
]) satisfies z.ZodType<CatalogAdapterErrorCode>;

export const catalogAdapterErrorSchema = z.object({
  code: catalogAdapterErrorCodeSchema,
  message: z.string(),
  retryable: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
}) as z.ZodType<CatalogAdapterError>;

export const catalogAdapterProductsResultSchema = z.object({
  status: catalogAdapterFetchStatusSchema,
  products: z.array(productSchema),
  errors: z.array(catalogAdapterErrorSchema),
  fetchedAt: z.string(),
}) as z.ZodType<CatalogAdapterProductsResult>;

export const catalogAdapterCollectionsResultSchema = z.object({
  status: catalogAdapterFetchStatusSchema,
  categories: z.array(categorySchema),
  unmatchedCollectionHandles: z.array(z.string()),
  errors: z.array(catalogAdapterErrorSchema),
  fetchedAt: z.string(),
}) as z.ZodType<CatalogAdapterCollectionsResult>;

export const catalogMappingIssueSchema = z.object({
  entityType: z.enum(['product', 'category']),
  identifier: z.string(),
  reason: z.string(),
}) as z.ZodType<CatalogMappingIssue>;

export const catalogMappingValidationResultSchema = z.object({
  validProductCount: z.number().int().nonnegative(),
  invalidProductCount: z.number().int().nonnegative(),
  validCategoryCount: z.number().int().nonnegative(),
  unmatchedCollectionCount: z.number().int().nonnegative(),
  issues: z.array(catalogMappingIssueSchema),
}) as z.ZodType<CatalogMappingValidationResult>;

export const catalogAdapterStatusSnapshotSchema = z.object({
  adapterMode: catalogAdapterModeSchema,
  productFetchStatus: catalogAdapterFetchStatusSchema,
  collectionFetchStatus: catalogAdapterFetchStatusSchema,
  lastSyncedAt: z.string().nullable(),
  productCount: z.number().int().nonnegative(),
  categoryCount: z.number().int().nonnegative(),
  usedFallback: z.boolean(),
  fallbackReason: z.string().optional(),
  mappingValidation: catalogMappingValidationResultSchema.nullable(),
  errors: z.array(catalogAdapterErrorSchema),
}) as z.ZodType<CatalogAdapterStatusSnapshot>;

export const catalogAdapterCapabilitiesSchema = z.object({
  adapterMode: catalogAdapterModeSchema,
  supportsLiveFetch: z.boolean(),
}) as z.ZodType<CatalogAdapterCapabilities>;
