import { quotePersistenceService, type QuotePersistenceService } from '@/services/quotePersistence';
import {
  approveQuoteInputSchema,
  assignQuoteReviewerInputSchema,
  cancelQuoteApprovalInputSchema,
  quoteApprovalActionResultSchema,
  rejectQuoteInputSchema,
  requestQuoteChangesInputSchema,
  submitQuoteForReviewInputSchema,
} from '@/schemas/quote.schema';
import type {
  ApproveQuoteInput,
  AssignQuoteReviewerInput,
  CancelQuoteApprovalInput,
  Quote,
  QuoteApprovalActionResult,
  QuoteApprovalActionType,
  QuoteApprovalAuditEvent,
  QuoteApprovalStatus,
  QuoteReviewerAssignment,
  QuoteRevisionMetadata,
  QuoteWorkflowStatus,
  RejectQuoteInput,
  RequestQuoteChangesInput,
  ReviewFlag,
  SubmitQuoteForReviewInput,
} from '@/types';

export interface QuoteApprovalService {
  submitForReview(input: SubmitQuoteForReviewInput): Promise<QuoteApprovalActionResult>;
  assignReviewer(input: AssignQuoteReviewerInput): Promise<QuoteApprovalActionResult>;
  approveQuote(input: ApproveQuoteInput): Promise<QuoteApprovalActionResult>;
  rejectQuote(input: RejectQuoteInput): Promise<QuoteApprovalActionResult>;
  requestChanges(input: RequestQuoteChangesInput): Promise<QuoteApprovalActionResult>;
  cancelApproval(input: CancelQuoteApprovalInput): Promise<QuoteApprovalActionResult>;
}

interface TransitionTarget {
  status: QuoteWorkflowStatus;
  approvalStatus: QuoteApprovalStatus;
}

const transitionMap: Record<QuoteApprovalActionType, Partial<Record<QuoteWorkflowStatus, TransitionTarget>>> = {
  'submit-for-review': {
    draft: { status: 'in-review', approvalStatus: 'pending-review' },
    assembling: { status: 'in-review', approvalStatus: 'pending-review' },
    'ready-for-review': { status: 'in-review', approvalStatus: 'pending-review' },
    rejected: { status: 'in-review', approvalStatus: 'pending-review' },
  },
  'assign-reviewer': {
    'ready-for-review': { status: 'in-review', approvalStatus: 'pending-review' },
    'in-review': { status: 'in-review', approvalStatus: 'pending-review' },
  },
  approve: {
    'in-review': { status: 'approved', approvalStatus: 'approved' },
  },
  reject: {
    'in-review': { status: 'rejected', approvalStatus: 'rejected' },
  },
  'request-changes': {
    'in-review': { status: 'ready-for-review', approvalStatus: 'changes-requested' },
  },
  'cancel-approval': {
    'ready-for-review': { status: 'cancelled', approvalStatus: 'draft' },
    'in-review': { status: 'cancelled', approvalStatus: 'draft' },
  },
};

function reviewFlag(code: string, message: string): ReviewFlag {
  return { code, severity: 'error', message, source: 'approval' };
}

function appendAudit(existing: Quote, event: QuoteApprovalAuditEvent): QuoteApprovalAuditEvent[] {
  return [...(existing.workflow?.auditTrail ?? []), event];
}

function reviewerAssignment(input: AssignQuoteReviewerInput['reviewer'] | SubmitQuoteForReviewInput['reviewer'] | undefined, occurredAt: string): QuoteReviewerAssignment | undefined {
  if (!input) return undefined;
  return { ...input, assignedAt: input.assignedAt ?? occurredAt };
}

function eventId(type: QuoteApprovalActionType, quoteId: string, version: number): string {
  return `${quoteId}:${version}:${type}`;
}

export function createQuoteApprovalService(persistence: QuotePersistenceService = quotePersistenceService): QuoteApprovalService {
  async function applyAction(
    type: QuoteApprovalActionType,
    input: SubmitQuoteForReviewInput | AssignQuoteReviewerInput | ApproveQuoteInput | RejectQuoteInput | RequestQuoteChangesInput | CancelQuoteApprovalInput,
    options: { reason?: string; reviewer?: QuoteReviewerAssignment } = {},
  ): Promise<QuoteApprovalActionResult> {
    const loaded = await persistence.loadQuote(input.quoteId);
    if (loaded.status === 'not-found' || !loaded.record) {
      return quoteApprovalActionResultSchema.parse({ status: 'not-found', quoteId: input.quoteId, expectedVersion: input.expectedVersion, reviewFlags: [] });
    }

    if (loaded.record.revision.version !== input.expectedVersion) {
      return quoteApprovalActionResultSchema.parse({
        status: 'conflict',
        quoteId: input.quoteId,
        expectedVersion: input.expectedVersion,
        currentVersion: loaded.record.revision.version,
        reviewFlags: [reviewFlag('approval.version_conflict', 'Quote approval action expected a different quote version.')],
      });
    }

    const quote = loaded.record.quote;
    const currentStatus = quote.workflow?.status ?? (quote.status as QuoteWorkflowStatus);
    const currentApprovalStatus = quote.workflow?.approvalStatus ?? quote.approvalStatus ?? 'draft';
    const target = transitionMap[type][currentStatus];

    if (!target) {
      return quoteApprovalActionResultSchema.parse({
        status: 'invalid-transition',
        quoteId: input.quoteId,
        expectedVersion: input.expectedVersion,
        currentVersion: loaded.record.revision.version,
        reviewFlags: [reviewFlag('approval.invalid_transition', `${type} is not allowed from ${currentStatus}.`)],
      });
    }

    const occurredAt = input.occurredAt ?? new Date().toISOString();
    const nextRevision: QuoteRevisionMetadata = {
      quoteId: input.quoteId,
      version: input.expectedVersion + 1,
      savedAt: occurredAt,
      savedBy: input.actorId,
      source: 'quote-approval',
      note: input.note,
    };

    const event: QuoteApprovalAuditEvent = {
      id: eventId(type, input.quoteId, nextRevision.version),
      quoteId: input.quoteId,
      type,
      actorId: input.actorId,
      occurredAt,
      fromStatus: currentStatus,
      toStatus: target.status,
      fromApprovalStatus: currentApprovalStatus,
      toApprovalStatus: target.approvalStatus,
      reviewerAssignment: options.reviewer,
      reason: options.reason,
      note: input.note,
      revision: nextRevision,
    };

    const workflow = {
      ...(quote.workflow ?? { status: currentStatus, approvalStatus: currentApprovalStatus }),
      status: target.status,
      approvalStatus: target.approvalStatus,
      submittedAt: type === 'submit-for-review' ? occurredAt : quote.workflow?.submittedAt,
      submittedBy: type === 'submit-for-review' ? input.actorId : quote.workflow?.submittedBy,
      reviewedAt: ['approve', 'reject', 'request-changes'].includes(type) ? occurredAt : quote.workflow?.reviewedAt,
      reviewedBy: ['approve', 'reject', 'request-changes'].includes(type) ? input.actorId : quote.workflow?.reviewedBy,
      approvedAt: type === 'approve' ? occurredAt : quote.workflow?.approvedAt,
      approvedBy: type === 'approve' ? input.actorId : quote.workflow?.approvedBy,
      rejectedAt: type === 'reject' ? occurredAt : quote.workflow?.rejectedAt,
      rejectedBy: type === 'reject' ? input.actorId : quote.workflow?.rejectedBy,
      changesRequestedAt: type === 'request-changes' ? occurredAt : quote.workflow?.changesRequestedAt,
      changesRequestedBy: type === 'request-changes' ? input.actorId : quote.workflow?.changesRequestedBy,
      cancelledAt: type === 'cancel-approval' ? occurredAt : quote.workflow?.cancelledAt,
      cancelledBy: type === 'cancel-approval' ? input.actorId : quote.workflow?.cancelledBy,
      reviewerAssignment: options.reviewer ?? quote.workflow?.reviewerAssignment,
      auditTrail: appendAudit(quote, event),
      reviewFlags: quote.workflow?.reviewFlags ?? [],
    };

    const updatedQuote: Quote = { ...quote, status: target.status, approvalStatus: target.approvalStatus, workflow };
    const updated = await persistence.updateQuote({ quoteId: input.quoteId, expectedVersion: input.expectedVersion, quote: updatedQuote, revision: nextRevision });

    if (updated.status !== 'updated' || !updated.record) {
      return quoteApprovalActionResultSchema.parse({ ...updated, reviewFlags: updated.status === 'conflict' ? [reviewFlag('approval.version_conflict', 'Quote approval action conflicted during update.')] : [] });
    }

    return quoteApprovalActionResultSchema.parse({
      status: 'updated',
      quoteId: input.quoteId,
      expectedVersion: input.expectedVersion,
      currentVersion: updated.currentVersion,
      state: { quote: updated.record.quote, revision: updated.record.revision, auditTrail: updated.record.quote.workflow?.auditTrail ?? [] },
      reviewFlags: [],
    });
  }

  return {
    submitForReview(input) {
      const validated = submitQuoteForReviewInputSchema.parse(input);
      const occurredAt = validated.occurredAt ?? new Date().toISOString();
      return applyAction('submit-for-review', validated, { reviewer: reviewerAssignment(validated.reviewer, occurredAt) });
    },
    assignReviewer(input) {
      const validated = assignQuoteReviewerInputSchema.parse(input);
      const occurredAt = validated.occurredAt ?? new Date().toISOString();
      return applyAction('assign-reviewer', validated, { reviewer: reviewerAssignment(validated.reviewer, occurredAt) });
    },
    approveQuote(input) {
      return applyAction('approve', approveQuoteInputSchema.parse(input));
    },
    rejectQuote(input) {
      const validated = rejectQuoteInputSchema.parse(input);
      return applyAction('reject', validated, { reason: validated.reason });
    },
    requestChanges(input) {
      const validated = requestQuoteChangesInputSchema.parse(input);
      return applyAction('request-changes', validated, { reason: validated.reason });
    },
    cancelApproval(input) {
      const validated = cancelQuoteApprovalInputSchema.parse(input);
      return applyAction('cancel-approval', validated, { reason: validated.reason });
    },
  };
}

export const quoteApprovalService: QuoteApprovalService = createQuoteApprovalService();
