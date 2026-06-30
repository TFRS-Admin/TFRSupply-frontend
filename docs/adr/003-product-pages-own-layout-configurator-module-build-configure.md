# ADR-003: Product Pages Own Layout; ConfiguratorModule Plugs into Build & Configure

## Status

Accepted

## Date

2026-06-30

## Decision owners

- Persona: Product Architect, Frontend Engineer
- Reviewers: QA Engineer

## Context

Product pages need stable ownership of page layout, storytelling, merchandising content, resources, and product-specific calls to action. Configurator functionality should not take over full product page layout or introduce layout-specific coupling that makes pages harder to maintain.

## Decision

Product pages own their layout. A generic `ConfiguratorModule` may plug into the Build & Configure area only. The module should not own the surrounding product page structure, merchandising sections, resource sections, page-level navigation, or unrelated calls to action.

## Consequences

### Benefits

- Keeps product pages flexible and content-oriented.
- Prevents configurator implementation from becoming a page-layout framework.
- Clarifies QA responsibility for product page layout versus configurator behavior.

### Tradeoffs / risks

- Requires clear integration contracts between page layout and the configurator slot.
- Page teams and configurator teams must coordinate on inputs and output events.
- Some future UI requests may need Product Architect review to determine ownership.

## Implementation guidance

- Keep product page layout changes separate from configurator behavior changes.
- Plug configurator UI only into the approved Build & Configure section.
- Do not move product page content into configurator modules.
- Do not use configurator state to drive unrelated page layout unless explicitly approved.

## Protected files / approvals

- Protected files or areas: `src/pages/**` for product page layout, `src/components/configurator/**`, `src/context/**`, `src/pages/BuildReview.jsx`, product data under `src/data/**`.
- Required approvals: Product Architect for ownership and behavior; Frontend Engineer for integration architecture; QA Engineer for regression coverage.

## Related issues / PRs

- Product Page Regression QA workstream.
- Police Lightbar Package Builder workstream.

## Supersedes / superseded by

- Supersedes: none.
- Superseded by: none.
