<!-- Purpose: Work item, per tfrs-engineering-playbook's standards/WORK_ITEM_STANDARD.md. Migrated from GitHub issue #293 during Engineering OS re-sync (migration/RESYNC_CHECKLIST.md) — the issue itself remains the discussion/comment history; this file is now the authoritative status record. -->
# Chore: upgrade lodash to patch high-severity code-injection and prototype-pollution advisories

## Metadata

```yaml
id: GH-293
status: Ready
priority: P1
owner: agent
dependencies: []
```

## Context

`package.json` declares `lodash@^4.17.21` as a direct dependency. Two HIGH-severity advisories apply: GHSA-r5fr-rjxr-66jc (code injection via `_.template` imports key names) and GHSA-f23m-r3pf-42rh (prototype pollution via array path bypass in `_.unset`/`_.omit`). Both are fixed in lodash >=4.17.23. `npm audit` finding, run as part of the Engineering OS adoption verification step, 2026-07-09.

## Outcome

`npm audit` no longer reports either advisory, and `npm run test`/`npm run build` still pass.

## Scope

**Size: S.** Bump the `lodash` version constraint in `package.json` and run `npm install`; confirm no code in `src/` relies on the specific vulnerable behavior (grep for `_.template`, `_.unset`, `_.omit` usage as a sanity check).

## Non-Goals

Not the other 15 `npm audit` findings — those are tracked separately.

## Acceptance Criteria

```text
Given lodash@^4.17.21 with two open HIGH-severity advisories
When lodash is upgraded to >=4.17.23
Then npm audit no longer reports either GHSA-r5fr-rjxr-66jc or GHSA-f23m-r3pf-42rh, and npm run test/build still pass
```

## Verification

`npm audit` before/after, plus `npm run test` and `npm run build`.

## Risks

**Risk: Medium.** A patch-level security bump with low behavioral-change risk, but worth the grep sanity check before merging given `_.template`/`_.unset`/`_.omit` behavior changed slightly between the vulnerable and patched versions.

## Handoff Notes

Original discussion: [GitHub issue #293](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/293).
