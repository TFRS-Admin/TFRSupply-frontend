# Epic Workflow

This repo uses an epic-based delivery workflow for AI-agent-safe development.

## Workflow: Epic → Spec → Approval → Build → QA → Release

```text
Epic
  ↓
Spec issue
  ↓
Approval
  ↓
Build issue
  ↓
QA issue
  ↓
Release
```

## 1. Epic

An epic defines a major workstream. It should explain the business purpose, success criteria, likely protected files, risk level, and owner personas.

Epics do not authorize coding by themselves. They organize work and make dependencies visible.

## 2. Spec issue

A spec issue defines the intended behavior, data contract, integration boundary, UI state model, or QA plan before implementation begins.

Every spec issue must include:

- Goal.
- Scope.
- Out of scope.
- Agent persona.
- Acceptance criteria.
- Protected files warning.
- Likely files involved.
- Blockers.
- QA requirements.

## 3. Approval

A spec becomes approved only when the required owner personas confirm the direction.

Common approval owners:

- Product Architect for product behavior, launch scope, package rules, and quote-readiness gates.
- Data Engineer for product data, fitment, required components, and data contracts.
- Commerce Engineer for Shopify index, SKUs, variants, pricing references, quote, cart, checkout, and order flows.
- Frontend Engineer for UI architecture and module/page integration.
- QA Engineer for regression requirements and launch verification.
- Security / Platform Engineer for secrets, auth/session, deployment, CI permissions, and infrastructure risk.

## 4. Build issue

A build issue implements an approved spec.

Mandatory rule: every implementation/build issue must be blocked by at least one approved spec issue. No coding starts before specs are approved.

Every build issue must include:

- Link to approved spec issue(s).
- Exact implementation scope.
- Protected-file approvals.
- Test plan.
- Screenshot plan when UI changes.
- Rollback or follow-up notes when relevant.

## 5. QA issue

A QA issue verifies completed work against the approved spec and Definition of Done.

QA should confirm:

- Acceptance criteria are satisfied.
- No out-of-scope files changed.
- Protected files were not changed without approval.
- `npm run lint` passes.
- `npm run build` passes.
- Screenshots are attached for visible UI changes.
- Product data, SKUs, prices, fitment, required components, commerce behavior, and configurator logic were not invented or changed without approval.

## 6. Release

Release happens only after QA approval. Release notes should link the epic, spec issue, build issue, QA evidence, and any ADRs.

## How agents should use GitHub Issues

- Use an Epic issue to define the workstream.
- Use Spec issues to define decisions and contracts.
- Use Build issues only after their spec blockers are approved.
- Use QA issues for verification evidence.
- Mark issues with fields: Epic, Phase, Agent Persona, Risk Level, Protected Files?, Blocked, and QA Required.

## How agents should use PRs

- Open one focused PR per approved build/spec/docs task.
- Link the PR to the GitHub issue.
- Target `develop` unless a maintainer specifies otherwise.
- Do not target `main`, `production`, or `prod` directly.
- Complete the PR template, including Spec → Build → Verify and QA sections.
- Include screenshots for UI changes.
- Do not mix unrelated refactors into launch work.

## Stop conditions

Stop and ask for clarification when:

- A build issue does not link to an approved spec issue.
- Protected files are needed but approval is missing.
- Product data, prices, SKUs, fitment, required components, or commerce behavior are unclear.
- Configurator logic would need to change without Product Architect and Frontend Engineer approval.
- Tests or required QA evidence cannot be produced.
