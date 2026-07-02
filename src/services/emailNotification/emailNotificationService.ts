import { unavailableEmailProviderAdapter, type EmailProviderAdapter } from '@/adapters/emailNotification';
import { quoteApprovalService, type QuoteApprovalService } from '@/services/quoteApproval';
import { quotePersistenceService, type QuotePersistenceService } from '@/services/quotePersistence';
import { emailNotificationRequestSchema, emailNotificationResultSchema } from '@/schemas/quote.schema';
import type {
  EmailNotificationEventType,
  EmailNotificationRecipient,
  EmailNotificationRequest,
  EmailNotificationResult,
  EmailNotificationTemplateContract,
  QuoteApprovalActionType,
  QuoteNotificationEventMapping,
} from '@/types';

export interface EmailNotificationServiceDependencies {
  provider?: EmailProviderAdapter;
  approval?: QuoteApprovalService;
  persistence?: QuotePersistenceService;
}

export interface EmailNotificationService {
  templates: EmailNotificationTemplateContract[];
  eventMappings: QuoteNotificationEventMapping[];
  notify(request: EmailNotificationRequest): Promise<EmailNotificationResult>;
  mapApprovalAction(actionType: QuoteApprovalActionType): QuoteNotificationEventMapping;
  recipientsForQuote(request: Pick<EmailNotificationRequest, 'context'>): EmailNotificationRecipient[];
}

export const quoteNotificationTemplates: EmailNotificationTemplateContract[] = [
  { id: 'quote-submitted-for-review-v1', eventType: 'quote.submitted_for_review', subject: 'Quote submitted for review', requiredFields: ['quote.id', 'quote.label'] },
  { id: 'quote-reviewer-assigned-v1', eventType: 'quote.reviewer_assigned', subject: 'Quote reviewer assigned', requiredFields: ['quote.id', 'reviewerAssignment.reviewerId'] },
  { id: 'quote-approved-v1', eventType: 'quote.approved', subject: 'Quote approved', requiredFields: ['quote.id'] },
  { id: 'quote-rejected-v1', eventType: 'quote.rejected', subject: 'Quote rejected', requiredFields: ['quote.id', 'reason'] },
  { id: 'quote-changes-requested-v1', eventType: 'quote.changes_requested', subject: 'Quote changes requested', requiredFields: ['quote.id', 'reason'] },
  { id: 'quote-approval-cancelled-v1', eventType: 'quote.approval_cancelled', subject: 'Quote approval cancelled', requiredFields: ['quote.id'] },
];

export const quoteNotificationEventMappings: QuoteNotificationEventMapping[] = [
  { actionType: 'submit-for-review', eventType: 'quote.submitted_for_review', templateId: 'quote-submitted-for-review-v1', defaultRecipientRoles: ['reviewer', 'sales'] },
  { actionType: 'assign-reviewer', eventType: 'quote.reviewer_assigned', templateId: 'quote-reviewer-assigned-v1', defaultRecipientRoles: ['reviewer'] },
  { actionType: 'approve', eventType: 'quote.approved', templateId: 'quote-approved-v1', defaultRecipientRoles: ['requestor', 'sales'] },
  { actionType: 'reject', eventType: 'quote.rejected', templateId: 'quote-rejected-v1', defaultRecipientRoles: ['requestor', 'sales'] },
  { actionType: 'request-changes', eventType: 'quote.changes_requested', templateId: 'quote-changes-requested-v1', defaultRecipientRoles: ['requestor', 'sales'] },
  { actionType: 'cancel-approval', eventType: 'quote.approval_cancelled', templateId: 'quote-approval-cancelled-v1', defaultRecipientRoles: ['requestor', 'reviewer'] },
];

function templateFor(eventType: EmailNotificationEventType): EmailNotificationTemplateContract {
  return quoteNotificationTemplates.find((template) => template.eventType === eventType) ?? quoteNotificationTemplates[0];
}

export function createEmailNotificationService(dependencies: EmailNotificationServiceDependencies = {}): EmailNotificationService {
  const provider = dependencies.provider ?? unavailableEmailProviderAdapter;
  void (dependencies.approval ?? quoteApprovalService);
  void (dependencies.persistence ?? quotePersistenceService);

  return {
    templates: quoteNotificationTemplates,
    eventMappings: quoteNotificationEventMappings,
    mapApprovalAction(actionType) {
      const mapping = quoteNotificationEventMappings.find((entry) => entry.actionType === actionType);
      if (!mapping) throw new Error(`Unsupported quote approval action for notifications: ${actionType}`);
      return mapping;
    },
    recipientsForQuote({ context }) {
      const recipients: EmailNotificationRecipient[] = [];
      if (context.quote.customer?.contactEmail) {
        recipients.push({ email: context.quote.customer.contactEmail, name: context.quote.customer.contactName, role: 'requestor', userId: context.quote.customer.customerId });
      }
      if (context.reviewerAssignment?.reviewerId) {
        recipients.push({ email: `${context.reviewerAssignment.reviewerId}@example.invalid`, role: 'reviewer', userId: context.reviewerAssignment.reviewerId });
      }
      return recipients;
    },
    async notify(request) {
      const template = templateFor(request.eventType);
      const validated = emailNotificationRequestSchema.parse({ ...request, templateId: request.templateId ?? template.id, dryRun: request.dryRun ?? true });
      if (validated.recipients.length === 0) {
        return emailNotificationResultSchema.parse({ status: 'skipped', requestId: validated.id ?? `${validated.context.quote.id}:${validated.eventType}`, eventType: validated.eventType, templateId: validated.templateId ?? template.id, recipients: [], reviewFlags: [] });
      }
      if (validated.dryRun) {
        return emailNotificationResultSchema.parse({ status: 'queued', requestId: validated.id ?? `${validated.context.quote.id}:${validated.eventType}`, eventType: validated.eventType, templateId: validated.templateId ?? template.id, recipients: validated.recipients, reviewFlags: [] });
      }
      return emailNotificationResultSchema.parse(await provider.sendNotification(validated));
    },
  };
}

export const emailNotificationService = createEmailNotificationService();
