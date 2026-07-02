import type { Quote, QuoteApprovalActionType, QuoteApprovalAuditEvent, QuoteReviewerAssignment, ReviewFlag } from './quote';

export type EmailNotificationEventType =
  | 'quote.submitted_for_review'
  | 'quote.reviewer_assigned'
  | 'quote.approved'
  | 'quote.rejected'
  | 'quote.changes_requested'
  | 'quote.approval_cancelled';

export type EmailNotificationStatus = 'queued' | 'skipped' | 'failed' | 'unavailable';
export type EmailNotificationRecipientRole = 'requestor' | 'reviewer' | 'sales' | 'manager' | 'observer';

export interface EmailNotificationRecipient {
  email: string;
  name?: string;
  role?: EmailNotificationRecipientRole;
  userId?: string;
}

export interface EmailNotificationTemplateContract {
  id: string;
  eventType: EmailNotificationEventType;
  subject: string;
  requiredFields: string[];
  description?: string;
}

export interface EmailNotificationContext {
  quote: Quote;
  actorId?: string;
  occurredAt?: string;
  auditEvent?: QuoteApprovalAuditEvent;
  reviewerAssignment?: QuoteReviewerAssignment;
  reason?: string;
  note?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface EmailNotificationRequest {
  id?: string;
  eventType: EmailNotificationEventType;
  recipients: EmailNotificationRecipient[];
  templateId?: string;
  context: EmailNotificationContext;
  dryRun?: boolean;
}

export interface EmailNotificationResult {
  status: EmailNotificationStatus;
  requestId: string;
  eventType: EmailNotificationEventType;
  templateId: string;
  recipients: EmailNotificationRecipient[];
  providerMessageId?: string;
  reviewFlags: ReviewFlag[];
  error?: string;
}

export interface QuoteNotificationEventMapping {
  actionType: QuoteApprovalActionType;
  eventType: EmailNotificationEventType;
  templateId: string;
  defaultRecipientRoles: EmailNotificationRecipientRole[];
}
