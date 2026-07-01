# Organization-Wide Definition of Done

A TFRSupply issue or PR is done only when every applicable item below is satisfied.

## Scope and Governance

- The PR maps to an approved issue or documented emergency action.
- Changes stay inside the approved scope and respect forbidden areas.
- Architecture, migration, data, commerce, pricing, and configurator boundaries are honored.
- No secrets, credentials, private customer data, or unapproved product data are committed.

## Implementation Quality

- Code follows existing repository patterns and dependency direction.
- React components do not directly import platform data once their surface has been migrated.
- Services do not import React, hooks, or components.
- Loaders and validators fail loudly rather than silently returning partial invalid data.
- Pricing, commerce, configurator, and quote changes are deterministic and explainable.

## Documentation

- Architecture docs are updated when boundaries change.
- Migration docs are added when a runtime surface moves from legacy to platform architecture.
- README, deployment docs, or project-management docs are updated when workflows change.
- Documentation contains no placeholders and uses exact commands, paths, owners, and rollback steps.

## Testing and Validation

- Required commands run: `npm run lint`, `npm run build`, and `npm run typecheck`.
- Relevant unit, integration, data validation, or browser tests are added or updated.
- Visual changes include screenshot evidence.
- Commerce, pricing, configurator, and quote changes include failure-path tests.
- Known environment limitations are documented with exact command output summary.

## Review and Release

- PR description includes summary, tests, risk, and rollback notes.
- Required reviewers approve based on domain labels.
- Protected branch checks pass or an approved exception is recorded.
- Release notes are prepared for user-visible, operational, commerce, pricing, or workflow changes.
- Post-merge follow-up issues are created for deferred work.
