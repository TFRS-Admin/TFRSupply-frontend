# Quote Request Flow

_Sprint 7 — Prototype. No Shopify, no admin page, no customer accounts._

---

## Architecture

```
UI Component (QuoteRequestPanel)
  │  submissionIdRef (stable per-tab, generated once via generateSubmissionId())
  │  (calls service only — never imports base44 directly)
  └─► quoteRequestService.submitQuoteRequest(payload)
        │  payload includes submissionId
        └─► adapters/base44/quoteRequestAdapter.submitViaBase44Email(payload)
              │  (only file that imports base44Client and appConfig)
              ├─► getOrCreateRecord(payload)                    ← idempotent on submissionId
              │     filter QuoteRequest by submissionId
              │     create only if not found
              ├─► base44.integrations.Core.SendEmail → quoteRecipientEmail
              └─► base44.integrations.Core.SendEmail → contact.email (if quoteSendConfirmation=true)
```

**Rule:** UI imports only `quoteRequestService`. The adapter is the only file that imports `base44Client` or `appConfig`.

---

## Files

| File | Role |
|---|---|
| `config/appConfig.js` | Frontend config: recipient email, confirmation toggle, sender name. No secrets. |
| `entities/QuoteRequest.json` | Base44 entity schema — persists every submitted quote |
| `services/quoteRequestService.js` | Payload builder, form validator, submission entry point |
| `adapters/base44/quoteRequestAdapter.js` | Storage + SendEmail — swap this to change delivery mechanism |
| `components/configurator/ConfiguratorLayout.jsx` | Responsive two-column → single-column layout wrapper |
| `components/configurator/QuoteRequestPanel.jsx` | Form UI + gating logic — calls service only |

---

## Config Pattern

All configurable values live in `config/appConfig.js`:

```js
const appConfig = {
  quoteRecipientEmail: 'quotes@tfrsupply.com', // change to route to right inbox
  quoteSendConfirmation: true,                  // false to suppress confirmation email
  quoteSenderName: 'TFR Supply',
};
```

**No secrets.** This file is bundled and visible in the browser. API keys and tokens must live in Base44 environment variables and be accessed only from backend functions.

To make the recipient dynamic (e.g. per-product, per-vertical): move `quoteRecipientEmail` to an `AppSettings` Base44 entity and load it at runtime. The adapter's import path stays the same.

---

## Entity: QuoteRequest

Created by the adapter on every successful submission. Never written by UI directly.

| Field | Type | Source |
|---|---|---|
| `productId` | string | `payload.productId` |
| `configuratorId` | string | `payload.configuratorId` |
| `productTitle` | string | `payload.productTitle` |
| `skuPreview` | string | `payload.selectedSku` (alias — stores the resolved catalog SKU) |
| `selectedOptions` | array of objects | `payload.selectedOptions` |
| `accessories` | array of objects | `payload.accessories` |
| `dependencyNotes` | array of strings | `payload.dependencyNotes` |
| `warningNotes` | array of strings | `payload.warningNotes` |
| `contactName` | string | `payload.contact.name` |
| `agency` | string | `payload.contact.agency` |
| `email` | string | `payload.contact.email` |
| `phone` | string | `payload.contact.phone` |
| `vehicleCount` | string | `payload.contact.vehicleCount` |
| `notes` | string | `payload.contact.notes` |
| `status` | enum | Always `"new"` on create |
| `source` | string | `payload.source` (`"configurator-prototype"`) |
| `submittedAt` | datetime | `payload.timestamp` |

Built-in fields added automatically by Base44: `id`, `created_date`, `updated_date`, `created_by_id`.

**Reference ID** shown in the UI is derived from the record ID: `QR-` + last 6 chars uppercased (e.g. `QR-A3F2C1`). This is display-only — the canonical ID for lookups is the full Base44 record `id`.

---

## Payload Shape

```json
{
  "productId": "navigator",
  "configuratorId": "navigator-configurator",
  "productTitle": "Navigator® Serial Light Bar",
  "selectedOptions": [
    { "stepId": "vehicle",  "stepLabel": "Vehicle Type", "selected": ["Patrol Sedan"] },
    { "stepId": "length",   "stepLabel": "Bar Length",   "selected": ["53\""] },
    { "stepId": "color",    "stepLabel": "Color Config.", "selected": ["Red / Blue"] },
    { "stepId": "mounting", "stepLabel": "Mounting Type", "selected": ["Permanent Mount"] }
  ],
  "accessories": [
    { "stepId": "accessories", "optionId": "cable-10", "optionLabel": "10 ft. Main Harness", "priceModifier": 28 }
  ],
  "selectedSku": "NAV-SLB-53-RB",
  "matchingSkus": [{ "sku": "NAV-SLB-53-RB", "label": "Navigator 53\" Red/Blue", "attributes": { "length": "53", "color": "RB" } }],
  "skuStatus": "matched",
  "skuPreview": "NAV-SLB-53-RB",
  "dependencyNotes": ["..."],
  "warningNotes": ["..."],
  "contact": {
    "name": "Jane Smith",
    "agency": "Metro Police Department",
    "email": "jane@metropd.gov",
    "phone": "(555) 000-0000",
    "vehicleCount": "12",
    "notes": "Fleet replacement cycle, Q3 delivery preferred."
  },
  "timestamp": "2026-06-26T14:00:00.000Z",
  "source": "configurator-prototype"
}
```

---

## Idempotency

A `submissionId` is generated once per panel mount via `generateSubmissionId()` (format: `sub-<timestamp>-<random6>`) and stored in a `useRef` — it never changes across retries within the same browser session.

Before creating a record, the adapter filters `QuoteRequest` by `submissionId`. If a match exists, that record is reused. This means:
- First attempt → creates one record
- Retry after email failure → finds existing record, skips create, retries emails only
- No duplicate records regardless of retry count

The `submissionId` is stored on the record and included in the internal email body for auditability.

---

## Submission Order

1. **`getOrCreateRecord`** — filter by `submissionId`; create if not found; return existing record on retry
2. **Derive `referenceId`** from `record.id` (`QR-` + last 6 chars uppercased)
3. **Send internal email** to `appConfig.quoteRecipientEmail` — subject includes `referenceId`
4. **Send confirmation email** to `payload.contact.email` if `appConfig.quoteSendConfirmation === true`
5. **If email step throws** — return `{ success: false, savedRecord: true, referenceId, error }` so UI can show partial-success state

---

## Gating Logic

`QuoteRequestPanel` renders in three states:

### 1. Locked — Incomplete
- `summary.isComplete === false`
- Red notice if hard violations exist
- Amber notice listing `pendingSteps` by label
- Form is not rendered

### 2. Form — Ready
- `summary.isComplete === true`
- Required fields: name, agency, email
- Submit button disabled while `status === 'submitting'` (duplicate protection)
- On error: red banner above submit button; button re-enables for retry

### 3. Confirmed — Success
- Replaces form on successful response
- Shows product name, SKU reference, **reference number** (e.g. `QR-A3F2C1`)
- Representative follow-up message

### 4. Partial — Record Saved, Email Failed
- `result.savedRecord === true` but `result.success === false`
- Amber banner: "Request Saved — Notification Delayed"
- Shows reference number so user can follow up manually
- User is not told to retry (record already exists; retry would reuse it but re-attempt email)

---

## Mobile / Responsive Behavior

`ConfiguratorLayout` uses CSS Grid with `auto-fit, minmax(320px, 1fr)`:
- **≥ ~660px:** Summary left, Quote panel right, side-by-side
- **< ~660px:** Summary stacks above Quote panel, full width
- No breakpoint JS — purely CSS grid reflow

---

## Failure Handling

1. `submitQuoteRequest` returns `{ success: false, error: message }` or the `.catch()` in the panel intercepts a thrown error
2. `status` transitions to `'error'`
3. Red banner displayed above submit button with the error message
4. Submit button re-enables for retry

If record creation fails, no email is sent — the user sees an error and can retry safely with no duplicate record risk.

---

## Confirmation Email

Controlled by `appConfig.quoteSendConfirmation` (default: `true`). Includes the reference ID so the customer can quote it when following up.

---

## Swapping the Adapter

1. Create `adapters/<provider>/quoteRequestAdapter.js`
2. Export `submitVia<Provider>(payload)` returning `Promise<{ success: boolean, referenceId?: string, error?: string }>`
3. Update the single import in `services/quoteRequestService.js`
4. No UI components change

---

## Admin Workflow (Sprint 8)

**Route:** `/admin/quotes`

### Architecture

```
AdminQuotesPage (UI — no base44 import)
  └─► adminQuoteService.loadQuotes()
        └─► adminQuoteAdapter.fetchAllQuotes()
              └─► base44.entities.QuoteRequest.list('-submittedAt', 200)

AdminQuotesPage (UI)
  └─► adminQuoteService.advanceQuoteStatus(id, currentStatus)
        └─► adminQuoteService.nextStatus(current)   ← pure helper
        └─► adminQuoteAdapter.updateQuoteStatus(id, next)
              └─► base44.entities.QuoteRequest.update(id, { status })
```

### Status Pipeline

`new` → `reviewed` → `quoted` → `closed`

### Features
- Status filter tabs with per-status counts
- Inline advance button per row (optimistic state update)
- Detail modal: selected options, accessories, dependency/warning notes, full contact, submissionId, record ID
- Email `mailto:` link, refresh button, showing N of M summary

---

## Future Notes (Sprint 9+)

| Feature | When | Approach |
|---|---|---|
| Auth guard on `/admin/*` | Sprint 9 | Check `user.role === 'admin'`, redirect otherwise |
| Notify requestor on status advance | Sprint 9 | Call `SendEmail` from `advanceQuoteStatus` in adapter |
| Dynamic recipient per vertical | Sprint 9 | Load `quoteRecipientEmail` from `AppSettings` entity at runtime |
| Customer account linking | Later | Associate quote with `User.id` if authenticated |
| Shopify draft order on quote | Later | Second adapter calling Shopify API from a backend function |

---

## Known Prototype Constraints

| Item | Status |
|---|---|
| Reference ID is display-only (last 6 of Base44 ID) | Sufficient for prototype; use full `id` for real lookups |
| No rate limiting or CAPTCHA | Out of scope |
| Confirmation email may hit SendEmail rate limits at scale | Note for production hardening |
| Email recipient in config (not env var) | Intentional — email address is not a secret |