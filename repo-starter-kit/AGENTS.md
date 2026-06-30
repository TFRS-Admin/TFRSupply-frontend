# Repository Agent Instructions

These instructions apply to the entire repository after installation.

## Required workflow: Spec → Build → Verify

1. **Spec**
   - Read `docs/START-HERE.md`, `agents/AGENT-RULES.md`, and `docs/architecture/REPO-MAP.md` before editing.
   - Restate the requested outcome, in-scope files, out-of-scope files, risks, and acceptance criteria.
   - Stop if the scope is ambiguous, touches protected files without approval, or may change behavior unexpectedly.
2. **Build**
   - Make the smallest approved change.
   - Do not commit directly to `main`, `production`, or `prod`.
   - Do not refactor, redesign, or alter behavior unless explicitly requested.
3. **Verify**
   - Run relevant checks for the repo.
   - Compare changed files against the spec and protected files list.
   - Produce the required QA report.

## Protected files and areas

Customize this list for each repo. Default protected areas:

- Business, product, catalog, pricing, and customer data.
- State management, configuration engines, workflow engines, and core domain logic.
- Commerce, checkout, quote, payment, billing, order, and subscription flows.
- Authentication, authorization, permissions, users, sessions, and security controls.
- Environment, secret, deployment, dependency, and lock files.
- Generated artifacts, build outputs, dependencies, caches, and logs.

## Definition of Done

- Approved spec is satisfied.
- Only in-scope files changed.
- Protected files were avoided or explicit approval is documented.
- Required checks pass or limitations are documented.
- QA report is complete.
