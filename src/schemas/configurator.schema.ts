import { z } from 'zod';
import type { CompatibilityRule, Configurator, ConfiguratorAccessoryItem, ConfiguratorOption, ConfiguratorSection, ConfiguratorSkuOption, ConfiguratorStep, ConfiguratorVehicleRule, DependencyMatrixCondition, DependencyMatrixEffect, DependencyMatrixRule, DependencyRule, SKUOption } from '@/types';
import { baseEntityObjectSchema, moneySchema } from './common.schema';
import { fitmentSchema } from './vehicle.schema';

export const dependencyRuleSchema = z.object({
  sourceOptionId: z.string(),
  targetOptionId: z.string(),
  condition: z.string(),
  message: z.string().optional(),
}) as z.ZodType<DependencyRule>;

export const compatibilityRuleSchema = z.object({
  id: z.string(),
  optionIds: z.array(z.string()),
  fitment: fitmentSchema.optional(),
  compatible: z.boolean(),
  message: z.string().optional(),
}) as z.ZodType<CompatibilityRule>;

export const skuOptionSchema = baseEntityObjectSchema.extend({
  sku: z.string(),
  attributes: z.record(z.string()).optional(),
  priceAdjustment: moneySchema.optional(),
}) as z.ZodType<SKUOption>;

export const configuratorOptionSchema = baseEntityObjectSchema.extend({
  skuOption: skuOptionSchema.optional(),
  selectedByDefault: z.boolean().optional(),
  dependencyRules: z.array(dependencyRuleSchema).optional(),
  compatibilityRules: z.array(compatibilityRuleSchema).optional(),
  skuSegment: z.string().optional(),
  _verification: z.string().optional(),
  auto_bundle: z.array(z.string()).optional(),
  warning: z.string().optional(),
}) as z.ZodType<ConfiguratorOption>;

export const configuratorStepSchema = baseEntityObjectSchema.extend({
  required: z.boolean().optional(),
  skuSegmentKey: z.string().optional(),
  _verification: z.string().optional(),
  options: z.array(configuratorOptionSchema),
  dependencies: z.record(z.array(z.string())).optional(),
}) as z.ZodType<ConfiguratorStep>;

export const configuratorAccessoryItemSchema = baseEntityObjectSchema.extend({
  sku: z.string().optional(),
  price: z.number().optional(),
  type: z.string().optional(),
  _note: z.string().optional(),
}) as z.ZodType<ConfiguratorAccessoryItem>;

export const configuratorSectionSchema = baseEntityObjectSchema.extend({
  sortOrder: z.number(),
  options: z.array(configuratorOptionSchema),
  steps: z.array(configuratorStepSchema).optional(),
  items: z.array(configuratorAccessoryItemSchema).optional(),
}) as z.ZodType<ConfiguratorSection>;

export const configuratorSkuOptionSchema = z.object({
  sku: z.string(),
  description: z.string().optional(),
  price: z.number().optional(),
  attributes: z.record(z.string()),
}) as z.ZodType<ConfiguratorSkuOption>;

export const configuratorVehicleRuleSchema = z.object({
  vehicleId: z.string().optional(),
  displayName: z.string().optional(),
  recommendedLength: z.string().optional(),
}) as z.ZodType<ConfiguratorVehicleRule>;

export const dependencyMatrixConditionSchema = z.object({
  step: z.string(),
  option: z.array(z.string()),
}) as z.ZodType<DependencyMatrixCondition>;

export const dependencyMatrixEffectSchema = z.object({
  step: z.string().optional(),
  limitOptionsTo: z.array(z.string()).optional(),
  disables: z.array(z.string()).optional(),
  disableOptionsUnless: z.object({
    option: z.string(),
    exceptionStep: z.string(),
    exceptionOption: z.string(),
  }).optional(),
  warn: z.boolean().optional(),
}) as z.ZodType<DependencyMatrixEffect>;

export const dependencyMatrixRuleSchema = z.object({
  id: z.string(),
  if: dependencyMatrixConditionSchema,
  then: dependencyMatrixEffectSchema,
  message: z.string().optional(),
}) as z.ZodType<DependencyMatrixRule>;

export const configuratorSchema = baseEntityObjectSchema.extend({
  productId: z.string(),
  verticalIds: z.array(z.string()),
  sections: z.array(configuratorSectionSchema),
  sectionMap: z.record(configuratorSectionSchema).optional(),
  skuOptions: z.array(configuratorSkuOptionSchema).optional(),
  vehicleRules: z.array(configuratorVehicleRuleSchema).optional(),
  productFamily: z.string().optional(),
  priceDisplay: z.string().optional(),
  dependencyRules: z.array(dependencyRuleSchema).optional(),
  compatibilityRules: z.array(compatibilityRuleSchema).optional(),
  family: z.string().optional(),
  collection: z.string().optional(),
  pricing_model: z.string().optional(),
  dependencyMatrix: z.array(dependencyMatrixRuleSchema).optional(),
}) as z.ZodType<Configurator>;
