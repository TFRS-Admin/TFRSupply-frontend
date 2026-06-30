# Repository Standards

Customize these standards for the project.

## Architecture standards

- Prefer structured data and documented contracts over hardcoded facts.
- Keep UI data-driven where practical.
- Do not invent product, customer, pricing, commerce, or business data.
- Keep ownership boundaries clear between pages, shared modules, data, services, and integrations.
- Record significant decisions as ADRs.

## Branch strategy

- Do not commit directly to `main`, `production`, or `prod`.
- Use feature branches.
- Target `develop` unless maintainers specify otherwise.
- Require PR review and CI for protected branches.

## Protected files strategy

Protect project-specific high-risk areas, including:

- Domain data.
- Core business logic.
- State and workflow engines.
- Commerce/payment/billing flows.
- Auth/security/session handling.
- Environment, deployment, dependency, and lock files.
- Generated artifacts and dependency folders.

## Required testing

Run the relevant checks for each change. Common examples:

- Lint.
- Typecheck.
- Unit tests.
- Build.
- E2E or smoke tests when UI or workflows change.

## Required screenshots for UI work

Screenshots are required when visible UI changes. Include route/page, viewport, before/after when practical, and notes about visual risks.

## Required QA format

- Files created.
- Files changed.
- Summary of changes.
- Tests/checks run with pass/fail status.
- Screenshots when UI changed.
- Confirmation that protected files were not changed without approval.
- Known risks, blockers, and follow-up work.

## What we never do

- Never invent business data.
- Never hardcode values that should come from approved data or configuration.
- Never bypass QA.
- Never bypass lint/build/test gates.
- Never commit secrets.
- Never edit generated artifacts or dependency folders.
- Never mix unrelated refactors into scoped work.
