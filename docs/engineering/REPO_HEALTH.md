<!-- Purpose: Seed and maintain docs/engineering/REPO_HEALTH.md — the running Repository Health Report history per REPO_HEALTH_STANDARD.md. -->
# Repository Health: TFRSupply Frontend

## Recorded Cadence

- **Weekly:** issue metadata hygiene triage, automated security scan review (`npm audit`).
- **Monthly:** documentation drift, dependency health, testing, CI.
- **Quarterly:** architecture drift, technical debt trend, full manual security audit.
- Status as of this writing: first full pass 2026-07-09; weekly pass 2026-07-23; full re-verification pass 2026-09-13 (all eight dimensions re-checked against current code after a ~7-week gap in recorded passes — see below). Next weekly pass due 2026-09-20. Next monthly pass due 2026-10-13; next quarterly pass (architecture drift, technical debt trend, full manual security audit) due 2026-12-13.

## Report History

### 2026-07-09 — First Pass (Full, All Eight Dimensions)

```text
Architecture drift: Degrading (first baseline). 14 component files import services/adapters
  directly, bypassing the mandated components -> hooks -> services boundary
  (docs/architecture/SERVICE_LAYER.md rules 3-4). Two parallel, non-integrated configurator
  SKU-matching engines exist (src/domain/configuration/configuratorEngine.js vs. inline logic
  in src/components/configurator/ConfiguratorModule.tsx). Filed as #281 (Epic) with children
  #288, #289, #290.

Documentation drift: Flat. ARCHITECTURE.md, the 56 docs/architecture/*.md files, and
  docs/DOCUMENTATION_HIERARCHY.md remain accurate against actual repository structure.
  README.md's adopted-playbook-version pointer was stale (2.4.0) and has been corrected to
  3.0.0 as part of this same pass.

Dependency health: Degrading (first baseline). npm audit: 16 vulnerabilities (1 low, 9
  moderate, 6 high). One HIGH is a direct dependency (lodash, two advisories). Several direct
  dependencies are 1+ major version behind (React 18->19, react-router-dom 6->7, Tailwind
  3->4, Stripe SDKs, others). Filed as #283 (Epic) with children #293, #294, #295, #296, #297.

Security: Degrading (first baseline). Beyond the dependency findings above: admin
  authentication is entirely client-side and self-documented as non-authoritative
  (src/config/appConfig.js, src/components/AdminAuthGuard.jsx) — filed as #297. No hardcoded
  secrets found; only dangerouslySetInnerHTML usage is low-risk (internal chart config, not
  user input); react-markdown/react-quill (carrying the dompurify/quill advisory chain) are
  unused dead dependencies — filed as #295.

Technical debt: Degrading (first baseline — no prior trend to compare). 3 stale zip archives
  at repository root (already flagged in ARCHITECTURE.md, never removed); stale Base44-era
  comments/naming in src/config/appConfig.js and src/pages/team44/Layout.tsx. Filed as #285
  (Epic) with children #300, #301. TODO/FIXME/HACK/XXX marker density is near-zero across
  src/ — a positive signal on its own, but combined with the findings above indicates debt
  exists without being flagged inline, not that debt is absent.

Testing: Degrading (first baseline). 1143/1143 tests pass (node --test tests/*.test.mjs), but
  coverage is unevenly distributed: the older configurator engine
  (src/domain/configuration/configuratorEngine.js) has zero direct test coverage; its only
  "tests" are a dead in-browser self-test harness (engineTests.js, unreferenced outside
  itself). The newer configurator's SKU-matching functions are only smoke-tested via
  rendered-HTML regex assertions, not direct unit tests. No coverage tool is configured
  (no c8/nyc, no test:coverage script), so this is a line-count-proxy assessment, not a
  measured percentage. Filed as #284 (Epic) with children #298, #299.

CI: Improving. .github/workflows/ci.yml (added earlier today in the v2.4.0 adoption sprint)
  runs lint/typecheck/test/build as separate required jobs; all four pass cleanly against the
  current tree (confirmed directly this session, not assumed). vite.config.js's
  logLevel: 'error' override silences the build-size warning that would otherwise have
  surfaced the 1.9MB-bundle finding on every build — filed as #292 (child of #282).

Issue metadata hygiene: Degrading (first baseline). Zero of this repository's 113 pre-existing
  open issues (#5-#131, plus north-star #107) carry the ## Metadata block ISSUE_METADATA_STANDARD.md
  requires, since they predate that standard (introduced in playbook v3.0.0, 2026-07-09, the
  same day as this pass). The 22 issues created by this adoption pass (#279-#301) all carry a
  complete block. Filed as #286 (child of #280) to retrofit the pre-existing 113.

Gaps: None this cycle — all eight dimensions were assessed with direct evidence (commands run,
  files read, grep results), none skipped.

Escalation: None immediate. No Critical-severity finding. The direct-dependency lodash
  advisories are High severity (not Critical) and are already filed as the top-priority Ready
  item in docs/engineering/BACKLOG.md (#293).

Filed: #279 (master Epic), #280-#285 (six child Epics), #286-#301 (sixteen task issues) — see
  docs/engineering/BACKLOG.md for the full list with Priority/Risk/Size and Ready ordering.
```

### 2026-07-23 — Weekly Pass (Issue Metadata Hygiene, Security)

```text
Due this cycle per the cadence table above: issue metadata hygiene, security. Architecture
  drift, documentation drift, dependency health, technical debt, testing, and CI are monthly/
  quarterly dimensions not due until 2026-08-09 / 2026-10-09 respectively — not assessed this
  pass, not a gap.

Security: Flat vs. the 2026-07-09 baseline. `npm audit` still reports 16 vulnerabilities across
  the same package set (lodash, vite/rollup, minimatch/picomatch, ajv/postcss/js-yaml/
  react-router, quill/react-quill/dompurify, @babel/core, flatted, brace-expansion) — none of
  #293/#294/#295/#296 have been remediated yet. No new vulnerabilities introduced (no dependency
  changes since baseline, confirmed via package-lock.json).

  Correcting the record: the 2026-07-09 entry above states "Escalation: None immediate. No
  Critical-severity finding" — that was accurate only for the *first* pass earlier that day.
  A same-day independent re-review (also 2026-07-09, timestamps 20:31-22:05 UTC) escalated #297
  to Risk: Critical (admin auth ships unconditionally wired to a mock adapter; hardcoded demo
  credentials, including `demo-super-admin`, are readable in the client bundle; `/admin/quotes`,
  `/admin/pricing-imports`, `/admin/shopify-sync`, `/admin/quote-builder` are effectively
  unauthenticated in production today) and filed #303/#307 (P0: quote-request submissions and
  the admin quote queue are silently no-op stubs — real customer/dealer leads are being dropped).
  Neither finding was ever reflected in this file's escalation section. Both remain open and
  unactioned 14 days later. Re-escalating now per repo-health's step 6 (escalate Critical/High
  security findings immediately, don't wait for report publication) — this is a re-flag of an
  existing, already-filed gap, not a new finding.

Issue metadata hygiene: Degrading, unchanged — #286 (retrofit the 113 pre-existing open issues
  with a ## Metadata block) has not been started; still 0/113. Separately, found and fixed in
  this same pass: docs/engineering/BACKLOG.md — itself required to stay "kept in sync with
  GitHub Issues" per its own header — was missing 5 live issues entirely (#303, #304, #305,
  #306, #307), all filed 2026-07-09 by the same independent re-review, because that review ran
  after BACKLOG.md had already been written that day and nothing folded the new issues back in.
  Fixed directly in this pass rather than filed separately, matching how the 2026-07-09 pass
  fixed README.md's stale playbook-version pointer inline. See docs/engineering/BACKLOG.md's
  2026-07-23 changelog entry for the exact diff.

Activity since 2026-07-09: repository was fully dormant (no commits, PRs, or issues) until
  2026-07-23, when #298 (configurator SKU-matching unit tests, retire engineTests.js) was picked
  up, implemented, and merged via PR #308 — closed, state_reason: completed. Open-issue count:
  141 -> 140.

Gaps: None for the two due dimensions — both assessed with direct evidence (npm audit output,
  live issue reads, BACKLOG.md diff). The six not-due dimensions are explicitly deferred to
  their monthly/quarterly cadence, not silently skipped.

Escalation: #297 (Risk: Critical, admin auth) and #303/#307 (P0, quote pipeline data loss) both
  need a human decision before an agent can act — flagging again, unresolved since 2026-07-09.
  Neither is in scope for automated pickup under this session's low-risk-only automation
  guardrails (P2/P3, Risk Low/Medium only) by design.

Filed: none new this pass (both actionable findings — the escalation and the BACKLOG.md gap —
  were already covered by existing issues #297/#303/#307, or fixed directly in-place per
  repo-health.md's own precedent for small doc-sync corrections).
```

### 2026-09-13 — Full Re-verification Pass (All Eight Dimensions, ~7-week gap)

```text
Trigger: a direct user request for a full repo/site/project evaluation and roadmap refresh,
  fanned out across code-review, security-audit, test-quality, and live-site-walkthrough
  specialist passes, reconciled against docs/MASTER_EXECUTION_PROGRAM.md (last audited
  2026-07-08) and this file's own 2026-07-23 entry. No recorded pass happened in the
  intervening ~7 weeks despite the stated weekly/monthly cadence above — see Gaps.

Architecture drift: Mixed. The #281 Epic's original 14-file components/pages-import-services
  violation list (GH-288) was itself found stale in a 2026-08-04 correction (PR #323) and is
  now accurate (24 files, correctly scoped to include src/pages/). This pass found one further,
  narrower instance the existing item doesn't cover: src/adapters/pricing/livePricingAdapter.ts
  (an adapter, not a component/page) imports a service directly
  (dealerContractResolutionService), one edge from a real import cycle since
  quoteBuilderWorkspaceService.ts already calls into livePricingAdapter. Not filed as a new
  GH item this pass (no GitHub write access from this session) — noted in
  MASTER_EXECUTION_PROGRAM.md's Refresh Log for the next session with issue access to file.
  The two-parallel-configurator-engines finding (#289) is resolved (Cancelled/obsolete per its
  backlog entry — the dead engine was deleted in #321).

Documentation drift: Was severe, partially corrected in this pass. MASTER_EXECUTION_PROGRAM.md
  (the roadmap of record) had gone stale for ~2 months / ~90 commits despite its own Section 7
  mandating an update after every merged PR — CI, admin lockdown, and quote delivery had all
  shipped without the doc ever being told. Corrected in this pass: see that file's 2026-09-13
  Refresh Log and updated Section 3.1/6/9/10. Also corrected: backlog item GH-293 (lodash
  advisories) was still marked Ready; lodash was already resolved at the installed 4.18.1 — now
  marked Done.

Dependency health: Improving. npm audit: 12 vulnerabilities (1 low, 7 moderate, 4 high), down
  from 16 (1/9/6) at the 2026-07-09 baseline. lodash (the one direct-dependency HIGH from the
  baseline) is resolved. Remaining high-severity findings are transitive dev-tooling
  (browserslist, js-yaml, nanoid) never bundled into the shipped SPA. dompurify/fflate (the
  runtime-reachable moderates) trace to an unused dependency, jspdf — never imported anywhere
  in src/; removing it clears both for free (see MASTER_EXECUTION_PROGRAM.md PR-41).
  react-router-dom's SSR-hydration CVEs confirmed unreachable (this app has no SSR).
  @base44/sdk/@base44/vite-plugin remain direct dependencies; the most recent commit before
  this pass ("Update base44 packages") bumped rather than removed them — worth a founder
  decision on whether an automated bot is fighting the roadmap's stated removal goal.

Security: Improving, with one new non-critical finding. The 2026-07-23 entry's Critical
  escalation (#297, admin auth) is now mitigated at the route level: VITE_ADMIN_ENABLED strips
  all admin/dev/showcase routes from the production build by default (verified in src/App.jsx),
  and every guarded route is wrapped in AdminAuthGuard. The underlying auth is still mock
  client-side identity selection if the flag is ever set true — that part of #297 is still
  legitimately open, just no longer reachable by default. The P0 quote-pipeline data-loss
  finding (#303/#307) is resolved: quoteDeliveryAdapter.ts delivers for real, with tests
  guarding against a regression back to fake success. New this pass: Caddyfile ships no CSP,
  HSTS, X-Frame-Options, or Permissions-Policy (only X-Content-Type-Options and Referrer-Policy)
  — concrete pre-launch gap, folds into existing PR-29. Also new: ConfiguratorPricingSummary.tsx
  (public PDP) has no customer-type gate on its dealer-cost display row — dormant today (the
  live pricing adapter with real dealer-cost data is wired only into the admin-gated quote
  builder), but a guardrail gap worth closing cheaply now (PR-39) rather than discovering later.

Technical debt: Improving, incompletely. Stripe dependencies fully removed. Still open from the
  2026-07-09 baseline: the 3 stale zip archives and the base44/ directory — not re-verified
  individually this pass beyond confirming base44/ still exists and base44 npm packages are
  still direct dependencies (see Dependency health above).

Testing: Improving, unevenly. 1,217/1,217 tests pass (node --test tests/*.test.mjs) across 381
  suites, up from 1,143 at baseline — a real increase, not just the same count staying green.
  Coverage tooling now exists (npm run test:coverage via c8, absent at the 2026-07-09 baseline
  which had to proxy coverage via line-count): 87.89% statements, 76.27% branches, 72.90%
  functions, 87.89% lines. Coverage is concentrated, not even — shopifyOrderService.ts (48.57%
  branch), shopifyCustomerService.ts (55.55%), quotePipelineService.ts (53.12% branch),
  shopifyInventoryService.ts (65.3%) are the weakest files found. liveShopifyStorefrontCartAdapter.ts
  is missing tests for two real response-shape branches (top-level GraphQL errors[], malformed
  cart payload). The PR-24 configurator-wide SKU-resolves-against-variant-index regression sweep
  (flagged in MASTER_EXECUTION_PROGRAM.md as "highest test ROI in the plan") still does not
  exist. No flaky, skipped, or disabled tests found (repo-wide grep for .skip/.todo/xit/only
  returned zero matches).

CI: Flat, and now confirmed actually gating rather than just present. .github/workflows/ci.yml
  runs lint/typecheck/test/build as four separate required jobs on every PR and push to main;
  re-ran all four directly this session against the current tree (not assumed from the file
  existing). vite.config.js's logLevel:'error' bundle-size-warning suppression (filed as #292)
  not re-checked this pass.

Issue metadata hygiene: Not assessed this pass — this session has no GitHub issue read/write
  access (repo-only session), so the live issue-tracker state (open count, #286's retrofit
  progress) could not be verified. Flagging as a genuine gap, not silently skipped — see Gaps.

Gaps: (1) Issue metadata hygiene not assessed — no GitHub API access this session, only the
  in-repo backlog/docs could be checked. (2) B10 (Shopify store content: 60/115 active products,
  273 missing variant images) not re-verified — requires live Shopify admin access this session
  doesn't have. (3) The stated weekly/monthly cadence was not honored between 2026-07-23 and
  2026-09-13 — no recorded pass exists for that ~7-week window; this pass cannot reconstruct
  what happened during it beyond what git history and the doc-drift findings above imply.

Escalation: None Critical this pass. The two 2026-07-23 Critical/P0 escalations (#297 partially,
  #303/#307 fully) are resolved or downgraded per Security above — recommend formally closing
  #303/#307 and downgrading #297's severity in the tracker (not done from this session; no issue
  write access).

Filed: none new this pass (no GitHub issue access from this session). Findings instead recorded
  directly in MASTER_EXECUTION_PROGRAM.md's Refresh Log (new PR-39/PR-40/PR-41) and this entry —
  flagging for the next session with issue access to open the corresponding GitHub issues.
```

## Related Documents

[`monitoring/REPOSITORY_HEALTH.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/monitoring/REPOSITORY_HEALTH.md) · [`standards/SECURITY_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/standards/SECURITY_STANDARD.md) · sibling [`docs/engineering/backlog/`](./backlog/)
