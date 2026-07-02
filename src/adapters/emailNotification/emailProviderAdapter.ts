import type { EmailNotificationRequest, EmailNotificationResult, ReviewFlag } from '@/types';

export interface EmailProviderAdapter {
  sendNotification(request: EmailNotificationRequest): Promise<EmailNotificationResult>;
}

function unavailableFlag(): ReviewFlag {
  return {
    code: 'email.provider_unavailable',
    severity: 'info',
    message: 'Email provider delivery is unavailable in the architecture-only notification service.',
    source: 'unknown',
  };
}

export const unavailableEmailProviderAdapter: EmailProviderAdapter = {
  async sendNotification(request) {
    return {
      status: 'unavailable',
      requestId: request.id ?? `${request.context.quote.id}:${request.eventType}`,
      eventType: request.eventType,
      templateId: request.templateId ?? request.eventType,
      recipients: request.recipients,
      reviewFlags: [unavailableFlag()],
    };
  },
};
