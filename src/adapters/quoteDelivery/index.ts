/**
 * adapters/quoteDelivery/index.ts
 * Live singleton wiring `createQuoteDeliveryAdapter` to `appConfig`.
 * quoteRequestService.js imports from here; tests import the factory
 * directly from `./quoteDeliveryAdapter` to inject a fake fetch/openMailto.
 */

import appConfig from '@/config/appConfig';
import { createQuoteDeliveryAdapter } from './quoteDeliveryAdapter';

export const quoteDeliveryAdapter = createQuoteDeliveryAdapter({
  endpoint: appConfig.quoteDeliveryEndpoint || undefined,
  recipientEmail: appConfig.quoteRecipientEmail,
});

export * from './quoteDeliveryAdapter';
