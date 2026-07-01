# Project Bootstrap

## Purpose

This guide defines how every future TFRSupply repository starts from an empty repository to first release while remaining compatible with AI-managed delivery.

## Phase 1: Repository Creation

1. Create the repository with a clear product or platform name.
2. Initialize Git with a protected default branch named `main`.
3. Add `.gitignore`, README, package or runtime manifest, and license requirements.
4. Add governance documents: `AGENTS.md`, repository standards, architecture directory, and project-management operating system.
5. Configure branch protection before accepting feature work.

## Phase 2: Platform Foundation

1. Establish dependency direction and bounded contexts.
2. Add TypeScript or equivalent type foundation before runtime migrations.
3. Create service, data, validation, and adapter folders before UI integration.
4. Add lint, typecheck, build, and test commands.
5. Add CI workflows that run required checks on every PR.

## Phase 3: Domain Modeling

1. Define shared primitives and domain contracts.
2. Add runtime schemas or validators aligned with the domain contracts.
3. Add loaders or adapters that validate external data at the boundary.
4. Document the source-of-truth rule for every domain.
5. Create data-quality checks before user-facing features depend on the data.

## Phase 4: Issue System Setup

1. Create labels from `03_labels.md`.
2. Add issue templates from `02_issue_templates.md`.
3. Create initial epics from `01_epics.md` and map dependencies from `08_dependency_map.md`.
4. Add milestones for foundation, first vertical slice, release candidate, and first production release.
5. Mark only fully specified issues as `ready-for-codex`.

## Phase 5: First Vertical Slice

1. Choose a low-risk read-only surface.
2. Implement the path through hooks, services, loaders, validators, schemas, and data.
3. Preserve behavior unless the issue explicitly authorizes a change.
4. Add focused tests and migration documentation.
5. Validate lint, typecheck, build, and smoke behavior.

## Phase 6: Review and Release Preparation

1. Open a PR linked to the issue.
2. Include summary, tests, risk, rollback, screenshots when visual, and release impact.
3. Obtain required persona reviews.
4. Resolve all blocking comments.
5. Apply `ready-for-merge` only after checks pass and evidence is complete.

## Phase 7: First Release

1. Create a release issue and release notes.
2. Confirm environment variables, deployment target, and rollback mechanism.
3. Run required checks and smoke tests.
4. Merge through protected branch policy.
5. Deploy to production.
6. Perform post-release validation on core routes and any changed workflows.
7. Close the release issue with evidence, known follow-ups, and incident-free confirmation.

## Required First-Release Evidence

- Commit SHA and PR link.
- Commands run and results.
- Screenshots for UI changes.
- Data validation output when data is involved.
- Deployment target and timestamp.
- Rollback path.
- Follow-up issues for deferred risks.

## AI Agent Startup Checklist

Every AI agent must start by reading governance docs, the relevant architecture docs, the issue template, and affected files. The agent must state its scope, avoid forbidden areas, run required checks, commit changes on the current branch, and open a PR with a production-ready summary.
