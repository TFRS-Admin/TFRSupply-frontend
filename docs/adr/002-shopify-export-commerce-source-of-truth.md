# ADR-002: Shopify Export Is the Single Source of Truth for Commerce

## Status

Accepted

## Date

2026-06-30

## Decision owners

- Persona: Commerce Engineer, Data Engineer
- Reviewers: Product Architect, QA Engineer

## Context

Commerce data can affect product availability, pricing, SKU mapping, checkout, quote, and order behavior. Multiple unsynchronized sources of commerce data create a high risk of stale product details, mismatched variants, and checkout errors.

Commerce flows, pricing, checkout, quote, cart, order, Stripe, Shopify identifiers, and product data are protected areas.

## Decision

Shopify Export is the single source of truth for commerce-facing product data. Future commerce indexes, product-commerce mappings, and package-builder commerce references should derive from the approved Shopify export rather than hand-maintained app code or ad hoc local data.

Application code may consume a reviewed, transformed representation of the Shopify export only after the transformation rules and ownership are documented.

## Consequences

### Benefits

- Reduces drift between app commerce references and Shopify.
- Provides a reviewable data source for SKU, variant, and availability mapping.
- Makes commerce QA more repeatable.

### Tradeoffs / risks

- Requires access to current Shopify exports.
- Requires a defined refresh and validation process.
- Blocks commerce implementation when export data is unavailable or inconsistent.

## Implementation guidance

- Do not hand-code commerce truth into React components.
- Do not change pricing, cart, checkout, quote, order, or Stripe behavior without Commerce Engineer approval.
- Validate missing, duplicate, or retired SKUs before implementation.
- Document transformation rules before using Shopify export data in application data files.

## Protected files / approvals

- Protected files or areas: commerce flows, checkout/cart/order/quote/pricing files, Stripe integrations, Shopify identifiers, `src/data/**`, environment secrets.
- Required approvals: Commerce Engineer for commerce source-of-truth and behavior; Data Engineer for transformation and validation; Product Architect for product-facing implications.

## Related issues / PRs

- Shopify Commerce Index workstream.

## Supersedes / superseded by

- Supersedes: none.
- Superseded by: none.
