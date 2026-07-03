import { z } from 'zod';
import type { ShopifyStorefrontCapabilitySummary, ShopifyStorefrontConfigError, ShopifyStorefrontConfigErrorCode, ShopifyStorefrontConfigStatus, ShopifyStorefrontConfigValidationResult, ShopifyStorefrontEnvironmentConfig } from '@/types';
import { metadataSchema } from './common.schema';
import { shopifyStorefrontAdapterModeSchema } from './shopifyStorefront.schema';

const nonEmptyString = z.string().min(1);

export const shopifyStorefrontConfigStatusSchema = z.enum(['not-configured', 'partially-configured', 'configured', 'disabled']) satisfies z.ZodType<ShopifyStorefrontConfigStatus>;
export const shopifyStorefrontConfigErrorCodeSchema = z.enum(['missing-store-domain', 'missing-api-version', 'storefront-disabled', 'unknown']) satisfies z.ZodType<ShopifyStorefrontConfigErrorCode>;

export const shopifyStorefrontEnvironmentConfigSchema = z.object({
  storeDomain: z.string().nullable(),
  apiVersion: z.string().nullable(),
  storefrontEnabled: z.boolean(),
}) as z.ZodType<ShopifyStorefrontEnvironmentConfig>;

export const shopifyStorefrontConfigErrorSchema = z.object({
  code: shopifyStorefrontConfigErrorCodeSchema,
  message: nonEmptyString,
  fieldPath: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontConfigError>;

export const shopifyStorefrontConfigValidationResultSchema = z.object({
  status: shopifyStorefrontConfigStatusSchema,
  configured: z.boolean(),
  storefrontEnabled: z.boolean(),
  redactedStoreDomain: z.string().nullable(),
  apiVersion: z.string().nullable(),
  requiredEnvVars: z.array(nonEmptyString),
  presentEnvVars: z.array(nonEmptyString),
  missingEnvVars: z.array(nonEmptyString),
  errors: z.array(shopifyStorefrontConfigErrorSchema),
  checkedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontConfigValidationResult>;

export const shopifyStorefrontCapabilitySummarySchema = z.object({
  configValidation: shopifyStorefrontConfigValidationResultSchema,
  storefrontApiEnabled: z.boolean(),
  liveAdapterReady: z.boolean(),
  liveAdapterReadinessReason: nonEmptyString,
  adapterMode: shopifyStorefrontAdapterModeSchema,
  cartAdapterMode: shopifyStorefrontAdapterModeSchema,
  productAdapterMode: shopifyStorefrontAdapterModeSchema,
  collectionAdapterMode: shopifyStorefrontAdapterModeSchema,
  supportedOperationTypes: z.array(nonEmptyString),
  checkedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontCapabilitySummary>;
