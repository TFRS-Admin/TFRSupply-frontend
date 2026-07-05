# Fleet Projects

## Purpose

A **Fleet Project** is the top-level planning object that groups multiple Fleet Builds and Fleet Templates into a single customer program — "2026 Patrol Vehicle Replacement," "Sheriff Fleet Expansion," "DOT Amber Fleet," "Fire Command SUV Program." Everything the customer already does in Fleet Builds/Fleet Templates now happens *inside* whichever project is active; switching projects swaps which builds/templates are visible without ever deleting the ones left behind.

This is **not** the same thing as the "Project Workspace" (`/workspace`, `docs/architecture/PROJECT_WORKSPACE.md`) — that name predates this feature and refers to the customer dashboard as a whole. A Fleet Project is one section *within* that dashboard. To avoid the collision, the context/hook here is `FleetProjectContext`/`useFleetProject()`, never a bare `ProjectContext`/`useProject()`.

No backend, authentication, or Shopify calls are introduced. No pricing.

## Reused foundations

Fleet Projects adds one new context and layers thin scoping onto two existing ones — it does not duplicate any fleet logic:

| Piece | What it does |
| --- | --- |
| `FleetProjectContext` (new) | Owns project metadata only: id, name, archived flag, timestamps, which project is active. `localStorage` key `tfr_fleet_projects`. |
| `FleetBuildsContext` (existing, extended) | Every `FleetBuild` now carries a `projectId`. The `builds`/`activeBuild`/`isFull` it exposes are scoped to the active project (read via `useFleetProject()`); the unscoped list is exposed as `allBuilds` for cross-project summaries. `MAX_FLEET_BUILDS` is enforced per project. |
| `FleetTemplatesContext` (existing, extended) | Same scoping pattern for `FleetBuildTemplate.projectId`; unscoped list exposed as `allTemplates`. |
| `src/domain/fleetBuilds` | Untouched. `calculateFleetBuildCompletion`, `cloneCategorySelections`, etc. are still the single source of truth for build/template rules — Fleet Projects only decides *which* builds/templates a given render sees. |
| `src/domain/fleetProjects` (new) | Pure CRUD rules (`createFleetProject`, `renameFleetProject`, `setFleetProjectArchived`, `removeFleetProject`, `resolveNextActiveProjectId`, `duplicateFleetProjectMeta`) and `summarizeFleetProject` (vehicle/build/template counts, average completion, no-pricing product estimate, build-style usage), mirroring `fleetBuildRules.ts`/`templateRules.ts`/`completion.ts`. |
| `DepartmentStandardsContext` (Fleet Intelligence & Department Standards, `FLEET_INTELLIGENCE.md`) | Adds `FleetProject.departmentStandardId`/`FleetBuild.departmentStandardId` (both optional) and one `assignDepartmentStandard` action on each of `FleetProjectContext`/`FleetBuildsContext`, so a project (and, overriding it, an individual build) can be measured against a Department Standard. Company standards themselves are **not** project-scoped — see `FLEET_INTELLIGENCE.md`'s Architecture Decisions. |

Because `FleetBuildsContext`/`FleetTemplatesContext` keep their exact public API (`builds`, `activeBuild`, `addBuild`, `applyTemplate`, etc.), every existing consumer — `FleetBuildsPanel`, `FinishYourUpfitPanel`, `FleetBuildCard`, `AddToAllCompatibleBuildsButton`, `CloneBuildDialog` — needed no changes to automatically "operate on the active project."

## Why builds/templates are scoped in place (not a separate per-project store)

The alternative design — each `FleetProject` embedding its own builds/templates array — would mean copying build data in and out of `FleetBuildsContext`'s state on every switch, risking desync between two sources of truth. Instead, `FleetBuildsContext`/`FleetTemplatesContext` remain the single source of truth for *all* builds/templates across every project (`allBuilds`/`allTemplates`), each item tagged with a `projectId`, and the publicly-exposed `builds`/`templates` are simply `.filter(projectId === activeProjectId)`. Switching projects is then just changing which `activeProjectId` that filter uses — nothing is copied, nothing can desync, and nothing is lost.

## No data loss for existing Fleet Builds/Templates customers

Builds/templates created before this feature shipped have no `projectId`. Both contexts' `loadFromStorage()` normalize any build/template missing one onto `DEFAULT_PROJECT_ID` — a **fixed** id (`fleet-project-default`), not a generated one. `FleetProjectContext` bootstraps a project with that same fixed id ("My Fleet Project") the first time it loads with nothing stored, so legacy data always has a home and is visible by default.

## Fleet Project actions

`FleetProjectContext` owns Create/Rename/Archive/Unarchive/Delete/Switch (metadata only). Duplicate and Delete also need to touch the project's builds/templates, which live in different contexts — rather than coupling the three contexts directly, `src/hooks/useFleetProjectActions.js` composes them for exactly those two cross-cutting actions (`duplicateProjectWithContents`, `deleteProjectWithContents`), mirroring how `FinishYourUpfitPanel`/`FleetBuildsPanel` already compose `useFleetBuilds()` + `useFleetTemplates()` for template-apply/clone flows rather than merging those contexts together.

- **Duplicate**: copies the project's metadata (`name (Copy)`, never archived) plus every build/template it owns (new ids, deep-copied selections, usage tracking reset) into the new project. Never switches the active project, mirroring `cloneBuild`'s existing "clone doesn't switch away from what you're editing" behavior.
- **Delete**: removes the project and cascades to its builds/templates. If the active project is deleted, the next non-archived project becomes active (or `null` if none remain — `FleetProjectContext` bootstraps a fresh default project on the next load in that case).
- **Archive**: hides a project from the main list without deleting it; archived projects appear in a collapsed "Show Archived Projects" list on `/workspace` with Restore/Delete only.

`MAX_FLEET_PROJECTS = 20`, mirroring `MAX_FLEET_BUILDS`/`MAX_FLEET_TEMPLATES`'s "small workspace" caps.

## Placement

- **`/workspace`**: `FleetProjectsWorkspaceSection` (top of the page, above the existing Fleet Builds/Templates sections) — one card per project (name, vehicle count, fleet build count, average completion % + progress bar, template count, last modified, Active badge, Open/Duplicate/Rename/Archive/Delete).
- **Fleet Builder** (`FleetBuildsPanel`, the "Fleet Builds" tab of `VehicleSelectorModal`): `ProjectSummaryCard` at the top — vehicles, estimated products (a count, not a price), completed/incomplete builds, template usage, build styles in play, all for the active project.
- **Header** (`SiteHeader.jsx`): `FleetProjectIndicator` — a "Fleet Project ▼ {name}" button next to the vehicle selector, opening a dropdown to switch projects, create a new one, or jump to `/workspace`. Desktop-only (`hidden md:flex`), matching the vehicle-selector/`WorkspaceButton` pattern — the icon row is already at its 390px width limit (see `PROJECT_WORKSPACE.md`'s Mobile Layout section). `MobileNavDrawer` carries an equivalent accordion entry instead.
- **Product Detail** (`FinishYourUpfitPanel`): a "Current Project / Current Fleet Build / Current Template" strip above the existing completion/missing-categories grid.

Switching the active Fleet Project never touches `VehicleContext`'s global selected vehicle (the header's "Select Your Vehicle" button/state) — the two are entirely separate contexts, so a project switch cannot affect the customer's currently-selected shopping vehicle.

## Out of scope

No CRM, authentication, checkout, Shopify calls, database, admin surface, or budget/pricing calculations. `estimatedProductCount` on `ProjectSummaryCard`/`summarizeFleetProject` is a count of selected line items (times quantity), never a dollar figure.

## Known limitation

`FleetProjectSummary.lastModified` is a best-effort signal, not an exact edit log: it's the latest of the project's own `updatedAt` (bumped on rename/archive) and its builds'/templates' own timestamps (`createdAt`/`updatedAt`). Editing an existing build in place — changing its vehicle, quantity, or products — doesn't currently bump any timestamp, so `lastModified` can lag behind that kind of edit. Wiring a `touchProject` call through every build/template mutation was considered and deferred as unnecessary coupling for a prototype-grade "recently worked on" signal; if exact recency becomes a real requirement, add `updatedAt` to `FleetBuild`/`FleetBuildTemplate` in `src/domain/fleetBuilds` rather than reaching into `FleetProjectContext` from every mutation callback.

## Testing

`tests/fleet-projects.test.mjs` covers: the `fleetProjectRules`/`summarizeFleetProject` pure domain functions (create/rename/archive/delete/duplicate, `MAX_FLEET_PROJECTS`, default-project bootstrapping), `FleetProjectCard`/`FleetProjectsWorkspaceSection`/`ProjectSummaryCard` rendering from fixtures, and — via a small in-memory `localStorage` shim seeded before each render (this repo's `node --test` + Vite-SSR stack has no browser `localStorage`, see `docs/migrations/TESTING_NOTES.md`) — `FleetBuildsContext`/`FleetTemplatesContext` scoping real seeded builds/templates to the active project, the pre-Fleet-Projects legacy-data migration onto `DEFAULT_PROJECT_ID`, the `FleetProjectIndicator`/`WorkspaceDashboard` connected integration, and `FinishYourUpfitPanel`'s Current Project/Fleet Build/Template strip. Real mutation callbacks (`createProject`, `addBuild`, etc.) can't be exercised this way — React's SSR `useState` setters are no-ops once `renderToString` has returned — so those are covered at the pure-domain-function level instead, matching every other fleet-feature test file in this repo.

This was additionally verified end-to-end in a running dev server with a headless browser: creating a Fleet Build inside a fresh project persists it tagged with that project's id; the Workspace Projects section, header switcher/dropdown, Fleet Builder's Project Summary card, and Product Detail's Current Project/Fleet Build/Template strip all render live data; and `/workspace` has no horizontal overflow at a 390px mobile viewport, with the mobile nav drawer's Fleet Project accordion entry present.
