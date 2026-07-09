<!-- Purpose: Seed and maintain docs/engineering/BACKLOG.md — the repository's own backlog index, kept in sync with GitHub Issues. -->
# Backlog: TFRSupply Frontend

## Master Epic

[#279 — Epic: TFRS Engineering Playbook v3.0.0 Repository Health & Adoption Backlog](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/279) — **reopened 2026-07-09** after being auto-closed by GitHub when PR #302 merged (that PR's "Closes #279" only completed the documentation/adoption portion; the six child Epics below remain open).

## Top Priority Right Now

Two `P0` findings from the 2026-07-09 re-review outrank everything else below and are not yet `Ready` only because they require an explicit human/discovery decision first — that decision-making step is itself the actionable next work:

| Issue | Priority | Risk | Why it's first |
| --- | --- | --- | --- |
| [#297](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/297) Evaluate server-side enforcement path for admin authentication | P0 | **Critical** | Admin auth is unconditionally wired to a mock adapter with hardcoded demo credentials shipped in the client bundle — `/admin/*` is effectively unauthenticated in the deployed build today |
| [#303](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/303) Bug: admin quote queue and quote request submission are non-functional no-ops | P0 | High | Stubbed Base44 adapters silently drop real customer/dealer quote submissions and always show an empty admin queue — a live functional defect, not just stale naming |

## Ready

Ordered by execution priority per [`BACKLOG_STANDARD.md#execution-ordering`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/BACKLOG_STANDARD.md#execution-ordering) (unblocks-the-most-work, then Priority, then Risk, then Size):

| Issue | Epic | Priority | Risk | Size | Blocked |
| --- | --- | --- | --- | --- | --- |
| [#293](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/293) Upgrade lodash to patch high-severity advisories | #283 | P1 | Medium | S | No |
| [#288](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/288) Route components through hooks instead of direct service/adapter imports | #281 | P1 | Medium | M | No |
| [#291](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/291) Add route-based code splitting to App.jsx | #282 | P1 | Low | S | No |
| [#294](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/294) Run npm audit fix for transitive build-tooling vulnerabilities | #283 | P2 | Low | S | No |
| [#295](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/295) Remove unused react-markdown / react-quill dependencies | #283 | P2 | Low | S | No |
| [#292](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/292) Restore Vite build-size warnings | #282 | P2 | Low | S | No |
| [#298](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/298) Add unit tests for configurator SKU-matching logic, retire engineTests.js | #284 | P2 | Medium | M | No |
| [#304](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/304) Fix stale Base44-scaffold onboarding instructions in README.md | #285 | P2 | Low | S | No |
| [#305](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/305) Add a dependency vulnerability scan gate to CI | #283 | P2 | Low | S | No |
| [#287](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/287) Reconcile issue #129 with the optional-Project model | #280 | P3 | Low | S | No |
| [#299](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/299) Add a test coverage tool and baseline coverage report | #284 | P3 | Low | S | No |
| [#300](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/300) Remove stale zip archives from repository root | #285 | P3 | Low | S | No |
| [#301](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/301) Clean up stale Base44 migration comments and naming | #285 | P3 | Low | S | No |

## Backlog (Not Yet Ready)

Needs a discovery/plan pass, or is intentionally sized larger than a direct `Ready` pickup:

| Issue | Epic | Reason not Ready |
| --- | --- | --- |
| [#297](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/297) Evaluate server-side enforcement path for admin authentication | #283 | **P0/Critical — see Top Priority above.** Risk Critical — needs an explicit human-reviewed decision before implementation, per `SECURITY_STANDARD.md`'s Threat Model First step |
| [#303](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/303) Bug: admin quote queue and quote request submission are non-functional no-ops | None | **P0 — see Top Priority above.** Needs a discovery pass to confirm the real destination for quote data post-Base44-removal before implementation |
| [#286](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/286) Migrate pre-existing open issues to `## Metadata` format | #280 | Size L, needs batching plan across 113 issues before execution |
| [#289](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/289) Unify the two parallel configurator SKU-matching engines | #281 | Risk High — needs a discovery pass (field-by-field rule comparison) and a full `commands/plan.md` spec before implementation |
| [#290](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/290) Split ConfiguratorModule.tsx into subcomponents | #281 | Blocked by #289 |
| [#296](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/296) Tech Debt: evaluate major-version dependency upgrade path (now also covers `moment`/`date-fns` consolidation) | #283 | Research spike, Size L — output is a sequencing plan, not direct implementation |
| [#306](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/306) Add a bundle-size budget check to CI | #282 | Blocked by #291 — no meaningful budget exists until code-splitting lands |

## Deferred

None — every issue in this pass is either `Ready` or has an explicit reason it isn't, above.

## Pre-Existing Backlog (Predates the `## Metadata` Standard)

This repository's original bootstrap (2026-06-30/07-01) already produced a real, substantial issue hierarchy: 12 `[EPIC]` issues (#5–#14, #19–#20) mapped to `docs/project-management/01_epics.md`'s EPIC-01–EPIC-10 definitions, ~100 `[SPEC]`/`[BUILD]`/`[QA]`/`[META]` issues under them, and the permanent north-star vision issue [#107](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/107). None of these currently carry a `## Metadata` block, so they are not listed in the `Ready`/`Backlog` tables above — [#286](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/286) tracks retrofitting them. This is a real, explicit gap (not a silent omission): until #286 lands, an agent determining "what's next" from this file alone will not see that pre-existing backlog and must additionally check the open-issues list directly, per [`AI_AGENT_OPERATING_MODEL.md#2-how-to-determine-current-work`](../../AI_AGENT_OPERATING_MODEL.md#2-how-to-determine-current-work).

## Last Updated

2026-07-09, by an independent from-scratch re-review (Engineering Review & Roadmap Initialization pass). 27 issues now tracked under the master Epic (up from 22): #279 reopened, #297 escalated to `P0`/`Critical`, four new issues filed (#303-#306), #296 updated with an additional finding.

## Related Documents

[`commands/backlog.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/backlog.md) · [`BACKLOG_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/BACKLOG_STANDARD.md) · [`ISSUE_METADATA_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/ISSUE_METADATA_STANDARD.md) · sibling [`docs/engineering/CURRENT_SPRINT.md`](./CURRENT_SPRINT.md) · [`docs/engineering/ROADMAP.md`](./ROADMAP.md)
