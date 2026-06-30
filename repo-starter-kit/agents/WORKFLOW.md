# Agent Workflow

## Spec → Build → Verify

### 1. Spec

- Restate the task.
- List files in scope.
- List files out of scope.
- Identify protected files.
- Identify responsible persona.
- Define acceptance criteria.
- Define verification plan.

### 2. Build

- Create or use a feature branch.
- Make the smallest approved change.
- Keep unrelated changes out.
- Avoid protected files unless approved.
- Update documentation or ADRs when decisions change.

### 3. Verify

- Run relevant checks.
- Review `git diff --name-only`.
- Confirm no protected files changed without approval.
- Add screenshots for UI work.
- Write QA report.

## Default branch strategy

- `main` / `production` / `prod`: protected release branches.
- `develop`: integration branch.
- `feature/*`, `docs/*`, `fix/*`: task branches.

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

- ✅ `command`
- ⚠️ `command` — environment limitation
- ❌ `command` — failure needing follow-up

### Confirmations

- [ ] No application code changed unless explicitly in scope.
- [ ] No protected files changed without approval.
- [ ] No secrets or generated artifacts committed.
- [ ] Screenshots included for UI changes, or not applicable.

### Risks / follow-up

- 
```
