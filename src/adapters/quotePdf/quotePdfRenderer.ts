import type { QuotePdfRenderInput, QuotePdfRenderOutput } from '@/types';

export interface QuotePdfRenderer {
  renderDocument(input: QuotePdfRenderInput): Promise<QuotePdfRenderOutput>;
}

const rendererUnavailableMessage = 'Quote PDF renderer is not connected.';

export const unavailableQuotePdfRenderer: QuotePdfRenderer = {
  async renderDocument() {
    return {
      status: 'failed',
      documentMetadata: null,
      errors: [{ code: 'QUOTE_PDF_RENDERER_UNAVAILABLE', message: rendererUnavailableMessage }],
    };
  },
};
