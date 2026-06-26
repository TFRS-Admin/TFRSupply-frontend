# Quote Request Flow

_Sprint 4 — Prototype only. No Shopify or Base44 backend entity dependencies._

---

## Architecture

```
UI Component (QuoteRequestPanel)
  │
  └─► quoteRequestService.submitQuoteRequest(payload)
        │
        └─► adapters/base44/quoteRequestAdapter.submitViaBase44Email(payload)
              │
              └─► base44.integrations.Core.SendEmail(...)
```

**Rule:** UI imports only `quoteRequestService`. The adapter is the only file that imports `base44Client`.

---

## Files

| File | Role |
|---|---|
| `services/quoteRequestService.js` | Payload builder, form validator, submission entry point |
| `adapters/base44/quoteRequestAdapter.js` | Base44 SendEmail delivery — swap this to change delivery mechanism |
| `components/configurator/QuoteRequestPanel.jsx` | Form UI + gating logic — calls service only |

---

## Payload Shape

```json
{
  "productId": "navigator",
  "configuratorId": "navigator-configurator",
  "productTitle": "Navigator® Serial Light Bar",

  "selectedOptions": [
    { "stepId": "vehicle",   "stepLabel": "Vehicle Type",  "selected": ["Patrol Sedan"] },
    { "stepId": "length",    "stepLabel": "Bar Length",     "selected": ["53\""] },
    { "stepId": "color",     "stepLabel": "Color Config.",  "selected": ["Red / Blue"] },
    { "stepId": "mounting",  "stepLabel": "Mounting Type",  "selected": ["Permanent Mount"] }
  ],

  "accessories": [
    { "stepId": "accessories", "optionId": "cable-10", "optionLabel": "10 ft. Main Harness", "priceModifier": 28 }
  ],

  "skuPreview": "NAV-53-RB-PERM",

  "dependencyNotes": [
    "Mounting required because: Magnetic Mount was selected. Magnetic mount requires a controller selection."
  ],

  "warningNotes": [
    "Advisory — Amber + Patrol Sedan: Amber is non-standard for police patrol vehicles."
  ],

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

The `QuoteRequestPanel` renders in one of three states:

### 1. Locked — Incomplete
- Shown when `summary.isComplete === false`
- Lists hard violations (if any) in a red notice
- Lists `summary.pendingSteps` in an amber notice
- Form is not rendered

### 2. Form — Ready
- Shown when `summary.isComplete === true`
- Collects: name*, agency*, email*, phone, vehicle count, notes
- Validates required fields before submission
- On invalid submit: inline field-level error messages, no network call
- On submit: calls `quoteRequestService.submitQuoteRequest(payload)` only

### 3. Confirmed — Success
- Replaces form after successful response
- Shows SKU reference, product name, confirmation message

---

## Validation Rules

| Field | Rule |
|---|---|
| name | Non-empty string |
| agency | Non-empty string |
| email | Non-empty + RFC-style regex `[^@]+@[^@]+\.[^@]+` |
| phone | Optional |
| vehicleCount | Optional |
| notes | Optional |

---

## Error Handling

- Network/adapter errors are caught in `QuoteRequestPanel` via `.catch()`
- User sees a red inline error banner with the error message
- Form remains editable; user can retry
- Status cycles: `idle → submitting → success | error`

---

## Swapping the Adapter

To replace Base44 email with a different delivery mechanism:

1. Create `adapters/<provider>/quoteRequestAdapter.js`
2. Export `submitVia<Provider>(payload)` returning `Promise<{ success: bool, error?: string }>`
3. Update the import in `services/quoteRequestService.js` — one line change
4. No UI components change

---

## Known Prototype Constraints

| Item | Status |
|---|---|
| Email recipient hardcoded in adapter | `quotes@tfrsupply.com` — replace before production |
| No confirmation email sent to user | Out of scope Sprint 4 |
| No entity record created | Out of scope Sprint 4 |
| No rate limiting or spam protection | Out of scope Sprint 4 |
| No Shopify cart/order created | Deferred to Sprint 5 |