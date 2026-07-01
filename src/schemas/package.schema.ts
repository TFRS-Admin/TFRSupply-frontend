import { z } from 'zod';
import type { Accessory, Package, PackageAssemblyInput, PackageAssemblyResult, PackageCompatibilityIssue, PackageCompatibilityResult, PackageDefinition, PackageLine, PackageValidationResult } from '@/types';
import { baseEntityObjectSchema } from './common.schema';
import { productSchema } from './product.schema';
import { fitmentSchema, vehicleSchema } from './vehicle.schema';

const nonEmptyString = z.string().min(1);
const positiveQuantity = z.number().int().positive();

export const packageLineItemTypeSchema = z.enum(['product', 'accessory', 'service', 'kit']);
export const packageAccessoryRequirementSchema = z.enum(['required', 'optional']);
export const packageCompatibilityStatusSchema = z.enum(['compatible', 'incompatible', 'unknown', 'requires-review']);
export const packageAssemblyStatusSchema = z.enum(['assembled', 'pending', 'invalid', 'unavailable']);
export const packageValidationSeveritySchema = z.enum(['info', 'warning', 'error', 'review-required']);

export const packageMetadataSchema = z.object({
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  packageType: z.enum(['reusable', 'vehicle-specific', 'installer', 'quote-ready', 'unknown']).optional(),
  revision: z.string().optional(),
  owner: z.string().optional(),
  effectiveAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const accessorySchema = baseEntityObjectSchema.extend({
  sku: z.string().optional(),
  productId: z.string().optional(),
  compatibleProductIds: z.array(z.string()).optional(),
  requirement: packageAccessoryRequirementSchema.optional(),
  quantity: positiveQuantity.optional(),
}) as z.ZodType<Accessory>;

export const packageLineSchema = z.object({
  id: nonEmptyString,
  product: z.union([productSchema, accessorySchema]),
  quantity: positiveQuantity,
  required: z.boolean(),
  sortOrder: z.number().int().optional(),
  itemType: packageLineItemTypeSchema.optional(),
  sku: z.string().optional(),
  productId: z.string().optional(),
  accessoryIds: z.array(z.string()).optional(),
  metadata: packageMetadataSchema.optional(),
}) as z.ZodType<PackageLine>;

export const packageDefinitionSchema = baseEntityObjectSchema.extend({
  verticalIds: z.array(nonEmptyString).min(1),
  categoryIds: z.array(z.string()).optional(),
  vehicleIds: z.array(z.string()).optional(),
  lines: z.array(packageLineSchema).min(1),
  requiredAccessories: z.array(accessorySchema).optional(),
  optionalAccessories: z.array(accessorySchema).optional(),
  metadata: packageMetadataSchema.optional(),
}) as z.ZodType<PackageDefinition>;

export const packageSchema = packageDefinitionSchema as z.ZodType<Package>;

export const packageAssemblyInputSchema = z.object({
  packageId: z.string().optional(),
  definition: packageDefinitionSchema.optional(),
  selectedOptionalAccessoryIds: z.array(z.string()).optional(),
  vehicle: vehicleSchema.optional(),
  fitment: z.array(fitmentSchema).optional(),
  metadata: packageMetadataSchema.optional(),
}).refine((input) => Boolean(input.packageId || input.definition), { message: 'Package assembly requires packageId or definition.' }) as z.ZodType<PackageAssemblyInput>;

export const packageCompatibilityIssueSchema = z.object({
  code: nonEmptyString,
  severity: packageValidationSeveritySchema,
  message: nonEmptyString,
  lineId: z.string().optional(),
  productId: z.string().optional(),
  accessoryId: z.string().optional(),
  vehicleId: z.string().optional(),
  fieldPath: z.string().optional(),
}) as z.ZodType<PackageCompatibilityIssue>;

export const packageCompatibilityResultSchema = z.object({
  status: packageCompatibilityStatusSchema,
  compatible: z.boolean(),
  issues: z.array(packageCompatibilityIssueSchema),
}) as z.ZodType<PackageCompatibilityResult>;

export const packageAssemblyResultSchema = z.object({
  status: packageAssemblyStatusSchema,
  package: packageDefinitionSchema.nullable(),
  compatibility: packageCompatibilityResultSchema,
  selectedOptionalAccessories: z.array(accessorySchema),
  requiredAccessories: z.array(accessorySchema),
  warnings: z.array(packageCompatibilityIssueSchema).optional(),
}) as z.ZodType<PackageAssemblyResult>;

export const packageValidationResultSchema = z.object({
  valid: z.boolean(),
  issues: z.array(packageCompatibilityIssueSchema),
}) as z.ZodType<PackageValidationResult>;
