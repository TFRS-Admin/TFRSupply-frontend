import type { QuoteAssemblyInput, QuoteAssemblyResult, QuoteDraft, QuoteLine, QuoteValidationResult, ReviewFlag } from '@/types';
import type { QuoteBuilderAdapter } from './quoteBuilderAdapter';

function draftLine(input: QuoteAssemblyInput['lines'][number], index: number): QuoteLine {
  return {
    id: input.id ?? `line-${index + 1}`,
    sku: input.sku,
    productId: input.productId,
    label: input.label,
    quantity: input.quantity,
    lineType: input.lineType,
    packageReference: input.packageReference,
    pricingReference: input.pricingReference,
    metadata: input.metadata,
  };
}

function validateAssemblyInput(input: QuoteAssemblyInput): ReviewFlag[] {
  const flags: ReviewFlag[] = [];
  if (!input.customer?.contactEmail && !input.customer?.customerId) {
    flags.push({
      code: 'quote-builder.missing-customer-identity',
      severity: 'warning',
      message: 'Quote customer is missing a customer ID or contact email.',
      source: 'quote-builder',
      fieldPath: 'customer',
    });
  }
  return flags;
}

/**
 * In-memory QuoteBuilderAdapter: assembles a QuoteDraft deterministically from a
 * validated QuoteAssemblyInput and keeps drafts in a process-local Map. It does not
 * persist across sessions or connect to a real quote data source; it exists so
 * callers (for example liveQuoteBuilderService) can exercise draft assembly without
 * waiting on the unavailable default adapter.
 */
export function createInMemoryQuoteBuilderAdapter(): QuoteBuilderAdapter {
  const drafts = new Map<string, QuoteDraft>();

  function toDraft(input: QuoteAssemblyInput): QuoteDraft {
    const id = input.draftId ?? `draft-${drafts.size + 1}`;
    return {
      id,
      label: input.customer?.agencyName ? `Quote for ${input.customer.agencyName}` : `Quote ${id}`,
      customer: input.customer,
      verticalId: input.verticalId,
      vehicle: input.vehicle,
      lines: input.lines.map(draftLine),
      packageReferences: input.packageReferences,
      pricingReference: input.pricingReference,
      workflow: {
        status: input.workflow?.status ?? 'assembling',
        approvalStatus: input.workflow?.approvalStatus ?? 'draft',
        reviewFlags: input.workflow?.reviewFlags ?? [],
      },
      metadata: input.metadata,
    };
  }

  return {
    async getDraft(draftId) {
      return drafts.get(draftId) ?? null;
    },
    async saveDraft(draft) {
      drafts.set(draft.id, draft);
      return draft;
    },
    async assembleQuote(input): Promise<QuoteAssemblyResult> {
      const reviewFlags = validateAssemblyInput(input);
      const draft = toDraft(input);
      drafts.set(draft.id, draft);
      return { status: 'assembled', draft, reviewFlags };
    },
    async validateQuote(input): Promise<QuoteValidationResult> {
      const reviewFlags = validateAssemblyInput(input);
      return { valid: reviewFlags.every((flag) => flag.severity !== 'error'), reviewFlags };
    },
  };
}

export const inMemoryQuoteBuilderAdapter: QuoteBuilderAdapter = createInMemoryQuoteBuilderAdapter();
