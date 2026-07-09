<!-- Purpose: Seed and maintain docs/engineering/BACKLOG.md — the repository's own backlog index, kept in sync with GitHub Issues. -->
# Backlog: TFRSupply Frontend

## Master Epic

[#279 — Epic: TFRS Engineering Playbook v3.0.0 Repository Health & Adoption Backlog](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/279) — reopened 2026-07-09 after being auto-closed by GitHub when PR #302 merged (that PR's "Closes #279" only completed the documentation/adoption portion; the child Epics below remain open).

## Child Epics

| Epic | Priority | Risk | Children |
| --- | --- | --- | --- |
| [#280 Playbook v3.0.0 Adoption Completion](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/280) | P1 | Low | #286, #287 |
| [#281 Architecture Boundary Enforcement](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/281) | P1 | Medium | #288, #289, #290 |
| [#282 Performance — Bundle Size & Code Splitting](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/282) | P1 | Low | #291, #292, #306 |
| [#283 Dependency & Security Hardening](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/283) | P1 | Medium | #293, #294, #295, #296, #297, #305 |
| [#284 Test Coverage Gaps in Configurator & Pricing Domains](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/284) | P2 | Medium | #298, #299 |
| [#285 Technical Debt Cleanup](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/285) | P3 | Low | #300, #301, #304 |
| [#307 Commerce Data Integrity — Quote Submission Pipeline](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/307) (new, 2026-07-09) | P0 | High | #303 |

**28 issues total** under the master Epic (1 master + 7 child Epics + 20 task issues), up from 22 after the 2026-07-09 re-review added #303-#307 and escalated #297.

## Top Priority Right Now

Two `P0` findings outrank the Epic priority ordering below — both are live production issues, not backlog hygiene, and both sit in the **Discovery** bucket because they need an explicit decision/investigation before they can become `Ready`:

| Issue | Priority | Risk | Why it's first |
| --- | --- | --- | --- |
| [#297](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/297) Evaluate server-side enforcement path for admin authentication | P0 | **Critical** | Admin auth is unconditionally wired to a mock adapter with hardcoded demo credentials shipped in the client bundle — `/admin/*` is effectively unauthenticated in the deployed build today |
| [#303](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/303) Bug: admin quote queue and quote request submission are non-functional no-ops | P0 | High | Stubbed Base44 adapters silently drop real customer/dealer quote submissions and always show an empty admin queue |

## Ready

Every entry below has `Blocked: No`, a complete `## Metadata` block, and needs no further discovery — pick up in this order per [`BACKLOG_STANDARD.md#execution-ordering`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/BACKLOG_STANDARD.md#execution-ordering) (unblocks-the-most-work, then Priority, then Risk, then Size):

| Order | Issue | Epic | Priority | Risk | Size | Agent Persona |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [#293](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/293) Upgrade lodash to patch high-severity advisories | #283 | P1 | Medium | S | DevOps |
| 2 | [#288](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/288) Route components through hooks instead of direct service/adapter imports | #281 | P1 | Medium | M | Frontend |
| 3 | [#291](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/291) Add route-based code splitting to App.jsx | #282 | P1 | Low | S | Frontend |
| 4 | [#294](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/294) Run npm audit fix for transitive build-tooling vulnerabilities | #283 | P2 | Low | S | DevOps |
| 5 | [#295](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/295) Remove unused react-markdown / react-quill dependencies | #283 | P2 | Low | S | DevOps |
| 6 | [#292](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/292) Restore Vite build-size warnings | #282 | P2 | Low | S | DevOps |
| 7 | [#298](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/298) Add unit tests for configurator SKU-matching logic, retire engineTests.js | #284 | P2 | Medium | M | QA |
| 8 | [#304](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/304) Fix stale Base44-scaffold onboarding instructions in README.md | #285 | P2 | Low | S | Documentation |
| 9 | [#305](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/305) Add a dependency vulnerability scan gate to CI | #283 | P2 | Low | S | DevOps |
| 10 | [#287](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/287) Reconcile issue #129 with the optional-Project model | #280 | P3 | Low | S | Backlog-Manager |
| 11 | [#299](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/299) Add a test coverage tool and baseline coverage report | #284 | P3 | Low | S | QA |
| 12 | [#300](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/300) Remove stale zip archives from repository root | #285 | P3 | Low | S | Documentation |
| 13 | [#301](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/301) Clean up stale Base44 migration comments and naming | #285 | P3 | Low | S | Documentation |

## Blocked

Waiting on another open issue — `Blocked: Yes` in the issue's own `## Metadata`, cleared automatically the moment the blocking issue closes:

| Issue | Epic | Blocked By | Reason |
| --- | --- | --- | --- |
| [#290](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/290) Split ConfiguratorModule.tsx into subcomponents | #281 | #289 | Extracting sub-components now would need to be redone once SKU-matching logic moves to the shared engine |
| [#306](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/306) Add a bundle-size budget check to CI | #282 | #291 | No meaningful budget exists until code-splitting lands |

## Discovery

Needs an investigation, spike, or explicit human decision before acceptance criteria can be finalized and the issue moved to `Ready` — this is deliberately not the same bucket as `Blocked` (nothing else has to close first; the work itself is undefined until discovery runs):

| Issue | Epic | Priority | Risk | What discovery must resolve |
| --- | --- | --- | --- | --- |
| [#297](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/297) Evaluate server-side enforcement path for admin authentication | #283 | **P0** | **Critical** | Whether to implement server-side enforcement or record an explicit accepted-risk decision with a revisit trigger — requires human sign-off, not an agent's unilateral call |
| [#303](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/303) Bug: admin quote queue and quote request submission are non-functional no-ops | #307 | **P0** | High | The real post-Base44 destination for quote data (Shopify Admin API? new backend? webhook?) |
| [#289](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/289) Unify the two parallel configurator SKU-matching engines | #281 | P2 | High | Whether the two engines' rules have already diverged (field-by-field comparison) before deciding which becomes canonical |
| [#296](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/296) Tech Debt: evaluate major-version dependency upgrade path | #283 | P3 | Medium | Breaking-change sequencing across React 19 / Tailwind 4 / Stripe SDKs / `moment`-vs-`date-fns` consolidation |
| [#286](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/286) Migrate pre-existing open issues to `## Metadata` format | #280 | P2 | Low | A batching plan across 113 issues (Size L — too large to execute as a single pass) |

## Deferred

None this pass — every issue above is `Ready`, `Blocked`, or `Discovery` with an explicit reason, per [`BACKLOG_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/BACKLOG_STANDARD.md). The repository's pre-existing product-roadmap work (113 `[SPEC]`/`[BUILD]`/`[QA]`/`[EPIC]` issues, tracked against `docs/project-management/01_epics.md`) is out-of-window by design — see [`docs/engineering/ROADMAP.md`](./ROADMAP.md) — but that is a scoping decision at the roadmap level, not a per-issue deferral within this backlog.

## Technical Debt

Cross-cutting tag, not a status — an issue can be `Ready`/`Blocked`/`Discovery` *and* technical debt simultaneously. Grouped here for visibility per [`REPO_HEALTH_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REPO_HEALTH_STANDARD.md)'s technical-debt-trend dimension:

| Issue | Status Bucket | Description |
| --- | --- | --- |
| [#300](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/300) Remove stale zip archives from repository root | Ready | 3 non-build-input archives at repo root |
| [#301](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/301) Clean up stale Base44 migration comments and naming | Ready | Comment/naming residue in `appConfig.js`, `team44/Layout.tsx` |
| [#304](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/304) Fix stale Base44-scaffold onboarding instructions in README.md | Ready | Onboarding-doc debt — wrong env vars, wrong platform boilerplate |
| [#296](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/296) Tech Debt: evaluate major-version dependency upgrade path | Discovery | Version drift across 12+ direct dependencies, plus redundant `moment`/`date-fns` |

Epic #285 (Technical Debt Cleanup) groups the first three; #296 lives under #283 (Dependency & Security Hardening) but is debt-flavored by nature.

## Dependency Graph

```text
#289 (Discovery: unify configurator engines) ──blocks──> #290 (Blocked: split ConfiguratorModule.tsx)
#291 (Ready: route-based code splitting)      ──blocks──> #306 (Blocked: bundle-size CI budget)

All other Ready/Discovery issues: no inbound or outbound "Blocked by" edges.
```

No dependency cycles exist — verified by inspection: `#289 → #290` and `#291 → #306` are the only two edges in the graph, both one-directional, both terminating in an issue with no further children.

## Pre-Existing Backlog (Predates the `## Metadata` Standard)

This repository's original bootstrap (2026-06-30/07-01) already produced a real, substantial issue hierarchy: 12 `[EPIC]` issues (#5–#14, #19–#20) mapped to `docs/project-management/01_epics.md`'s EPIC-01–EPIC-10 definitions, ~100 `[SPEC]`/`[BUILD]`/`[QA]`/`[META]` issues under them, and the permanent north-star vision issue [#107](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/107). None of these currently carry a `## Metadata` block, so they are not listed in the buckets above — [#286](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/286) (in `Discovery`) tracks retrofitting them.

## Last Updated

2026-07-09, by an Engineering Backlog Initialization pass: reorganized into explicit Ready/Blocked/Discovery/Deferred/Technical-Debt buckets, added Epic #307 (re-parenting #303 under it), verified no duplicate issues across #279-#307, verified both dependency edges are valid and acyclic.

## Related Documents

[`commands/backlog.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/backlog.md) · [`BACKLOG_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/BACKLOG_STANDARD.md) · [`ISSUE_METADATA_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/ISSUE_METADATA_STANDARD.md) · sibling [`docs/engineering/CURRENT_SPRINT.md`](./CURRENT_SPRINT.md) · [`docs/engineering/ROADMAP.md`](./ROADMAP.md)
