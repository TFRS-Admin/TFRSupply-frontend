# Claude / AI Agent Guide

Follow the same repository operating rules as `AGENTS.md`.

## Start here

1. Read `docs/START-HERE.md`.
2. Read `agents/AGENT-RULES.md`.
3. Read `agents/PERSONAS.md`.
4. Read `agents/WORKFLOW.md`.
5. Read `docs/architecture/REPO-MAP.md`.
6. Read `docs/STANDARDS.md` and `docs/PROJECT-MEMORY.md`.
7. Check git status before editing.

## Workflow

Use **Spec → Build → Verify** for every task:

- **Spec:** clarify scope, approval, protected files, acceptance criteria, and stop conditions.
- **Build:** make the smallest approved change on a feature branch; do not change `production`, `prod`, or `main` directly.
- **Verify:** run relevant checks, review the diff, and provide the required QA report.

## Safety rules

- Do not change application source code for documentation-only tasks.
- Do not create product-family-specific React components without Product Architect approval.
- Do not modify product data, configurator logic, commerce flows, auth/session code, environment files, dependency files, generated artifacts, or CI secrets unless the task explicitly approves it.
- Stop and ask for clarification when scope, ownership, protected-file access, or expected behavior is unclear.
