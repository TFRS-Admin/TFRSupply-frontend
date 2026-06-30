# Repository Agent Instructions

These instructions apply to the entire repository.

## Required operating workflow: Spec → Build → Verify

1. **Spec**
   - Read `docs/START-HERE.md`, `agents/AGENT-RULES.md`, and `docs/architecture/REPO-MAP.md` before editing.
   - Restate the requested outcome, files in scope, files out of scope, risks, and acceptance criteria.
   - Stop and ask for clarification if the scope is ambiguous, conflicts with protected files, changes product behavior unexpectedly, or requires approval.
2. **Build**
   - Make only the smallest change that satisfies the approved spec.
   - Do not make direct changes to `production`, `prod`, or `main`; work from a feature branch and target `develop` unless instructed otherwise.
   - Do not create product-family-specific React components without explicit approval from the Product Architect.
   - Do not refactor, redesign, or alter business logic unless explicitly requested.
3. **Verify**
   - Run the relevant checks, normally `npm run lint` and `npm run build` for frontend changes.
   - Compare changed files against the spec and protected files list.
   - Produce the required QA report before handoff.

## Protected files and areas

Do not modify these without explicit task approval:

- Product data and catalogs: `src/data/**`, `base44/entities/**`.
- Configurator logic and context: `src/context/**`, `src/components/configurator/**`, `src/pages/BuildReview.jsx`.
- Commerce, checkout, and payment integrations: files referencing Stripe, cart, checkout, order, quote, or pricing flows.
- Authentication, authorization, and user/session handling.
- Environment, secret, deployment, and dependency files: `.env*`, `package.json`, lockfiles, deployment config, and CI secrets.
- Generated artifacts and dependencies: `node_modules/**`, `dist/**`, build outputs, caches, and logs.

## Agent personas

- **Product Architect** — owns product intent, scope approval, family taxonomy, and behavior changes.
- **Frontend Engineer** — owns React implementation within an approved spec, with no product-family-specific components unless approved.
- **Data Engineer** — owns data shape, migration, validation, and catalog/data quality changes.
- **Commerce Engineer** — owns pricing, cart, checkout, Stripe, quote, and order-flow changes.
- **QA Engineer** — owns verification plans, regression checks, CI hygiene, and QA reporting.
- **Documentation Engineer** — owns docs, templates, workflow guidance, and repository operating instructions.

## Definition of Done

- The change matches the approved spec and acceptance criteria.
- Only in-scope files changed.
- Protected files were not touched unless approval is documented.
- Lint and build pass, or limitations are documented with exact command output context.
- No unintended product behavior, UI redesign, data, configurator, commerce, or dependency changes were introduced.
- PR summary and QA report are complete.

## Required QA report format

Every handoff must include:

- Files created.
- Files changed.
- Summary of workflow or implementation rules added.
- Tests/checks run with pass/fail status.
- Confirmation that no application code changed, or a precise explanation if application code was explicitly in scope.
- Confirmation that no protected files were changed without approval.
- Known risks, blockers, or follow-up work.
