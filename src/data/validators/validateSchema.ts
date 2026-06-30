import type { z } from 'zod';
import {
  ProductDataValidationError,
  type ProductDataValidationContext,
  zodIssuesToProductDataIssues,
} from './validationError';

export function validateProductData<T>(
  schema: z.ZodType<T>,
  value: unknown,
  context: ProductDataValidationContext,
): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ProductDataValidationError(
      zodIssuesToProductDataIssues(result.error.issues, context),
    );
  }

  return result.data;
}
