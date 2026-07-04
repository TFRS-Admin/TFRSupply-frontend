# Fleet Templates & Vehicle Cloning

## Purpose

Fleet Templates & Vehicle Cloning extends the existing Fleet Build Workspace (`docs/architecture/FLEET_VEHICLE_SHOPPING_MODES.md`) so a customer who has fully configured one vehicle build can reuse it — save it as a named template, apply that template to another build, or clone a build/template into a brand-new build for a different destination vehicle, quantity, and name. This is composition and net-new client-side state on top of the existing Fleet Builds feature, not a new service layer or catalog: every product read still goes through the existing `catalogService`, and every template lives only in `localStorage`. It is customer-facing ecommerce, not CRM, admin, backend, pricing, checkout, or a live Shopify integration.

## Save Fleet Build as Template

`FleetBuildCard` (`src/components/fleetBuilds/FleetBuildCard.jsx`) gained a "Save as Template" action, wired in `FleetBuildsPanel` to `useFleetTemplates().saveTemplateFromBuild(build)`. A template is a snapshot:

```ts
{ id, name, vehicle: FleetBuildVehicle | null, buildStyle: FleetBuildStyleId | null,
  selections: FleetBuildCategorySelections, completionPercent, sourceBuildId,
  createdAt, updatedAt, usageCount, lastUsedAt }
```

`createTemplateFromBuild` (`src/domain/fleetBuilds/templateRules.ts`) builds this snapshot from a `FleetBuild`, deep-copying `selections` via `cloneCategorySelections` (shared with clone rules — see below) so editing the source build afterward never mutates the saved template. "Completion %" and "selected categories/products" are not stored twice — `completionPercent` is a point-in-time snapshot taken via the existing `calculateFleetBuildCompletion`, while the categories/products themselves are simply the copied `selections`, matching the issue's storage list without duplicating derivable state. The template's name is optional: `defaultTemplateName(vehicle, buildStyle, existingCount)` falls back to `"{Model} {Style}"` (e.g. "Explorer PIU Patrol"), then `"{Model} Template"` or `"{Style} Template"`, then `"Fleet Template N"`, so every save succeeds without a name prompt; renaming afterward reuses the same rename control as fleet builds.

## Vehicle Cloning

`CloneBuildDialog` (`src/components/fleetBuilds/CloneBuildDialog.jsx`) is one shared destination form — Destination Build Name, Quantity, and a Destination Vehicle year/make/model picker sourced from the same `src/data/vehicles/vehicleMaster.ts` used everywhere else in Fleet Builds — reused by three entry points:

| Entry point | Source | Component |
| --- | --- | --- |
| "Clone Build" | An existing fleet build | `FleetBuildCard` → `FleetBuildsPanel` |
| "Clone Current Build" | The active fleet build | `FinishYourUpfitPanel` (Product Detail) |
| "Clone" | A saved template | `FleetTemplateRow` → `FleetTemplatesSection` |

All three call the same `cloneBuild(source, destination, getProductVerticalIds)` on `FleetBuildsContext`, which delegates to `cloneFleetBuildFromSource` (`src/domain/fleetBuilds/cloneRules.ts`). `cloneSourceFromBuild`/`cloneSourceFromTemplate` adapt a `FleetBuild`/`FleetBuildTemplate` into the minimal `FleetBuildCloneableSource` shape the clone function actually reads (`buildStyle`, `selections`, `templateId`) — the clone's name/vehicle/quantity always come from the destination the customer entered, never from the source, so cloning is a real "copy into a new destination," not an overwrite. Selected products, category selections, and build style are copied; completion state carries over for free because `calculateFleetBuildCompletion` is always derived from `buildStyle` + `selections`, so no separate completion field needs copying or recomputation. Cloning appends a new build via the existing `addFleetBuild`/`MAX_FLEET_BUILDS` rules and does **not** switch the active build, since cloning is typically used to spin off copies for other vehicles while staying focused on the build already being edited.

### Compatibility re-evaluation

Every clone and "Apply Template" re-evaluates each copied product's compatibility against the destination vehicle via `reevaluateSelectionsCompatibility`, using the same vertical-match rule as the existing "Add to All Compatible Builds" feature (`resolveCatalogVerticalId` + the product's catalog `verticalIds`, via a `getProductVerticalIds(productId)` resolver the caller supplies from `catalogService.getProduct`). A product whose verticals don't include the destination vehicle's vertical is flagged (`FleetBuildProductSelection.incompatible = true`) — **it is never removed**. `FleetBuildCard` renders a visible, non-hover-dependent "Incompatible with selected vehicle." label directly on the product chip (not just a tooltip, so it reads correctly on mobile where hover doesn't exist) alongside its normal remove control, so the customer can still see and manually remove it if they choose. When there is no destination vehicle, or a product's verticals can't be resolved at all, nothing is flagged — compatibility is only ever asserted when it can be positively confirmed, mirroring the "Add to All Compatible Builds" precedent.

## Apply Template

"Apply Template" replaces a build's `buildStyle` and `selections` with a saved template's, via `applyTemplateToBuild` (`src/domain/fleetBuilds/cloneRules.ts`), called through `FleetBuildsContext.applyTemplate(buildId, template, getProductVerticalIds)`. The target build keeps its own id/name/quantity, and **keeps its own vehicle if it already has one** — the template's vehicle is only adopted when the build has none yet — so applying a template never silently reassigns a vehicle the customer already chose. Compatibility is re-evaluated against whichever vehicle results. The build's `templateId` is set to the applied template's id, which is how "Current Template" (Product Detail) and "vehicles using template" (Workspace) are resolved — `getTemplateById`/`countBuildsUsingTemplate` (`src/domain/fleetBuilds/templateRules.ts`). Every "Apply Template" and template-sourced "Clone" (but not a plain build-to-build "Clone Build") calls `touchUsage(templateId)`, incrementing `usageCount`/`lastUsedAt` — this is "Template usage," scoped to direct template use rather than indirect build lineage.

## Fleet Build Workspace: Fleet Templates Section

`FleetTemplatesSection` (`src/components/fleetBuilds/FleetTemplatesSection.jsx`), rendered inside `FleetBuildsPanel` below the existing build list, lists every saved template as a `FleetTemplateRow` (`src/components/fleetBuilds/FleetTemplateRow.jsx` — pure, fixture-testable, mirroring `FleetBuildCard`'s convention) with Clone, Apply Template, an inline rename control (same pattern as a fleet build's name field), and Delete. "Apply Template" targets the active build, creating one first via `addBuild()` if none exists yet, so the action is never a dead end even before a customer has started a build.

## Product Detail: Finish Your Upfit

`FinishYourUpfitPanel` (`src/components/fleetBuilds/FinishYourUpfitPanel.jsx`) gained a template block under its existing actions row: "Current Template" (the active build's applied template name, or "No template applied to this build yet."), an "Apply Template" picker (a `<select>` of saved templates, hidden entirely when none exist yet) and "Clone Current Build" (opens `CloneBuildDialog` sourced from the active build). `FinishYourUpfitPanelView`'s existing pure/connected split is preserved — `templates`/`appliedTemplate` are additive, defaulted props so every existing fixture-driven test of the view keeps passing unchanged.

## Workspace (`/workspace`)

`FleetTemplatesWorkspaceSection` (`src/components/fleetBuilds/FleetTemplatesWorkspaceSection.jsx`) is a pure, props-driven section rendered on `/workspace` directly after `FleetBuildsWorkspaceSection`, matching its convention of resolving context state in the connected `WorkspaceDashboard` wrapper. It shows the saved template count, an average-completion summary across all templates, and up to 5 "recent templates" (sorted by `lastUsedAt`, falling back to `createdAt`) — each with its vehicle/style, completion %, and "N vehicles using this template" (`countBuildsUsingTemplate`).

## State / Storage

Client-side only. `FleetTemplatesProvider` (`src/context/FleetTemplatesContext.jsx`) persists the templates array to `localStorage` under `tfr_fleet_templates`, mirroring `FleetBuildsContext`'s defensive-parse-on-load pattern (invalid/missing storage silently falls back to an empty list) — no dedicated Zod schema, consistent with `FleetBuildsContext` and its siblings. `FleetTemplatesProvider` is mounted in `App.jsx` alongside `FleetBuildsProvider`. `MAX_FLEET_TEMPLATES = 50` keeps the saved-templates list bounded, mirroring `MAX_FLEET_BUILDS`. Every create/rename/delete/usage-tracking decision delegates to pure functions in `src/domain/fleetBuilds/templateRules.ts` and `cloneRules.ts`; the context only owns React state wiring, id/timestamp generation, and persistence.

## Non-goals

No Shopify API calls, checkout, pricing, CRM, admin features, or authentication are introduced. No existing Fleet Builds behavior (add/remove/rename/vehicle/quantity/style editing, Add to All Compatible Builds) is changed — every addition here is new, additive UI and state layered on top of it.

## Known Limitations

- Compatibility re-evaluation only runs at clone-time and apply-template-time, per the issue's explicit scope — it is not retroactively applied when a customer manually changes an existing build's vehicle via `FleetBuildCard`'s own vehicle picker (that path is unchanged, pre-existing behavior).
- Deleting a template does not clean up the `templateId` a build may still carry from it; "Current Template" and "vehicles using template" simply stop resolving a name for that id (`getTemplateById` returns `null`), which reads as "no template" rather than an error.
- As with every other `localStorage`-backed customer surface (see `docs/migrations/TESTING_NOTES.md`), the repository's `node --test` + Vite-SSR stack has no DOM/browser `localStorage` layer, so persistence across page loads and real click interactions (save/rename/delete/apply/clone) are not exercised by an automated test — only the underlying domain, resolution, and rendering layers are. This was manually verified in a running dev server at desktop and mobile viewports (see PR description).

## Testing

`tests/fleet-templates-vehicle-cloning.test.mjs` covers: template naming defaults (vehicle+style, vehicle-only, style-only, neither), template CRUD (`createTemplateFromBuild` snapshotting including non-mutation of the source build, `addTemplate`'s `MAX_FLEET_TEMPLATES` cap, `removeTemplate`, `renameTemplate`'s trim/reject/timestamp behavior, `touchTemplateUsage`, `getTemplateById`, `countBuildsUsingTemplate`), compatibility re-evaluation (`reevaluateSelectionsCompatibility`'s flagged/not-flagged/no-destination-vehicle/unknown-verticals cases, `cloneCategorySelections`'s independent-copy guarantee), the clone source adapters, `cloneFleetBuildFromSource` (destination fields win, incompatible flagging without removal, template lineage, an empty destination vehicle), `applyTemplateToBuild` (build's own vehicle wins over the template's, template vehicle adopted when the build has none), `CloneBuildDialog` (destination prefills, mobile-safe grid, `summarizeCompatibilityResult`'s three message shapes), `FleetTemplateRow` (fixture-driven name/vehicle/style/usage-count/completion rendering and its three actions), `FleetTemplatesSection`'s and `FleetTemplatesWorkspaceSection`'s empty/populated states, `FinishYourUpfitPanel`'s template block (current template, picker shown/hidden, clone action), `FleetBuildCard`'s new actions and its incompatible-chip flag (rendered without removing the product), and composition wiring (`App.jsx`, `FleetBuildsPanel`, `WorkspaceDashboard`, `FinishYourUpfitPanel`). Four existing SSR test files (`product-detail-experience`, `product-detail-migration`, `product-detail-conversion-polish`, `project-workspace`) and `fleet-vehicle-shopping-modes.test.mjs` itself gained `FleetTemplatesProvider` in their local provider stacks so their existing `ProductDetailTemplateView`/`WorkspaceDashboard`/`FleetBuildsPanel`/`VehicleSelectorModal` renders keep working — no assertions in those files changed.
