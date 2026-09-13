# TFRSupply-frontend — Backup/DR & Repo Governance — Phased Plan

Findings: see `.planning/findings.md`. Style: small, single-purpose PRs; nothing merges to `main` without the maintainer's explicit go-ahead.

## Phase 0 — Process rules (this session, no code)

- [x] Adopt: no PR to `main` auto-merges (not via CI, bot, or scheduled routine) — merges happen only on explicit maintainer go-ahead.
- [ ] Write the agent-lane split into `AGENTS.md` (repo/infra lane vs. feature/app lane) so it survives beyond this conversation — needed because branch list shows concurrent `claude/*`/`codex/*` agent activity already.
- [x] Flag the `agent-skills:*`/`mattpocock-skills:*` skill-availability gap plainly (done in findings.md §0) rather than pretending those skills ran.

## Phase 1 — Docs-only PR (no risk, executable now)

**PR: `docs: reconcile README with current AGENTS.md governance state`**
- Fix `README.md`'s stale claim that the repo "follows the Very Good Software Co. Engineering OS / `tfrs-engineering-playbook`" — align it with `AGENTS.md`'s 2026-09-13 statement that this was replaced by account-level Claude Code skills.
- Add "Verified: 2026-09-13 via GitHub MCP `list_branches`/`list_repository_collaborators`" (or equivalent) annotations to any doc claims about live GitHub/Railway state going forward, per the new process rule — starting with `RAILWAY_DEPLOYMENT.md` and `ARCHITECTURE.md`'s "no first-party backend/database" line (already verified true, just needs the tag).
- Name the actual quote-delivery vendor once the maintainer confirms it (currently generic "Formspree/Basin-shaped" in docs) — deferred to maintainer input, see Phase 3.

## Phase 2 — CI coverage PR (executable now, no branch-protection dependency)

**PR: `ci: add npm audit gate + extend trigger coverage`**
- Implements GH-305 (already `status: Ready` in the backlog): add an `audit` job to `ci.yml` running `npm audit --audit-level=high`, explicitly **advisory-only for now** (not blocking) since 12 known findings already exist — flip to blocking in a follow-up once GH-296/dependency bumps land. This decision gets written into the PR description and into GH-305's own file (mark `status: Done`, note the explicit advisory-vs-blocking choice).
- Add `push:` triggers for any additional long-lived branches beyond `main` that the maintainer confirms are real integration branches (candidate: none currently look like an actively-used second trunk — `develop` looks abandoned; confirm with maintainer before adding or deleting it — see Phase 3 ask).
- This is a good candidate to also carry the lodash upgrade PR's paperwork: GH-293 already reads "Done" — this PR should just double check that status file's claim one more time post-merge and leave it as is (no code change needed there, already verified in findings.md §3).

## Phase 3 — Needs maintainer's dashboard access (cannot execute directly)

These require GitHub org-admin / Railway dashboard access this session's tokens don't grant, or a decision only the maintainer can make. Exact click-paths:

1. **Branch protection on `main`** (GitHub UI): repo → Settings → Branches → Add branch protection rule → Branch name pattern `main` → enable "Require a pull request before merging" (require ≥1 approval), "Require status checks to pass before merging" (select the 4 `ci.yml` jobs, plus the new `audit` job once Phase 2 merges), "Require branches to be up to date before merging", and "Do not allow bypassing the above settings" (or explicitly exempt only `TFRS-Admin` if the maintainer wants an admin override). Recommend also enabling "Restrict who can push to matching branches" limited to PR-merge only (no direct pushes).
2. **CODEOWNERS**: once the maintainer confirms who should own which paths (e.g. `src/adapters/shopify*` vs `src/components/**`), I can draft `.github/CODEOWNERS` in a docs PR — this part I *can* do once given the ownership mapping; only the branch-protection "require review from Code Owners" toggle itself is dashboard-only (Settings → Branches → same rule → check "Require review from Code Owners").
3. **Collaborator review**: confirm `bikr` and `smguerrero66` still need write access, and whether they should keep direct write once branch protection is on (Settings → Collaborators and teams).
4. **Railway**: I have no discovery tool to list this account's Railway projects from this session — the maintainer needs to either (a) tell me the Railway `projectId` so I can inspect it with the Railway MCP tools already available (`describe-environment`, `describe-service`, `domain-status`, `environment-status`), or (b) check directly in the Railway dashboard: Project → Settings → confirm GitHub repo connection + branch, Environments → confirm production env vars match `.env.example`'s list, Networking → confirm custom domain/DNS status and note it in a docs PR, Deployments → confirm rollback actually works by testing a redeploy of a prior build (closes stale issue **#115**).
5. **Secrets rotation/inventory**: Settings → Secrets and variables → Actions (repo secrets) and the Railway project's own Variables tab — maintainer lists names back to me (never values) so I can write the secrets-inventory/runbook doc PR.
6. **Quote-delivery vendor**: confirm which service `VITE_QUOTE_DELIVERY_ENDPOINT` actually points to in Railway today (Formspree, Basin, something else, or unset/falling back to `mailto:`), so the DR runbook can name the real system holding quote-request data outside this repo.
7. **DNS/domain status**: if a custom domain is attached (not just `*.up.railway.app`), maintainer confirms registrar + DNS provider so a "who owns the domain, when does it renew" line can go in the DR runbook.

## Phase 4 — Remaining single-purpose PRs (sequenced after Phase 3 answers)

- `docs: DR/business-continuity runbook` — codifies findings.md §5 (no DB; Shopify + named quote-vendor are the real systems of record) plus the Railway rollback steps once tested per #115.
- `docs: secrets inventory + rotation runbook` — names + purposes only, once Phase 3.5 answers are in.
- `chore: CODEOWNERS` — once Phase 3.2 ownership mapping is confirmed.
- `chore: stale branch cleanup` — once maintainer confirms which of the ~130 branches (particularly `develop` and old `claude/*`/`codex/*` slices) are safe to delete.
- Existing backlog items (GH-293 already done; GH-305 in Phase 2) are otherwise out of this audit's scope — GH-296, GH-288 through GH-291 stay on the normal backlog, not folded into this DR/governance work.

## Explicit process rules going forward (confirm with maintainer if any conflict with their preference)

- No auto-merge to `main`, ever, by any actor (already true today since there's no auto-merge configured, but branch protection in Phase 3 is what actually enforces it once added — right now the only thing stopping an accidental auto-merge is that none is configured, not that one is blocked).
- Any integration/dev branch other agents push directly to gets CI parity with `main` (Phase 2, pending Phase 3's answer on whether `develop` is real).
- Live/external-state doc claims carry "Verified: `<date>` via `<method>`" (Phase 1 onward).
- Concurrent-agent lane split gets written into `AGENTS.md` (Phase 0).
