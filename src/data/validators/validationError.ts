import type { z } from 'zod';

export interface ProductDataValidationContext {
  filename: string;
  id?: string;
  productId?: string;
  sku?: string;
}

export interface ProductDataValidationIssue extends ProductDataValidationContext {
  fieldPath: string;
  message: string;
}

export class ProductDataValidationError extends Error {
  readonly issues: ProductDataValidationIssue[];

  constructor(issues: ProductDataValidationIssue[]) {
    super(formatValidationIssues(issues));
    this.name = 'ProductDataValidationError';
    this.issues = issues;
  }
}

export function formatValidationIssues(issues: ProductDataValidationIssue[]): string {
  return issues
    .map((issue) => {
      const identity = [
        `file=${issue.filename}`,
        issue.productId ? `productId=${issue.productId}` : undefined,
        issue.id ? `id=${issue.id}` : undefined,
        issue.sku ? `sku=${issue.sku}` : undefined,
        `field=${issue.fieldPath || '<root>'}`,
      ]
        .filter(Boolean)
        .join(' ');

      return `${identity}: ${issue.message}`;
    })
    .join('\n');
}

export function zodIssuesToProductDataIssues(
  zodIssues: z.ZodIssue[],
  context: ProductDataValidationContext,
): ProductDataValidationIssue[] {
  return zodIssues.map((issue) => ({
    ...context,
    fieldPath: issue.path.map(String).join('.'),
    message: issue.message,
  }));
}
