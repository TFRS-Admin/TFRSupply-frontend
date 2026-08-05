# AI Development Playbook

> **Not the entry point.** The root [`AGENTS.md`](../../AGENTS.md) is the single entry point for every AI agent working in this repository, per the adopted [Engineering OS](https://github.com/TFRS-Admin/tfrs-engineering-playbook) (see [`docs/engineering/archive/PLAYBOOK_ADOPTION.md`](../engineering/archive/PLAYBOOK_ADOPTION.md) for the historical adoption record, and `README.md`'s Adoption State section for the current one). This document's philosophy, layer conventions, and naming detail below remain valid Tier-3 repository-specific reference material and do not conflict with the Engineering OS — but where this document describes *workflow* (which playbook to run, when), the Engineering OS's `playbooks/` library and `kernel/DECISION_ROUTER.md` govern instead.

## Purpose

This document captures repository-specific philosophy and layer conventions for AI coding agents working in the TFRSupply frontend repository. Its goal is to keep implementation prompts small (see `PROMPT_TEMPLATE.md`) by giving every agent the same baseline understanding of philosophy, workflow, and architecture before an issue is written. Read this document, `IMPLEMENTATION_WORKFLOW.md`, and `ARCHITECTURE_PRINCIPLES.md` before starting any implementation issue, alongside the root `AGENTS.md`.

## Repository Philosophy

- TFRSupply is built for AI-managed delivery. Every issue, branch, PR, and doc is written so an agent with no prior conversation history can pick it up and finish it correctly.
- Architecture changes are additive and reversible until an issue explicitly authorizes a runtime behavior change. See `docs/project-management/05_definition_of_done.md`.
- Documentation is not optional overhead; it is what lets future prompts stay short. Every new boundary (service, adapter, schema, domain module) must be documented in the same PR that introduces it.
- Police, Fire/EMS, and Work Truck verticals share one platform. Domain contracts and services must stay vertical-neutral (see `docs/architecture/DOMAIN_MODEL.md`).

## AI-First Workflow

1. Start from the latest protected `main`.
2. Read the governing issue, this playbook, and any architecture doc named in the issue's affected boundaries.
3. Implement inside the issue's declared scope only. Do not touch forbidden areas listed in the issue.
4. Run the required QA commands (see below) before opening a PR.
5. Open a PR linked to the issue with summary, tests, risk, and rollback notes.
6. Stop after opening the PR unless the issue or user explicitly asks for follow-up.

Full lifecycle detail lives in `IMPLEMENTATION_WORKFLOW.md`.

## One Issue → One Branch → One PR

- Every branch maps to exactly one issue. Do not bundle unrelated issues into one branch or PR.
- Every PR maps to exactly one branch and links to exactly one governing issue (release branches are the only documented exception; see `docs/project-management/09_branch_strategy.md`).
- If work grows beyond the issue's stated scope, stop and open a follow-up issue rather than expanding the current PR.

## One Chat per Implementation

- Start a new AI chat/session for each issue. Do not carry unrelated context from a previous issue's chat into a new implementation.
- A chat's context should match the branch's context: one issue, one scope, one set of forbidden areas.
- When an issue is done and its PR is open, the chat's job is finished. Follow-up review comments on that PR may continue in the same chat; a new issue must not.

## Branch Naming Conventions

Use lowercase branches with an issue identifier and short title, defined in `docs/project-management/09_branch_strategy.md`:

- `docs/<issue-id>-<short-title>`
- `feature/<issue-id>-<short-title>`
- `migration/<issue-id>-<short-title>`
- `bugfix/<issue-id>-<short-title>`
- `refactor/<issue-id>-<short-title>`
- `infra/<issue-id>-<short-title>`
- `hotfix/<issue-id>-<short-title>`
- `release/<version-or-date>`

Branches describe the work, never the agent that produced it.

## Pull Request Expectations

Every PR must include:

- A link to the governing issue.
- A summary of changed files and business/architectural impact.
- The exact QA commands run and their results.
- Screenshots for any perceptible UI change.
- Risk assessment and rollback notes.
- Confirmation that forbidden areas from the issue were not touched.

See `docs/project-management/04_workflows.md` for the full PR workflow and `docs/project-management/02_issue_templates.md` for the acceptance criteria expected per issue type.

## Definition of Done

An issue or PR is only done when it satisfies `docs/project-management/05_definition_of_done.md` in full. In summary:

- Scope matches the approved issue; forbidden areas are untouched.
- Dependency direction (components → hooks → services → loaders → validators → schemas/types → JSON) is respected.
- Required checks (lint, build, typecheck, test) pass or documented environment limitations are recorded.
- Architecture and migration docs are updated when boundaries change.
- The PR description includes summary, tests, risk, and rollback notes.

## QA Requirements

Run these commands before opening a PR, and report exact output in the PR description:

```bash
npm run lint
npm run build
npm run typecheck
npm run test
```

- `npm run test` runs `node --test tests/*.test.mjs` using Vite SSR module loading (see `docs/migrations/TESTING_NOTES.md`).
- Documentation-only PRs still run all four commands to confirm no runtime code was accidentally touched.
- Any command that cannot run in the current environment must be reported as a named limitation, not silently skipped.

## Architectural Principles

Full detail lives in `ARCHITECTURE_PRINCIPLES.md`. The short version:

- React components call hooks; hooks call services; services call adapters, loaders, and validators; loaders and validators sit on top of Zod schemas and `src/types` contracts.
- Nothing below the service layer may import React, hooks, or components.
- No React component imports JSON or typed loaders directly once a surface has migrated.

## TypeScript Migration Rules

From `docs/typescript/TYPESCRIPT_FOUNDATION.md`:

1. Do not rename or convert a `.js`/`.jsx` file unless the issue specifically requests migration of that file or module.
2. Keep runtime behavior unchanged when adding types.
3. Prefer typing pure domain, service, and adapter modules before React components.
4. Add shared types near the domain they describe (`src/types/<domain>.ts`) before creating global type barrels.
5. Keep `strict` disabled until a dedicated strictness issue approves enabling it.

## Zod Validation Requirements

From `docs/architecture/VALIDATION.md`:

- `src/types` interfaces are the source of truth; `src/schemas/*.schema.ts` files validate against them and are annotated as `z.ZodType<InterfaceName>`.
- When a domain interface changes, update its paired schema in the same PR.
- Schemas import TypeScript contracts with `import type` only, stay declarative, and must not contain React, service, or API logic.
- Prefer composing existing schemas over duplicating shape definitions.

## Service Layer Conventions

From `docs/architecture/SERVICE_LAYER.md`:

- Services own one bounded use-case area (`catalog`, `configurator`, `commerce`, `pricing`, `quote`, `quotePdf`, `vehicle`, `packageBuilder`) under `src/services/<domain>`.
- Services may call typed loaders, validators, schemas, pure helpers, and adapters. Services must never import React or hooks.
- Service methods return typed domain objects or explicit result types and must surface errors intentionally rather than swallowing invalid data.
- New services are added service-by-service behind their own issue; do not wire a new service into a live runtime path unless the issue explicitly authorizes it.

## Hook Conventions

- Hooks live under `src/hooks/<domain>` (for example `src/hooks/useCatalog.ts`, `src/hooks/pricing/usePricing.ts`) and are the only layer allowed to call services from React.
- Hooks own loading/error/data state for a single service call and must guard against state updates after unmount (see the `active` flag pattern in `useCatalogResource`/`usePricingResource`).
- Hooks must not contain business logic, pricing decisions, or data validation; they format service results into render-ready state only.
- Hooks return a consistent shape (`{ data, loading, error }` or the domain's equivalent resolution wrapper) so components can be written generically against it.
- Hooks must not import JSON, loaders, or adapters directly; they call services only.

## Domain Layer Conventions

- Pure business logic lives under `src/domain/<domain>` (for example `src/domain/pricing/pricingEngine.ts`, `src/domain/dealerContractResolution`).
- Domain modules contain deterministic, side-effect-free functions: no React, no service imports, no adapters, no network or storage calls.
- Domain modules are the layer services delegate calculation and rule evaluation to; services own orchestration and error surfacing, domain modules own the pure decision logic.
- Every domain rule (pricing calculation, contract window evaluation, fitment compatibility) must be covered by fixture-based tests before it is wired into a service.

## Adapter Pattern

- Adapters live under `src/adapters/<domain>` and define the typed boundary between a service and an external system or future data source (Shopify, quote submission, pricing providers, vehicle fitment providers).
- Every adapter contract ships with a default "unavailable" implementation (see `unavailablePricingAdapter` in `docs/architecture/PRICING_DOMAIN.md`) that returns pending/null results, preserving current runtime behavior until a real provider is connected in a dedicated issue.
- Services depend on adapter interfaces, never on a concrete provider SDK directly; swapping an adapter implementation must not require service or hook changes.
- Adapters must not contain UI formatting, JSX, routing, or business decisions — only request/response translation and typed I/O.

## Testing Expectations

- Add or update tests in `tests/*.test.mjs` for every service, hook, domain, or adapter contract you touch, following the existing Vite SSR `node --test` pattern documented in `docs/migrations/TESTING_NOTES.md`.
- Cover success, not-found/null, validation-failure, and dependency-failure paths for services (see `docs/project-management/06_acceptance_criteria_library.md`).
- Pricing, commerce, configurator, and quote changes require deterministic fixture-based tests, not live data.
- Visual/UI changes require screenshot evidence in the PR in addition to automated tests.
- Record any known test gaps explicitly rather than leaving them implicit.

## Documentation Requirements

- Update the relevant architecture doc under `docs/architecture/` in the same PR whenever a boundary changes.
- Add migration notes under `docs/migrations/` when a runtime surface moves from legacy to platform architecture.
- Keep documentation free of placeholders; use exact file paths, commands, branch names, and owners (see `docs/project-management/06_acceptance_criteria_library.md`, Documentation section).
- Cross-link related docs instead of duplicating their content.
- Update `docs/ai/REPOSITORY_INDEX.md` when a new top-level doc is added so agents can keep discovering it.
