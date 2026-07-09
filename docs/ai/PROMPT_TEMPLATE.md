# Prompt Templates

> Consulted from [`AGENTS.md`](../../AGENTS.md) (the entry point) when drafting a short implementation prompt — not a starting point on its own.

## Purpose

Every template below assumes the reading agent already knows `AGENTS.md`, `AI_DEVELOPMENT_PLAYBOOK.md`, `IMPLEMENTATION_WORKFLOW.md`, and `ARCHITECTURE_PRINCIPLES.md` — that is the entire point of the playbook existing. Because the agent no longer needs the workflow, layer rules, QA commands, or Definition of Done spelled out in every prompt, an implementation prompt only needs to state what is unique to that issue: objective, scope, files, non-goals, and acceptance criteria. Fill in the bracketed fields; delete this Purpose section from the actual prompt you send.

Target length: 20–30 lines per prompt. If a filled-in template is pushing past 40 lines, the issue is probably too large — split it.

## Foundation Issue Template

```
Read docs/ai/AI_DEVELOPMENT_PLAYBOOK.md and docs/ai/ARCHITECTURE_PRINCIPLES.md.

Issue: [issue id/title]
Objective: Add the [domain] foundation — types, schema, service, adapter, hook — as
an additive, no-runtime-change boundary, matching the pattern in
docs/architecture/[REFERENCE_FOUNDATION].md.

Scope (files allowed to change):
- src/types/[domain].ts
- src/schemas/[domain].schema.ts
- src/services/[domain]/
- src/adapters/[domain]/ (default "unavailable" adapter only)
- src/hooks/[domain]/ (if applicable)
- docs/architecture/[DOMAIN]_FOUNDATION.md
- tests/[domain]-foundation.test.mjs

Non-goals: No React wiring, no live provider implementation, no behavior change
to any existing route, component, or service.

Branch: feature/[issue-id]-[short-title]

Acceptance criteria:
- [ ] Types, schema, service, and adapter compile and typecheck.
- [ ] Default adapter returns pending/null results only.
- [ ] Foundation doc added under docs/architecture describing purpose, layer
      diagram, responsibilities, and current implementation boundary.
- [ ] npm run lint / build / typecheck / test all pass.
```

## Feature Issue Template

```
Read docs/ai/AI_DEVELOPMENT_PLAYBOOK.md and docs/ai/ARCHITECTURE_PRINCIPLES.md.

Issue: [issue id/title]
Objective: [one-sentence user/business outcome]

Scope: Wire [route/component] to [service].[method] via a new/existing hook in
src/hooks/[domain]. Cover loading, empty, success, and error states.

Out of scope: [pricing/commerce/configurator behavior not touched], [any
adjacent surface not listed above].

Data/service dependency: [service name and method already implemented in
src/services/[domain]].

Branch: feature/[issue-id]-[short-title]

Acceptance criteria:
- [ ] Feature reads through the service-backed hook only, no direct JSON/loader
      access.
- [ ] Loading, empty, success, and error states are implemented and tested.
- [ ] Screenshot evidence attached for any visual change.
- [ ] npm run lint / build / typecheck / test all pass.
```

## Refactoring Issue Template

```
Read docs/ai/AI_DEVELOPMENT_PLAYBOOK.md and docs/ai/ARCHITECTURE_PRINCIPLES.md.

Issue: [issue id/title]
Refactor goal: [what structural problem this fixes, e.g. duplicated pricing
resource hook logic]

Current problem: [current file(s)/pattern, e.g. src/hooks/foo/useX.ts duplicates
the resource-state pattern from useCatalogResource]

Target structure: [what the refactor should look like, referencing an existing
pattern in the repo, e.g. src/hooks/useCatalog.ts]

Behavior preservation requirement: No public component, service, or hook
signature changes observable to callers outside [scope].

Branch: refactor/[issue-id]-[short-title]

Acceptance criteria:
- [ ] Public behavior is unchanged; existing tests still pass unmodified where
      they assert behavior, not internal structure.
- [ ] Imports still follow components → hooks → services → loaders → validators
      → schemas/types → JSON.
- [ ] Dead code removed only where proven unused.
- [ ] npm run lint / build / typecheck / test all pass.
```

## Bug Fix Template

```
Read docs/ai/AI_DEVELOPMENT_PLAYBOOK.md and docs/ai/ARCHITECTURE_PRINCIPLES.md.

Issue: [issue id/title]
Problem: [what's broken]
Reproduction: [exact steps/route/input that trigger it]
Expected vs actual: [expected] vs [actual]
Suspected cause / affected boundary: [component/hook/service/adapter/domain
module and file path if known]

Branch: bugfix/[issue-id]-[short-title]

Acceptance criteria:
- [ ] Root cause documented in the PR description.
- [ ] Fix is limited to the affected boundary; no unrelated refactor.
- [ ] Regression test added under tests/ reproducing the original bug.
- [ ] npm run lint / build / typecheck / test all pass, including the new
      regression test.
```

## Documentation Update Template

```
Read docs/ai/AI_DEVELOPMENT_PLAYBOOK.md.

Issue: [issue id/title]
Documentation goal: [what's missing, stale, or wrong]
Audience: [AI agents / human contributors / reviewers]
Documents to create or update: [exact file paths under docs/]
Source material: [architecture doc, code path, or PR this documents]

Branch: docs/[issue-id]-[short-title]

Acceptance criteria:
- [ ] No application, service, hook, schema, or domain code is changed.
- [ ] No placeholders remain; commands, paths, and owners are exact.
- [ ] Related docs are cross-linked (update docs/ai/REPOSITORY_INDEX.md if a
      new top-level doc is added).
- [ ] npm run lint / build / typecheck / test all pass (confirms no runtime
      files were accidentally touched).
```
