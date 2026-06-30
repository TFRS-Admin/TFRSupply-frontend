---
name: Agent task
description: Scoped task for an AI agent
title: "[Agent Task]: "
labels: ["agent-task"]
assignees: []
---

## Agent persona

Choose one:

- [ ] Product Architect
- [ ] Frontend Engineer
- [ ] Data Engineer
- [ ] Commerce Engineer
- [ ] QA Engineer
- [ ] Documentation Engineer

## Goal

Describe the outcome the agent should deliver.

## Spec

### Scope

List the files, directories, or features in scope.

### Out of scope

List anything the agent must not change.

### Protected files review

- [ ] No protected files are required.
- [ ] Protected files are required and explicit approval is documented below.

Approval notes:

## Build constraints

- [ ] Do not change `production`, `prod`, or `main` directly.
- [ ] Do not create product-family-specific React components without approval.
- [ ] Do not change product data unless explicitly approved.
- [ ] Do not change configurator logic unless explicitly approved.
- [ ] Do not change commerce, checkout, pricing, quote, order, or Stripe flows unless explicitly approved.

## Verify plan

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Other:

## Acceptance criteria / Definition of Done

- [ ] The requested change is implemented.
- [ ] Only in-scope files changed.
- [ ] Protected files were not changed without documented approval.
- [ ] Relevant checks are run and documented.
- [ ] No unintended product behavior changes were introduced.
- [ ] Risks, assumptions, and follow-up work are noted.

## When to stop and ask

Stop if scope is unclear, protected files are needed without approval, product behavior could change unexpectedly, or verification cannot be completed.
