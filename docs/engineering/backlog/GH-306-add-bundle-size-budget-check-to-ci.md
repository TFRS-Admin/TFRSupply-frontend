<!-- Purpose: Work item, per tfrs-engineering-playbook's standards/WORK_ITEM_STANDARD.md. Migrated from GitHub issue #306 during Engineering OS re-sync (migration/RESYNC_CHECKLIST.md) — the issue itself remains the discussion/comment history; this file is now the authoritative status record. -->
# Chore: add a bundle-size budget check to CI

## Metadata

```yaml
id: GH-306
status: Blocked
priority: P3
owner: agent
dependencies: [GH-291]
```

## Context

Nothing in CI catches a bundle-size regression today. `vite.config.js`'s `logLevel: 'error'` will bring back a local build-time warning once restored, but there is no CI-level enforcement — a future PR could reintroduce a large unsplit chunk and nothing would block it. New finding from the 2026-07-09 re-review (independent from-scratch pass) — explicitly named as a warranted follow-up in [GH-291](./GH-291-route-based-code-splitting.md)'s own Non-Goals. Part of Epic [#282 Performance — Bundle Size & Code Splitting](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/282).

## Outcome

CI surfaces a clear failure or warning naming which chunk regressed and by how much, against a per-chunk size budget.

## Scope

**Size: S.** Once [GH-291](./GH-291-route-based-code-splitting.md) (route-based code splitting) lands, add a bundle-size check to CI — either a dedicated `size-limit`/`bundlesize`-style tool with a defined budget per chunk, or a simple script comparing `dist/assets/*.js` sizes against a checked-in baseline. Set the initial budget from the post-#291 measured sizes, not from today's 1.9MB single bundle.

## Non-Goals

Not implementing the code-splitting itself — that's [GH-291](./GH-291-route-based-code-splitting.md). This item is CI enforcement only.

## Acceptance Criteria

```text
Given a defined per-chunk size budget established after GH-291 lands
When a future PR increases a chunk beyond that budget
Then CI surfaces a clear failure or warning naming which chunk regressed and by how much
```

## Verification

Intentionally regress a chunk size in a test branch and confirm the new CI check catches it.

## Risks

**Risk: Low.** No meaningful budget exists until the code-splitting in GH-291 lands, which is why this is blocked rather than merely sequenced.

## Handoff Notes

Blocked by [GH-291](./GH-291-route-based-code-splitting.md). Original discussion: [GitHub issue #306](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/306).
