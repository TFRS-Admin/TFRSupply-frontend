# Agent Rules

These rules apply to AI agents working in this repository.

## Before editing

- Read `AGENTS.md`, `docs/START-HERE.md`, `agents/PERSONAS.md`, `agents/WORKFLOW.md`, and `docs/architecture/REPO-MAP.md`.
- Confirm the requested scope, responsible persona, acceptance criteria, and files likely to change.
- Check the current git status and avoid overwriting user changes.
- Do not work directly on `production`, `prod`, or `main`; use a feature branch and target `develop` unless instructed otherwise.
- Do not change application source code unless the task explicitly requests it.

## Spec → Build → Verify workflow

### Spec

- Restate the task in plain language.
- List files in scope and out of scope.
- Identify protected files or areas that require approval.
- Define how the work will be verified.

### Build

- Make only the smallest approved change.
- Follow existing repository conventions for naming, formatting, and structure.
- Do not refactor, redesign UI, change behavior, or alter logic unless explicitly requested.
- Do not create product-family-specific React components without Product Architect approval.
- Never commit secrets, tokens, credentials, local environment files, dependency folders, or generated artifacts.
- Do not wrap imports in `try`/`catch` blocks.

### Verify

- Run the most relevant checks available for the change.
- For this frontend, prefer `npm run lint` and `npm run build` when dependencies are available.
- Review `git diff --name-only` to confirm only approved files changed.
- If a check cannot run because of an environment limitation, record the limitation clearly.

## Protected files and areas

Explicit approval is required before modifying:

- Product data and catalogs: `src/data/**`, `base44/entities/**`.
- Configurator logic and context: `src/context/**`, `src/components/configurator/**`, `src/pages/BuildReview.jsx`.
- Commerce, checkout, Stripe, pricing, quote, cart, and order flows.
- Authentication, authorization, user, and session handling.
- Environment, secret, dependency, and deployment files including `.env*`, `package.json`, lockfiles, deployment config, and CI secrets.
- Generated artifacts and dependencies including `node_modules/**`, `dist/**`, caches, logs, and build outputs.

## Agent personas

- **Product Architect** — validates product intent, task scope, family-specific behavior, and approval for product behavior changes.
- **Frontend Engineer** — implements approved UI and React changes without introducing unapproved family-specific components.
- **Data Engineer** — manages approved data model, catalog, migration, and validation work.
- **Commerce Engineer** — manages approved pricing, checkout, quote, Stripe, cart, and order-flow changes.
- **QA Engineer** — runs verification, checks CI hygiene, validates regression risk, and writes QA reports.
- **Documentation Engineer** — maintains docs, issue templates, PR templates, and agent operating instructions.
- **Security / Platform Engineer** — owns secrets, environment configuration, deployment settings, CI permissions, authentication, authorization, sessions, and infrastructure risk.

## When to stop and ask for clarification

Stop before editing when:

- The request conflicts with these rules or protected files.
- The target branch, PR target, or environment is unclear.
- The task could change product behavior, pricing, data, configurator logic, commerce flows, or auth/session behavior.
- The implementation would require a product-family-specific React component without approval.
- Existing user changes are present in files you need to edit.
- Acceptance criteria or verification expectations are missing.

## Definition of Done

- The approved spec is satisfied.
- Only approved files changed.
- Protected files were avoided or explicit approval is documented.
- Required checks pass or limitations are documented.
- No unintended product behavior, data, configurator, commerce, auth, or UI redesign changes were introduced.
- The QA report and PR description are complete.

## Required QA report format

- Files created.
- Files changed.
- Summary of rules or implementation changes.
- Tests/checks run with pass/fail status.
- Confirmation that no application code changed, unless explicitly in scope.
- Confirmation that no protected files were changed without approval.
- Known risks, blockers, or follow-up work.
