# Quote Request Flow

_PR-12 — No backend, no persistence, no admin queue integration._

---

## Architecture

```
UI Component (QuoteRequestPanel)
  │  submissionIdRef (stable per-tab, generated once via generateSubmissionId())
  │  (calls service only — never imports the delivery adapter directly)
  └─► quoteRequestService.submitQuoteRequest(payload)
        │  payload includes submissionId
        └─► adapters/quoteDelivery.quoteDeliveryAdapter.submitQuoteRequest(payload)
              ├─► appConfig.quoteDeliveryEndpoint configured?
              │     POST payload to the hosted form endpoint; success/failure from the HTTP response
              └─► not configured (default): open the requester's email client via a
                    structured mailto: link addressed to appConfig.quoteRecipientEmail
                    (same pattern as ComparePage's buildQuoteHref)
```

**Rule:** UI imports only `quoteRequestService`. The adapter is the only file that imports `appConfig` for delivery.

---

## Files

| File | Role |
|---|---|
| `config/appConfig.js` | Frontend config: recipient email, optional hosted form endpoint. No secrets. |
| `services/quoteRequestService.js` | Payload builder, form validator, submission entry point |
| `adapters/quoteDelivery/quoteDeliveryAdapter.ts` | Hosted-form POST or mailto fallback — swap this to change delivery mechanism |
| `components/configurator/ConfiguratorLayout.jsx` | Responsive two-column → single-column layout wrapper |
| `components/configurator/QuoteRequestPanel.jsx` | Form UI + gating logic — calls service only |

---

## Config Pattern

All configurable values live in `config/appConfig.js`:

```js
const appConfig = {
  quoteRecipientEmail: 'quotes@tfrsupply.com',        // change to route to right inbox
  quoteSendConfirmation: true,                         // unused by the current adapter; see Future Notes
  quoteSenderName: 'TFR Supply',
  quoteDeliveryEndpoint: import.meta.env.VITE_QUOTE_DELIVERY_ENDPOINT || '', // optional hosted form URL
};
```

**No secrets.** This file is bundled and visible in the browser. `quoteDeliveryEndpoint` is a public hosted-form URL, not a credential — it's meant to be called from the browser.

---

## No Persistence (PR-12)

Nothing is written to a database. There is no `QuoteRequest` record and no `id` to look up later — the `referenceId` shown in the UI is derived purely client-side from `submissionId` (`QR-` + last 6 chars uppercased) and exists only to give the requester something to reference on a follow-up phone call. Admin quote queue integration is explicitly out of scope for PR-12 (see Admin Workflow below, which is unaffected and still backed by the base44 stub adapters pending a later PR).

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

## Submission ID

A `submissionId` is generated once per panel mount via `generateSubmissionId()` (format: `sub-<timestamp>-<random6>`) and stored in a `useRef` — it never changes across retries within the same browser session. It has one job: deriving a stable `referenceId` (`QR-` + last 6 chars uppercased) so a retry shows the same reference number. There is no server-side record to deduplicate against, so a retry after a failed hosted-form POST sends a second request (and a retry after a mailto fallback just reopens the mail client) — there is no "already submitted, skip" behavior.

---

## Submission Order

1. **Derive `referenceId`** from `submissionId` (`QR-` + last 6 chars uppercased)
2. **Hosted form configured** (`appConfig.quoteDeliveryEndpoint` set) — POST the payload; `response.ok` → success, otherwise the HTTP status is surfaced as the error
3. **Hosted form not configured** (default) — build a structured `mailto:` link addressed to `appConfig.quoteRecipientEmail` and open it; reported as success because the mail client was actually invoked, but the UI is explicit that the requester still needs to click Send

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
- Hosted-form delivery: "Quote Request Submitted" + representative follow-up message
- Mailto fallback: "Almost There — Finish Sending Your Email" + a manual mailto link and phone number in case nothing opened

---

## Mobile / Responsive Behavior

`ConfiguratorLayout` uses CSS Grid with `auto-fit, minmax(320px, 1fr)`:
- **≥ ~660px:** Summary left, Quote panel right, side-by-side
- **< ~660px:** Summary stacks above Quote panel, full width
- No breakpoint JS — purely CSS grid reflow

---

## Failure Handling

1. `submitQuoteRequest` returns `{ success: false, error: message }` (hosted-form HTTP/network failure) or the `.catch()` in the panel intercepts a thrown error
2. `status` transitions to `'error'`
3. Red banner displayed above submit button with the error message and a `tel:` phone-number fallback
4. Submit button re-enables for retry

---

## Confirmation Email

Not implemented in the current adapter — there is no backend to send a separate confirmation email from. `appConfig.quoteSendConfirmation` is unused pending a future adapter (e.g. the hosted-form provider's own autoresponder, or a real backend). See Future Notes.

---

## Swapping the Adapter

1. Edit or replace `adapters/quoteDelivery/quoteDeliveryAdapter.ts` (or point `config.endpoint` at a different hosted-form provider via `VITE_QUOTE_DELIVERY_ENDPOINT`)
2. `createQuoteDeliveryAdapter` returns `{ submitQuoteRequest(payload): Promise<{ success, referenceId?, deliveryMethod?, mailtoUrl?, error? }> }`
3. `services/quoteRequestService.js` imports the singleton from `adapters/quoteDelivery` — update that import if the module path changes
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

## Future Notes

| Feature | Approach |
|---|---|
| Quote persistence / admin queue on real data | Real backend (or a Shopify-backed store) behind `adminQuoteAdapter` — out of scope for PR-12 |
| Confirmation email to requester | Hosted-form provider's autoresponder, or a real backend send |
| Dynamic recipient per vertical | Load `quoteRecipientEmail` from a settings source at runtime instead of `appConfig.js` |
| Customer account linking | Associate quote with an authenticated customer once accounts exist |
| Shopify draft order on quote | Second adapter calling the Shopify Admin API from a backend function |

---

## Known Constraints (PR-12)

| Item | Status |
|---|---|
| Reference ID is client-derived, not a lookup key | No backend record exists; it's a human-readable string for a follow-up phone call |
| No rate limiting or CAPTCHA on the form | Out of scope |
| No retry deduplication | A retry re-POSTs or reopens mailto — there is no server record to dedupe against |
| Email recipient in config (not env var) | Intentional — email address is not a secret |
| Delivery endpoint URL in config, backed by an optional env var | Not a secret — hosted form endpoints are meant to be called from the browser |