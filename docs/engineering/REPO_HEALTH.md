<!-- Purpose: Seed and maintain docs/engineering/REPO_HEALTH.md — the running Repository Health Report history per REPO_HEALTH_STANDARD.md. -->
# Repository Health: TFRSupply Frontend

## Recorded Cadence

- **Weekly:** issue metadata hygiene triage, automated security scan review (`npm audit`).
- **Monthly:** documentation drift, dependency health, testing, CI.
- **Quarterly:** architecture drift, technical debt trend, full manual security audit.
- Status as of this writing: first full pass 2026-07-09; first weekly pass (issue metadata hygiene + security) run 2026-07-23, see below. Next weekly pass due 2026-07-30. Next monthly pass due 2026-08-09; next quarterly pass (architecture drift, technical debt trend, full manual security audit) due 2026-10-09.

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

## Related Documents

[`monitoring/REPOSITORY_HEALTH.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/monitoring/REPOSITORY_HEALTH.md) · [`standards/SECURITY_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/standards/SECURITY_STANDARD.md) · sibling [`docs/engineering/backlog/`](./backlog/)
