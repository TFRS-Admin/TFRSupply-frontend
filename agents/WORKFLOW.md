# Agent Workflow

This workflow adapts the reusable `repo-starter-kit` process to the TFR Supply frontend.

## Spec → Build → Verify

### 1. Spec

Before editing, agents must:

- Restate the task in plain language.
- List files in scope.
- List files out of scope.
- Identify protected files or areas.
- Identify the responsible persona from `agents/PERSONAS.md`.
- Define acceptance criteria.
- Define verification steps.
- Stop if approvals, product behavior, or protected-file access are unclear.

### 2. Build

Agents must:

- Create or use a feature branch.
- Avoid direct work on `main`, `production`, or `prod`.
- Make the smallest approved change.
- Keep unrelated refactors out.
- Avoid protected files unless approval is documented.
- Update docs or ADRs when decisions change.
- Preserve TFR Supply-specific project memory and standards.

### 3. Verify

Agents must:

- Run `npm run lint` and `npm run build` for most frontend or documentation PRs.
- Review `git diff --name-only` against the approved scope.
- Confirm no protected files changed without approval.
- Add screenshots for visible UI changes.
- Write the required QA report.

## Default branch strategy

- `main`, `production`, and `prod` are protected release branches.
- `develop` is the integration branch.
- Use task branches such as `feature/*`, `docs/*`, `fix/*`, or `qa/*`.
- Open PRs into `develop` unless a maintainer explicitly says otherwise.

## Protected-file review

Before changing any file under these areas, agents must have explicit approval:

- `src/data/**`
- `base44/entities/**`
- `src/context/**`
- `src/components/configurator/**`
- `src/pages/BuildReview.jsx`
- Commerce, checkout, cart, quote, order, pricing, Stripe, or Shopify flows.
- Auth, user, permission, session, and security logic.
- Environment, secret, dependency, deployment, and lock files.
- Generated artifacts, dependency folders, caches, logs, and build outputs.

## QA report template

```md
## QA Report

### Files created

- 

### Files changed

- 

### Summary

- 

### Tests/checks

- ✅ `npm run lint`
- ✅ `npm run build`

### Confirmations

- [ ] No application code changed unless explicitly in scope.
- [ ] No protected files changed without approval.
- [ ] No secrets or generated artifacts committed.
- [ ] Screenshots included for UI changes, or not applicable.

### Risks / follow-up

- 
```
