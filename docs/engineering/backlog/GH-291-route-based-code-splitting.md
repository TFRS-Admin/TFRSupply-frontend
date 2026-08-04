<!-- Purpose: Work item, per tfrs-engineering-playbook's standards/WORK_ITEM_STANDARD.md. Migrated from GitHub issue #291 during Engineering OS re-sync (migration/RESYNC_CHECKLIST.md) — the issue itself remains the discussion/comment history; this file is now the authoritative status record. -->
# Chore: add route-based code splitting to App.jsx

## Metadata

```yaml
id: GH-291
status: Ready
priority: P1
owner: agent
dependencies: []
```

## Context

The production build emits a single 1.9MB (uncompressed) JS bundle with zero code-splitting. `src/App.jsx` eagerly imports all 15+ page components in its `<Route>` table; no file in `src/` uses `React.lazy`. Confirmed finding, 2026-07-09 review pass. Part of Epic [#282 Performance — Bundle Size & Code Splitting](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/282).

## Outcome

`npm run build` produces multiple JS chunks instead of one, the largest chunk is measurably smaller than 1.9MB, and every route still renders correctly.

## Scope

**Size: S.** Wrap each route-level page import in `React.lazy` with a shared `Suspense` boundary and a lightweight loading fallback. Start with the largest/least-frequently-visited routes (admin, showcase/demo pages) for the biggest initial-payload win with the lowest risk to the primary storefront path.

## Non-Goals

Not component-level (non-route) lazy loading. Not a bundle-analyzer/CI budget gate — that's the separate, dependent [GH-306](./GH-306-add-bundle-size-budget-check-to-ci.md).

## Acceptance Criteria

```text
Given the current single 1.9MB JS bundle
When route-based code splitting is added
Then npm run build produces multiple JS chunks instead of one, the largest chunk is measurably smaller than 1.9MB, and every route still renders correctly
```

## Verification

`npm run build` before/after comparing `dist/assets/*.js` sizes, plus a manual smoke pass through each route.

## Risks

**Risk: Low.** Well-understood, additive pattern (`React.lazy`/`Suspense`) with low regression risk if every route is smoke-tested after the change.

## Handoff Notes

Original discussion: [GitHub issue #291](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/291).
