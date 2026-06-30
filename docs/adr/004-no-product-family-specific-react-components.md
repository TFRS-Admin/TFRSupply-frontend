# ADR-004: No Product-Family-Specific React Components

## Status

Accepted

## Date

2026-06-30

## Decision owners

- Persona: Product Architect, Frontend Engineer
- Reviewers: Documentation Engineer, QA Engineer

## Context

Product-family-specific React components can quickly create duplicate UI paths, inconsistent QA coverage, and divergent behavior across police, fire/EMS, work truck, and future product families. The agent rules already require approval before creating product-family-specific React components.

## Decision

Do not create product-family-specific React components by default. Future UI should prefer shared components, data-driven configuration, and approved composition patterns.

A product-family-specific React component may be created only when the Product Architect explicitly approves the exception and the PR documents why a shared or data-driven approach is insufficient.

## Consequences

### Benefits

- Keeps the UI system easier to maintain.
- Reduces duplicated behavior and styling drift.
- Makes QA coverage more consistent across product families.
- Reinforces data-driven architecture for product differences.

### Tradeoffs / risks

- Some family-specific experiences may need more careful data modeling.
- Shared components may need extension points or composition slots.
- Exceptions require explicit documentation and approval.

## Implementation guidance

- Prefer shared components and props/configuration over family-specific components.
- Keep family differences in approved data/configuration when possible.
- Stop and ask for clarification if a request appears to require a family-specific component.
- Document any approved exception in the issue, PR, and a follow-up ADR if it changes the architecture rule.

## Protected files / approvals

- Protected files or areas: `src/components/**`, `src/pages/**`, `src/data/**`, configurator files, and product-family routing/layout surfaces.
- Required approvals: Product Architect for exception approval; Frontend Engineer for component architecture; QA Engineer for regression plan.

## Related issues / PRs

- AI agent operating docs and templates.
- Police Lightbar Package Builder workstream.

## Supersedes / superseded by

- Supersedes: none.
- Superseded by: none.
