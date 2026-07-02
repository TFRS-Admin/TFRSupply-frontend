# Email Notification Service

The Email Notification Service defines an architecture-only boundary for quote workflow email notifications. It validates notification requests, maps existing quote approval workflow actions to notification events, and establishes a provider adapter contract without sending real email.

## Scope

Supported quote workflow events:

- Quote submitted for review
- Reviewer assigned
- Quote approved
- Quote rejected
- Changes requested
- Approval cancelled

Out of scope:

- SMTP, SendGrid, Mailgun, SES, or any other delivery provider
- Real email delivery
- Authentication, authorization, UI wiring, routing, or quote workflow behavior changes

## Architecture

```text
future quote workflow hooks
  → emailNotificationService
  → EmailProviderAdapter
  → future provider implementation
```

The default provider is `unavailableEmailProviderAdapter`, which returns an explicit `unavailable` result for non-dry-run delivery attempts. The service defaults notification requests to dry-run mode and returns `queued` after validation so tests and future orchestration can exercise contracts without sending email.

## Contracts

- `src/types/notification.ts` owns notification event, recipient, request, result, template, context, and approval-action mapping types.
- `src/schemas/quote.schema.ts` owns the runtime Zod schemas for request and result validation.
- `src/adapters/emailNotification/emailProviderAdapter.ts` owns the delivery adapter interface and unavailable adapter.
- `src/services/emailNotification/emailNotificationService.ts` owns template contracts, quote approval event mapping, recipient derivation, request validation, and provider delegation.
- `src/hooks/emailNotification/useEmailNotification.ts` exposes typed React hooks for future UI integration without wiring them into existing routes.

## Event mapping

| Quote approval action | Notification event | Template contract |
| --- | --- | --- |
| `submit-for-review` | `quote.submitted_for_review` | `quote-submitted-for-review-v1` |
| `assign-reviewer` | `quote.reviewer_assigned` | `quote-reviewer-assigned-v1` |
| `approve` | `quote.approved` | `quote-approved-v1` |
| `reject` | `quote.rejected` | `quote-rejected-v1` |
| `request-changes` | `quote.changes_requested` | `quote-changes-requested-v1` |
| `cancel-approval` | `quote.approval_cancelled` | `quote-approval-cancelled-v1` |

## Runtime behavior

This service is additive and unwired. Existing quote submission, approval, persistence, PDF, checkout, Shopify, and UI behavior remain unchanged. Future provider work should implement `EmailProviderAdapter` behind the same contract and keep delivery concerns outside quote approval state transitions.
