# Acceptance Criteria Library

## Frontend

- Route renders existing content, layout, and fallback states unless the issue explicitly changes them.
- Loading, empty, error, and success states are intentional and tested where practical.
- Components call hooks or service-backed adapters instead of direct JSON access after migration.
- Accessibility semantics, keyboard navigation, focus behavior, and color contrast are preserved or improved.
- Visual changes include screenshot evidence.

## Backend

- Public contracts are typed, documented, and version-safe.
- Error handling is explicit and observable.
- Data validation happens at the boundary before business decisions.
- Idempotency is defined for write or submission flows.
- Rollback and operational monitoring are documented.

## Services

- Services own use-case orchestration and do not import React, hooks, or components.
- Services return typed domain data or explicit result objects.
- Service failures propagate intentionally or are converted to documented domain errors.
- Tests cover success, not-found, validation failure, and dependency failure paths.
- Service APIs remain narrow and aligned to one bounded context.

## Pricing

- List price, dealer cost, contract price, selling price, and margin are not conflated.
- Source priority is deterministic and documented.
- Contract windows and expiration warnings are evaluated consistently.
- Missing price, missing cost, expired contract, and low-margin states produce reviewable warnings.
- Pricing calculations are pure and covered by fixture-based tests.

## Commerce

- Shopify product IDs and variant IDs remain in commerce-owned contracts.
- Add-to-cart readiness requires validated variant mapping and availability state.
- Failed mapping or inventory lookup fails safe.
- Checkout-impacting changes include rollback and production smoke steps.
- Cart line payloads are traceable to product, SKU, and configuration context.

## Documentation

- Documentation states objective, audience, owner, workflow, commands, and acceptance criteria.
- No placeholder text remains.
- File paths, branch names, labels, and commands are exact.
- Related architecture, migration, and workflow docs are cross-referenced when relevant.
- Documentation changes are reviewed by the responsible persona.

## Migration

- Current and target dependency paths are documented.
- Runtime behavior is preserved unless the issue explicitly approves a behavior change.
- Direct legacy imports are removed only from the migrated scope.
- Migration tests prove equivalent data or UI behavior.
- Rollback plan restores the previous dependency path.

## Testing

- Tests are deterministic and suitable for CI.
- Fixtures represent real domain cases across verticals where applicable.
- Regression tests are added for bugs.
- Browser tests cover user-critical interactions when UI behavior changes.
- Test output and limitations are recorded in PR evidence.
