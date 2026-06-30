# ADR-001: Generic ConfiguratorModule Architecture

## Status

Accepted

## Date

2026-06-30

## Decision owners

- Persona: Product Architect, Frontend Engineer
- Reviewers: QA Engineer

## Context

The repository needs a safe architecture boundary for future configurator work. Product-family-specific configurator implementations increase duplication, make QA harder, and raise the risk of hidden differences between police, fire/EMS, work truck, and other product workflows.

Configurator logic and context are protected areas. Agents must not modify them without explicit approval.

## Decision

Future configurator work should use a generic `ConfiguratorModule` architecture. The module should be reusable across product families and driven by approved configuration/data inputs rather than by family-specific React components.

The module boundary should separate:

- Product/page layout ownership.
- Configurator presentation slots.
- Approved data inputs.
- Selection and validation state.
- QA-visible outputs such as selected items, required components, and next-step eligibility.

## Consequences

### Benefits

- Reduces duplicated family-specific UI logic.
- Keeps future configurator behavior easier to test across product families.
- Gives agents a clear boundary for spec, implementation, and QA work.

### Tradeoffs / risks

- Requires stronger data contracts before implementation.
- May require Product Architect review when family-specific requirements appear.
- May require additional adapter layers instead of direct page-specific logic.

## Implementation guidance

- Do not implement product-family-specific configurator components without approval.
- Prefer data-driven module configuration over hard-coded family branches.
- Keep generic module work separate from product page layout changes.
- Treat configurator state, dependencies, and validation as protected until an issue explicitly approves changes.

## Protected files / approvals

- Protected files or areas: `src/context/**`, `src/components/configurator/**`, `src/pages/BuildReview.jsx`, product data under `src/data/**`.
- Required approvals: Product Architect for behavior and family rules; Frontend Engineer for React architecture; Data Engineer for data contracts.

## Related issues / PRs

- Initial AI-agent-safe development setup.

## Supersedes / superseded by

- Supersedes: none.
- Superseded by: none.
