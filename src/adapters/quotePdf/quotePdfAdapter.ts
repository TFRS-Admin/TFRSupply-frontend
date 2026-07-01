import type { QuotePdfRenderInput, QuotePdfRenderResult, ReviewFlag } from '@/types';
import { unavailableQuotePdfRenderer } from './quotePdfRenderer';
import type { QuotePdfRenderer } from './quotePdfRenderer';

export interface QuotePdfAdapter {
  renderQuotePdf(input: QuotePdfRenderInput): Promise<QuotePdfRenderResult>;
}

export function createQuotePdfAdapter(renderer: QuotePdfRenderer = unavailableQuotePdfRenderer): QuotePdfAdapter {
  return {
    async renderQuotePdf(input) {
      const reviewFlags: ReviewFlag[] = [...(input.draft.reviewFlags ?? [])];
      const output = await renderer.renderDocument(input);

      if (output.status === 'failed') {
        const unavailable = output.errors.some((error) => error.code === 'QUOTE_PDF_RENDERER_UNAVAILABLE');
        return {
          status: unavailable ? 'unavailable' : 'failed',
          documentMetadata: null,
          reviewFlags,
          errors: output.errors,
        };
      }

      return {
        status: 'rendered',
        documentMetadata: output.documentMetadata,
        reviewFlags,
        errors: [],
      };
    },
  };
}

export const unavailableQuotePdfAdapter: QuotePdfAdapter = createQuotePdfAdapter(unavailableQuotePdfRenderer);
