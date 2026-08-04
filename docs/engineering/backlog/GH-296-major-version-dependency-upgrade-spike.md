<!-- Purpose: Work item, per tfrs-engineering-playbook's standards/WORK_ITEM_STANDARD.md. Migrated from GitHub issue #296 during Engineering OS re-sync (migration/RESYNC_CHECKLIST.md) — the issue itself remains the discussion/comment history; this file is now the authoritative status record. -->
# Chore: evaluate major-version dependency upgrade path (React 19, react-router-dom 7, Tailwind 4, Stripe SDKs)

## Metadata

```yaml
id: GH-296
status: Planned
priority: P3
owner: agent
dependencies: []
```

## Context

Several direct dependencies are one or more major versions behind: `react`/`react-dom` (18.3.1 → 19.2.7), `react-router-dom` (6.30.3 → 7.18.1), `tailwindcss` (3.4.19 → 4.3.2), `@stripe/react-stripe-js` (3.10.0 → 6.7.0), `@stripe/stripe-js` (5.10.0 → 9.9.0), `date-fns` (3.6.0 → 4.4.0), `recharts` (2.15.4 → 3.9.2), `zod` (3.25.76 → 4.4.3), `vite` (6.4.1, behind even within the v6 line), plus `react-day-picker`, `lucide-react`, `framer-motion`, `react-resizable-panels`, `@hello-pangea/dnd` each one major behind. `npm outdated` finding, 2026-07-09.

**Additional finding from the same-day re-review:** `moment@2.30.1` is a direct dependency alongside `date-fns` — two competing date libraries doing the same job. `moment` has been in maintenance mode for years with upstream guidance to migrate away from it. Carrying both is redundant weight and a maintainability smell independent of the major-version-drift issue above. Part of Epic [#283 Dependency & Security Hardening](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/283).

## Outcome

No active exploit is known today, but each major-version gap widens every cycle it stays open, and React 18→19 / Tailwind 3→4 in particular carry non-trivial breaking-change surface for a codebase this size (Radix UI + shadcn/ui component set, custom Tailwind config) — better to scope the upgrade path deliberately than let it compound.

## Scope

**Size: L — this is a research spike, not an implementation.** Identify breaking changes per major bump, sequence them (e.g. Tailwind 3→4 before or after React 19 based on actual coupling, not assumption), and produce a follow-up plan with one issue per major upgrade so each can be isolated and tested independently — do not attempt a single big-bang upgrade PR. Include a specific recommendation on the `moment`/`date-fns` consolidation (likely consolidating to `date-fns`, since it's already present and tree-shakeable) as part of the plan's output.

## Non-Goals

Not the upgrades themselves — those become separate follow-up issues once this spike's plan exists.

## Acceptance Criteria

```text
Given the current major-version-behind dependency set
When the research spike completes
Then a written upgrade sequencing plan exists, with one follow-up issue filed per major-version bump, and an explicit moment-vs-date-fns consolidation recommendation
```

## Verification

The spike's output is the plan itself; each follow-up issue gets its own verification via `npm run test`/`build`/`typecheck` when implemented.

## Risks

**Risk: Medium and growing.** The eventual upgrade gets more expensive the longer it's deferred, and some peer-dependency ranges may eventually force the issue at an inconvenient time.

## Handoff Notes

Original discussion: [GitHub issue #296](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/296).
