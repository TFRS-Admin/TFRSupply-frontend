# Quote Request Flow

_Sprint 5 — Prototype only. No Shopify, no backend entity storage, no customer accounts._

---

## Architecture

```
UI Component (QuoteRequestPanel)
  │  (calls service only — never imports base44 directly)
  └─► quoteRequestService.submitQuoteRequest(payload)
        │
        └─► adapters/base44/quoteRequestAdapter.submitViaBase44Email(payload)
              │  (only file that imports base44Client and appConfig)
              ├─► base44.integrations.Core.SendEmail → quoteRecipientEmail
              └─► base44.integrations.Core.SendEmail → contact.email (if quoteSendConfirmation=true)
```

**Rule:** UI imports only `quoteRequestService`. The adapter is the only file that imports `base44Client` or `appConfig`.

---

## Files

| File | Role |
|---|---|
| `config/appConfig.js` | Frontend config: recipient email, confirmation toggle, sender name. No secrets. |
| `services/quoteRequestService.js` | Payload builder, form validator, submission entry point |
| `adapters/base44/quoteRequestAdapter.js` | Base44 SendEmail — swap this file to change delivery mechanism |
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

  "skuPreview": "NAV-53-RB-PERM",
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

## Gating Logic

`QuoteRequestPanel` renders in three states:

### 1. Locked — Incomplete
- `summary.isComplete === false`
- Red notice if hard violations exist (lists conflict count)
- Amber notice listing `pendingSteps` by label
- Form is not rendered — no empty submission possible

### 2. Form — Ready
- `summary.isComplete === true`
- Required fields: name, agency, email
- Optional: phone, vehicleCount, notes
- Submit button disabled while `status === 'submitting'` (duplicate protection)
- Validation runs client-side before any network call
- On error: inline field-level messages, form stays editable

### 3. Confirmed — Success
- Replaces form on successful response
- Shows product name, SKU reference, representative follow-up message

---

## Mobile / Responsive Behavior

`ConfiguratorLayout` uses CSS Grid with `auto-fit, minmax(320px, 1fr)`:
- **≥ ~660px (two columns fit):** Summary left, Quote panel right, side-by-side
- **< ~660px (only one column fits):** Summary stacks above Quote panel, full width
- No breakpoint JS — purely CSS grid reflow

The quote form's inner field grid (`1fr 1fr`) will also reflow at narrow widths because `minmax(320px, 1fr)` on the outer container constrains available space, causing field pairs to collapse to single-column naturally.

---

## Failure Handling

Error flow:
1. `submitQuoteRequest` returns `{ success: false, error: message }` or the `.catch()` in the panel intercepts a thrown error
2. `status` transitions to `'error'`
3. Red banner displayed above submit button with the error message
4. Submit button re-enables — user can retry
5. Status resets to `'submitting'` on retry, not `'idle'`, so the spinner reappears

The panel never silently swallows errors. If the adapter throws unexpectedly (network outage, Base44 rate limit), the `.catch(err => ({ success: false, error: err.message }))` in the panel ensures a user-visible message always appears.

---

## Confirmation Email

Controlled by `appConfig.quoteSendConfirmation` (default: `true`).

When enabled, a second `SendEmail` call is made inside the adapter to `payload.contact.email` with a summary of their configuration. No UI change needed to toggle this behavior — change the config flag only.

---

## Swapping the Adapter

To replace Base44 email with a different delivery mechanism:

1. Create `adapters/<provider>/quoteRequestAdapter.js`
2. Export `submitVia<Provider>(payload)` returning `Promise<{ success: boolean, error?: string }>`
3. Update the single import in `services/quoteRequestService.js`
4. No UI components change

---

## Future Storage / Admin Notes (Sprint 6+)

The following are **not implemented** and should be scoped separately:

| Feature | When | Approach |
|---|---|---|
| QuoteRequest entity record | Sprint 6 | Write to Base44 entity on success; adapter returns record id in response |
| Admin quotes list | Sprint 6 | `/admin/quotes` page reading `QuoteRequest` entity |
| Dynamic recipient per vertical | Sprint 7 | Load `quoteRecipientEmail` from `AppSettings` entity at runtime |
| Customer account linking | Later | Associate quote with `User.id` if authenticated |
| Shopify draft order on quote | Later | Second adapter that calls Shopify API from a backend function |

---

## Known Prototype Constraints

| Item | Status |
|---|---|
| Email recipient in config (not env var) | Intentional — no secrets needed for recipient address |
| No rate limiting | Out of scope Sprint 5 |
| No spam protection / CAPTCHA | Out of scope Sprint 5 |
| No record persisted | Sprint 6 |
| Confirmation email may hit Base44 SendEmail rate limits at scale | Note for production hardening |