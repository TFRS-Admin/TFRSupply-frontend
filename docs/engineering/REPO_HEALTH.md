<!-- Purpose: Seed and maintain docs/engineering/REPO_HEALTH.md — the running Repository Health Report history per REPO_HEALTH_STANDARD.md. -->
# Repository Health: TFRSupply Frontend

## Recorded Cadence

- **Weekly:** issue metadata hygiene triage, automated security scan review (`npm audit`).
- **Monthly:** documentation drift, dependency health, testing, CI.
- **Quarterly:** architecture drift, technical debt trend, full manual security audit.
- Status as of this writing: **two passes run below** (2026-07-09 first pass at playbook v3.0.0 adoption; 2026-07-09 independent from-scratch re-review). Next monthly pass due 2026-08-09; next quarterly pass (architecture drift, technical debt trend, full manual security audit) due 2026-10-09.

## Report History

### 2026-07-09 — Independent Re-Review (Full, All Ten Dimensions)

Run from scratch per an explicit "do not assume previous reviews are current" directive — every finding below was independently re-verified with fresh evidence (commands re-run, files re-read, grep re-checked), not carried forward from the first pass. Codebase (`src/`) was unchanged since the first pass (only documentation changed via merged PR #302), so most findings below confirm the first pass; three are new or materially sharper.

```text
Architecture: Degrading, unchanged from first pass. Re-confirmed 14 component files import
  services/adapters directly (docs/architecture/SERVICE_LAYER.md violation) and the two
  parallel configurator SKU-matching engines (src/domain/configuration/configuratorEngine.js
  vs. inline logic in ConfiguratorModule.tsx) both still exist. New sub-finding: none of the
  spot-checked docs/architecture/*.md files (CONFIGURATOR_EXPERIENCE.md, FLEET_*.md,
  CATALOG_SERVICE.md) acknowledge the components-import-services pattern as an accepted
  exception -- the documented boundary and actual code have silently diverged. src/types/
  re-confirmed clean (zero react/service/adapter/hook imports across 49 files). Already
  tracked: #281, #288, #289, #290.

Security: Degrading further -- ESCALATED. Original framing (issue #297, filed as P2/Risk:High,
  "client-side and self-documented as non-authoritative") understated severity. Re-verification
  found admin auth is unconditionally wired to a mock adapter
  (adminAuthenticationService.ts:51) whose signIn() (mockAdminAuthAdapter.ts:21-33) grants a
  session to ANY caller supplying one of four hardcoded demo user IDs
  (mockAdminAuthUsers.ts:8-50, shipped in the client bundle) -- no password/token/backend
  check exists anywhere, and there is no env-based swap to a real adapter. /admin/* (quotes,
  pricing-imports, shopify-sync, quote-builder) is effectively unauthenticated in the deployed
  build today. Escalated #297 to P0/Risk:Critical. npm audit unchanged: 16 vulnerabilities (1
  low, 9 moderate, 6 high), same lodash direct-dependency finding as first pass. No hardcoded
  secrets found; single dangerouslySetInnerHTML use remains low-risk (internal chart config).

Performance: Flat, unchanged from first pass. Bundle re-measured at exactly 1,945,244 bytes
  (identical to first pass -- confirms no drift). Still zero React.lazy usage, still no
  manualChunks config, still logLevel: 'error' suppressing the build-size warning. Already
  tracked: #282, #291, #292.

Maintainability: Flat. ConfiguratorModule.tsx remains the largest file (1023 lines); no other
  file approaches that size (next largest: ui/sidebar.jsx at 626, FinishYourUpfitPanel.jsx at
  611). Zero TODO/FIXME/HACK/XXX markers confirmed again across all of src/.

Dependency health: Degrading further. Re-confirmed the major-version-behind set from first
  pass (React 18->19, react-router-dom 6->7, Tailwind 3->4, Stripe SDKs, zod 3->4, vite behind
  even within v6, others). NEW: moment@2.30.1 is a direct dependency alongside date-fns -- two
  competing date libraries; moment has been in maintenance mode for years. Added to #296's
  scope.

Testing: Flat. node --test tests/*.test.mjs re-confirmed 1143/1143 pass (duration ~68s this
  run vs ~50-70s prior runs -- no meaningful change). Confirmed real domain-logic unit
  coverage exists beyond smoke tests (pricing, configurator-experience, quote-builder feature
  files) -- first pass's "thin coverage" framing was directionally right but this pass found
  more direct coverage than initially characterized. Coverage tool still absent (no
  c8/nyc/test:coverage). Already tracked: #284, #298, #299.

Technical debt: Degrading further -- NEW functional-severity finding. First pass characterized
  src/adapters/base44/{adminQuoteAdapter,quoteRequestAdapter}.ts as merely "stale naming."
  Re-verification read the files directly: both are explicitly stubbed ("Base44 removed...
  stubbed to log to the console and return empty results," per their own header comments) and
  are still actively consumed by adminQuoteService.js:7 and quoteRequestService.js:12. This
  means the admin quote queue always shows empty results and quote-request submissions are
  silently dropped -- a live functional defect, not cleanup-flavored debt. Filed as new P0 bug
  #303. Three stale root-level zip archives confirmed still present, unchanged sizes. Already
  tracked: #285, #300, #301.

Documentation: Degrading further -- NEW finding. Spot-checked docs/architecture/*.md files
  remain accurate against code (CONFIGURATOR_EXPERIENCE.md, FLEET_TEMPLATES_AND_CLONING.md,
  FLEET_VEHICLE_SHOPPING_MODES.md all correctly describe real files at their stated paths).
  docs/engineering/*.md confirmed current, not placeholders. NEW: README.md's "Prerequisites"
  section still instructs new developers to set VITE_BASE44_APP_ID/VITE_BASE44_APP_BASE_URL,
  but .env.example only defines VITE_SHOPIFY_STORE_DOMAIN/VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN/
  VITE_SHOPIFY_STOREFRONT_API_VERSION -- a new engineer following the README literally would
  configure the wrong environment entirely. Filed as new issue #304.

CI: Degrading further -- NEW findings. Re-confirmed .github/workflows/ci.yml's four jobs
  (lint/typecheck/test/build) match package.json's real scripts and all pass. NEW: no
  security-scan job exists despite 16 known npm audit findings; no bundle-size budget check
  exists despite the 1.9MB single-chunk bundle. Filed as new issues #305 (audit gate) and #306
  (bundle-size budget, blocked by #291).

Issue metadata hygiene: Flat. All 22 issues from the first pass (#279-#301) confirmed still
  open via live GitHub query, none progressed since filing (no comments, no status changes) --
  expected, given no time has passed for implementation work. #279 was auto-closed by GitHub
  when PR #302 merged (that PR's body said "Closes #279," but only the documentation portion
  was actually done) -- reopened this pass with an explanatory comment. Four new issues filed
  (#303-#306) and one escalated (#297); 113 pre-existing issues still lack ## Metadata,
  tracked via #286.

Gaps: None this cycle -- all ten dimensions (the original eight plus Performance and Developer
  Experience, explicitly requested this pass) assessed with direct re-verified evidence.

Escalation: #297 (admin authentication) escalated immediately to P0/Risk:Critical -- live
  unauthenticated admin access in the deployed build. #303 (silently-dropped quote
  submissions) filed as P0 alongside it -- both are live production issues, not backlog
  hygiene, and are called out as the top-priority next work in docs/engineering/BACKLOG.md
  and CURRENT_SPRINT.md ahead of the general priority ordering.

Filed/updated this pass: #279 reopened + comment, #297 escalated, #296 updated,
  #303/#304/#305/#306 created. See docs/engineering/BACKLOG.md for the full 27-issue list.
```

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

## Related Documents

[`commands/repo-health.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/repo-health.md) · [`REPO_HEALTH_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REPO_HEALTH_STANDARD.md) · [`SECURITY_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SECURITY_STANDARD.md) · sibling [`docs/engineering/BACKLOG.md`](./BACKLOG.md)
