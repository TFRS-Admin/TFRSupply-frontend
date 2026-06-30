import { z } from 'zod';
import type { CompatibilityRule, Configurator, ConfiguratorOption, ConfiguratorSection, DependencyRule, SKUOption } from '@/types';
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
}) as z.ZodType<ConfiguratorOption>;

export const configuratorSectionSchema = baseEntityObjectSchema.extend({
  sortOrder: z.number(),
  options: z.array(configuratorOptionSchema),
}) as z.ZodType<ConfiguratorSection>;

export const configuratorSchema = baseEntityObjectSchema.extend({
  productId: z.string(),
  verticalIds: z.array(z.string()),
  sections: z.array(configuratorSectionSchema),
  dependencyRules: z.array(dependencyRuleSchema).optional(),
  compatibilityRules: z.array(compatibilityRuleSchema).optional(),
}) as z.ZodType<Configurator>;
