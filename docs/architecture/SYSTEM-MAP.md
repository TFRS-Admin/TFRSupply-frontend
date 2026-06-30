# System Map

This document maps the intended major systems for product configuration, commerce lookup, quoting, and future cart work. It is architecture documentation only and does not change application behavior.

## Visual flow

```text
Product Pages
    ↓
ConfiguratorModule
    ↓
Configurator JSON
    ↓
Vehicle Context
    ↓
Commerce Lookup
    ↓
Shopify Index
    ↓
Quote Builder
    ↓
Future Cart
```

## System ownership map

| System | Owner persona | Purpose | Inputs | Outputs | Dependencies | Protected files / areas |
|---|---|---|---|---|---|---|
| Product Pages | Product Architect + Frontend Engineer | Own product storytelling, page layout, page-level navigation, resources, and the Build & Configure slot. | Product page data, route params, approved page content, approved slot configuration. | Rendered product page, calls to action, Build & Configure slot for modules. | Product data, shared components, routing, page templates. | `src/pages/**`, page templates, product data under `src/data/**`. |
| ConfiguratorModule | Product Architect + Frontend Engineer | Provide a generic, reusable configuration UI module that plugs into Build & Configure. | Approved module schema, selected product/page context, configurator JSON, vehicle context, commerce references. | User selections, validation state, required component prompts, quote-ready configuration payload. | ADR-001, ADR-003, shared UI components, configurator JSON, vehicle context. | `src/components/configurator/**`, `src/context/**`, `src/pages/BuildReview.jsx`. |
| Configurator JSON | Data Engineer + Product Architect | Store approved configuration options, rules, prompts, dependencies, and module metadata as structured data. | Product rules, required components, package definitions, fitment constraints, approved source data. | JSON-compatible configuration contract consumed by the module. | Product data, required-components matrix, fitment matrix, ADR-001. | `src/data/**`, future config JSON files, `base44/entities/**` when used for data. |
| Vehicle Context | Data Engineer + Frontend Engineer | Hold selected vehicle and compatibility context for configuration decisions. | Year/make/model/trim/body data, fitment matrix, user vehicle selection. | Normalized vehicle context and compatibility signals. | Vehicle fitment matrix, configurator JSON, validation rules. | `src/context/**`, `src/components/configurator/**`, vehicle/fitment data under `src/data/**`. |
| Commerce Lookup | Commerce Engineer + Data Engineer | Resolve selected products/packages to commerce identifiers and commerce availability. | Quote-ready configuration payload, SKU mapping, Shopify export-derived index. | Commerce lookup result: SKUs, variant IDs, availability, and commerce warnings. | Shopify Index, ADR-002, package selections, required components. | Commerce lookup files, checkout/cart/quote/order/pricing flows, `src/data/**`, secrets/env. |
| Shopify Index | Commerce Engineer + Data Engineer | Represent the approved transformed Shopify Export for application lookup. | Shopify Export, transformation rules, validation reports. | Reviewed commerce index for SKU, variant, availability, and pricing references. | Shopify Export, ADR-002, data validation. | Shopify export artifacts, transformed commerce data, `src/data/**`, environment secrets. |
| Quote Builder | Commerce Engineer + Product Architect | Convert validated configurations into quote-ready output without bypassing commerce truth. | Commerce lookup result, selected configuration, customer/context fields if approved. | Quote payload, quote summary, missing-data warnings, next-step state. | Commerce Lookup, Shopify Index, required components, pricing policy. | Quote/order/pricing/cart flows, commerce data, customer data, auth/session where applicable. |
| Future Cart | Commerce Engineer + Frontend Engineer | Future cart handoff destination for purchasable configurations after quote/cart approval. | Quote payload or cart-ready commerce payload, variant IDs, quantities, customer/session context if approved. | Cart state or checkout handoff. | Quote Builder, Shopify Index, checkout provider, auth/session. | Cart/checkout/payment/Stripe/Shopify flows, auth/session, environment secrets. |

## Architecture notes

### Product Pages → ConfiguratorModule

Product pages own layout. The `ConfiguratorModule` may plug into an approved Build & Configure slot, but it must not replace the product page, page-level navigation, merchandising sections, resources, or unrelated calls to action.

### ConfiguratorModule → Configurator JSON

Configurator behavior should be driven by approved JSON-compatible data contracts instead of product-family-specific React components or hardcoded JSX conditionals.

### Configurator JSON → Vehicle Context

Configurator JSON can reference vehicle requirements, fitment constraints, and required components, but vehicle state and compatibility signals should remain normalized through an approved vehicle context boundary.

### Vehicle Context → Commerce Lookup

Vehicle-compatible selections can become commerce lookup requests only after validation. Commerce lookup must not invent SKUs, prices, variants, availability, or package contents.

### Commerce Lookup → Shopify Index

Commerce lookup depends on the approved Shopify Export-derived index. Shopify remains the commerce source of truth for SKU, variant, availability, and pricing references.

### Shopify Index → Quote Builder

Quote Builder should use reviewed commerce lookup outputs. It should surface missing-data or mismatch warnings instead of silently substituting invented commerce data.

### Quote Builder → Future Cart

Future Cart is a downstream destination, not a current shortcut around quote and commerce validation. Cart work requires explicit Commerce Engineer approval and a QA plan.

## Protected files summary

Explicit approval is required before modifying:

- Product page layout or route files: `src/pages/**`.
- Configurator components and state: `src/components/configurator/**`, `src/context/**`, `src/pages/BuildReview.jsx`.
- Product, package, fitment, required-component, and commerce data: `src/data/**`, `base44/entities/**`, future JSON/config/index files.
- Commerce flows: checkout, cart, quote, order, pricing, Stripe, Shopify identifiers, and related integrations.
- Auth/session/customer state used by quote or cart flows.
- Environment, secret, dependency, deployment, and lock files.
- Generated artifacts and dependencies: `node_modules/**`, `dist/**`, caches, logs, and build outputs.

## QA expectations by system

| System | Required QA |
|---|---|
| Product Pages | Route review, screenshot when UI changes, lint/build, page ownership check. |
| ConfiguratorModule | Valid/invalid configuration scenarios, no product-family-specific component check, lint/build. |
| Configurator JSON | Schema/data validation, no invented product data, protected-file approval. |
| Vehicle Context | Fitment scenarios, compatibility edge cases, no unintended state changes. |
| Commerce Lookup | SKU/variant mapping checks, missing/duplicate SKU handling, no hardcoded prices. |
| Shopify Index | Export freshness check, transformation validation, mismatch report. |
| Quote Builder | Quote payload validation, missing-data warnings, commerce approval check. |
| Future Cart | Cart/checkout risk review, provider integration QA, auth/session review, payment safety checks. |
