# Start Here: AI Operating System Layer

This repository includes an AI operating system layer to help agents make safe, consistent changes before touching application code.

## Required first steps

1. Read `AGENTS.md` for repository-wide instructions.
2. Read `agents/AGENT-RULES.md` for detailed operating rules.
3. Read `agents/PERSONAS.md` to identify the correct owner/reviewer role.
4. Read `agents/WORKFLOW.md` for the reusable Spec → Build → Verify process.
5. Review `docs/architecture/REPO-MAP.md` to understand the repository layout and protected areas.
6. Review `docs/STANDARDS.md` and `docs/PROJECT-MEMORY.md` for TFR Supply-specific standards and project context.
7. Create or use an issue from `.github/ISSUE_TEMPLATE/agent_task.md` for scoped work.
8. Confirm the working branch is not `production`, `prod`, or `main` before editing.

## Spec → Build → Verify

### 1. Spec

- Restate the requested outcome, scope, out-of-scope areas, acceptance criteria, and risks.
- Identify the responsible agent persona from `agents/PERSONAS.md`.
- Check whether any protected files require explicit approval.
- Stop and ask for clarification if the request is ambiguous or conflicts with these rules.

### 2. Build

- Make the smallest practical change that satisfies the approved spec.
- Do not modify application source code for documentation-only or workflow-only tasks.
- Do not create product-family-specific React components without approval.
- Do not modify generated, dependency, or build artifact directories unless explicitly required.

### 3. Verify

- Run relevant checks, normally `npm run lint` and `npm run build` for frontend changes.
- Review the diff against the requested scope and protected files list.
- Complete the required QA report before handoff.

## Agent personas

- **Product Architect** — product intent, approval boundaries, family taxonomy, and behavior decisions.
- **Frontend Engineer** — React implementation within an approved spec.
- **Data Engineer** — catalog/data shape, migration, validation, and data quality.
- **Commerce Engineer** — pricing, cart, checkout, Stripe, quote, and order flows.
- **QA Engineer** — verification plans, regression checks, CI hygiene, and QA reporting.
- **Documentation Engineer** — docs, templates, workflow guidance, and operating instructions.

## Required handoff

When handing off work, include:

- Files created.
- Files changed.
- Summary of workflow or implementation rules added.
- Commands run and their pass/fail results.
- Confirmation that no application code changed unless explicitly in scope.
- Known risks, blockers, or follow-up tasks.
