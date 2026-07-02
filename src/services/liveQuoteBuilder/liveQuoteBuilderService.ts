import { quotePipelineService, type QuotePipelineService } from '@/services/quotePipeline';
import { quoteBuilderService, type QuoteBuilderService } from '@/services/quoteBuilder';
import { quotePdfService, type QuotePdfService } from '@/services/quotePdf';
import { liveQuoteBuilderRequestSchema, liveQuoteBuilderResultSchema } from '@/schemas/quote.schema';
import type { LiveQuoteBuilderRequest, LiveQuoteBuilderResult, Quote, QuoteDraft, QuoteLine, QuotePricingReference, ReviewFlag } from '@/types';

export interface LiveQuoteBuilderServiceDependencies {
  quotePipeline: QuotePipelineService;
  quoteBuilder: QuoteBuilderService;
  quotePdf: QuotePdfService;
}

export interface LiveQuoteBuilderService {
  generateQuote(input: LiveQuoteBuilderRequest): Promise<LiveQuoteBuilderResult>;
}

const defaultDependencies: LiveQuoteBuilderServiceDependencies = {
  quotePipeline: quotePipelineService,
  quoteBuilder: quoteBuilderService,
  quotePdf: quotePdfService,
};

function reviewFlag(code: string, severity: ReviewFlag['severity'], message: string, source: ReviewFlag['source'], fieldPath?: string): ReviewFlag {
  return fieldPath ? { code, severity, message, source, fieldPath } : { code, severity, message, source };
}

function statusFrom(flags: ReviewFlag[], pipelineStatus: LiveQuoteBuilderResult['pipeline']['status'], quote: Quote | null): LiveQuoteBuilderResult['status'] {
  if (flags.some((flag) => flag.severity === 'error')) return 'invalid';
  if (!quote) return pipelineStatus === 'unavailable' ? 'unavailable' : 'invalid';
  if (pipelineStatus === 'unavailable') return 'unavailable';
  if (pipelineStatus === 'assembled') return 'priced';
  return 'pending';
}

function buildPricingReference(draft: QuoteDraft, pricing: LiveQuoteBuilderResult['pricing']): QuotePricingReference {
  return {
    ...draft.pricingReference,
    status: pricing.status,
    result: pricing.data ?? draft.pricingReference?.result,
    warnings: pricing.warnings?.map((warning) => reviewFlag(warning.code, warning.severity, warning.message, 'pricing', warning.fieldPath)),
  };
}

function applyPricingToLines(draft: QuoteDraft, pricing: LiveQuoteBuilderResult['pricing']): QuoteLine[] {
  return draft.lines.map((line) => {
    const pricedLine = pricing.data?.lines.find((candidate) => candidate.id === line.id || (line.sku && candidate.sku === line.sku));
    if (!pricedLine?.sellingPrice) return line;

    return {
      ...line,
      pricingReference: {
        ...line.pricingReference,
        status: pricing.status,
        subject: { sku: pricedLine.sku, productId: pricedLine.productId },
        result: pricing.data ?? undefined,
        warnings: pricedLine.warnings?.map((warning) => reviewFlag(warning.code, warning.severity, warning.message, 'pricing', warning.fieldPath)),
      },
      price: { amount: pricedLine.sellingPrice.amount / pricedLine.quantity, currencyCode: pricedLine.sellingPrice.currencyCode },
      subtotal: pricedLine.sellingPrice,
      reviewFlags: pricedLine.warnings?.map((warning) => reviewFlag(warning.code, warning.severity, warning.message, 'pricing', warning.fieldPath)),
    };
  });
}

function materializeQuote(draft: QuoteDraft, pricing: LiveQuoteBuilderResult['pricing'], reviewFlags: ReviewFlag[]): Quote {
  return {
    id: draft.id,
    label: draft.label,
    customerId: draft.customer.customerId,
    customer: draft.customer,
    verticalId: draft.verticalId,
    status: reviewFlags.some((flag) => flag.severity === 'error') ? 'invalid' : 'priced',
    approvalStatus: draft.workflow.approvalStatus,
    workflow: { ...draft.workflow, status: 'ready-for-review', reviewFlags },
    lines: applyPricingToLines(draft, pricing),
    packageReferences: draft.packageReferences,
    pricingReference: buildPricingReference(draft, pricing),
    reviewFlags,
    total: pricing.data?.subtotal,
    metadata: draft.metadata,
  };
}

export function createLiveQuoteBuilderService(dependencies: Partial<LiveQuoteBuilderServiceDependencies> = {}): LiveQuoteBuilderService {
  const services = { ...defaultDependencies, ...dependencies };

  return {
    async generateQuote(input) {
      const validated = liveQuoteBuilderRequestSchema.parse(input);
      const validation = await services.quoteBuilder.validateQuote(validated);
      const validationFlags = validation.reviewFlags ?? [];
      const pipeline = await services.quotePipeline.assembleQuote(validated);
      const draft = pipeline.quote.draft;
      const reviewFlags = [...validationFlags, ...pipeline.reviewFlags];
      const pdfValidation = draft ? services.quotePdf.validateQuotePdfInput({
        draft,
        documentMetadata: {
          title: `Quote ${draft.id}`,
          templateId: 'live-quote-builder',
          currencyCode: pipeline.pricing.data?.subtotal.currencyCode,
        },
        options: { includePricing: true, includePackageDetails: true, includeReviewFlags: true },
      }) : undefined;

      for (const error of pdfValidation?.errors ?? []) {
        reviewFlags.push(reviewFlag(error.code, 'review-required', error.message, 'quote-builder', error.fieldPath));
      }

      const quote = draft ? materializeQuote(draft, pipeline.pricing, reviewFlags) : null;

      return liveQuoteBuilderResultSchema.parse({
        status: statusFrom(reviewFlags, pipeline.status, quote),
        quote,
        draft,
        pipeline,
        packageReferences: pipeline.packageReferences,
        pricing: pipeline.pricing,
        commerceReferences: pipeline.commerceReferences,
        reviewFlags,
        pdfReady: pdfValidation?.valid ?? false,
      });
    },
  };
}

export const liveQuoteBuilderService: LiveQuoteBuilderService = createLiveQuoteBuilderService();
