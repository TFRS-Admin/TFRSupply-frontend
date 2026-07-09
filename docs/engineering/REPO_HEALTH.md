<!-- Purpose: Seed and maintain docs/engineering/REPO_HEALTH.md — the running Repository Health Report history per REPO_HEALTH_STANDARD.md. -->
# Repository Health: TFRSupply Frontend

## Recorded Cadence

- **Weekly:** issue metadata hygiene triage, automated security scan review (`npm audit`).
- **Monthly:** documentation drift, dependency health, testing, CI.
- **Quarterly:** architecture drift, technical debt trend, full manual security audit.
- Status as of this writing: **first pass run below**, as part of the playbook v3.0.0 adoption-completion sprint — not merely scheduled, actually executed. Next monthly pass due 2026-08-09; next quarterly pass (architecture drift, technical debt trend, full manual security audit) due 2026-10-09.

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

## Related Documents

[`commands/repo-health.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/repo-health.md) · [`REPO_HEALTH_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REPO_HEALTH_STANDARD.md) · [`SECURITY_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SECURITY_STANDARD.md) · sibling [`docs/engineering/BACKLOG.md`](./BACKLOG.md)
