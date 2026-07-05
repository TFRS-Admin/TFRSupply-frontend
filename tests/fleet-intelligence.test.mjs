import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    departmentStandardsDomain: await server.ssrLoadModule('/src/domain/departmentStandards/index.ts'),
    fleetBuildsDomain: await server.ssrLoadModule('/src/domain/fleetBuilds/index.ts'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicleContext: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    compareContext: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    recentlyViewedContext: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
    savedProductsContext: await server.ssrLoadModule('/src/context/SavedProductsContext.jsx'),
    fleetProjectContext: await server.ssrLoadModule('/src/context/FleetProjectContext.jsx'),
    fleetBuildsContext: await server.ssrLoadModule('/src/context/FleetBuildsContext.jsx'),
    fleetTemplatesContext: await server.ssrLoadModule('/src/context/FleetTemplatesContext.jsx'),
    configuratorContext: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    departmentStandardsContext: await server.ssrLoadModule('/src/context/DepartmentStandardsContext.jsx'),
    workspaceFleetIntelligenceSection: await server.ssrLoadModule('/src/components/workspace/WorkspaceFleetIntelligenceSection.jsx'),
    departmentStandardsSection: await server.ssrLoadModule('/src/components/departmentStandards/DepartmentStandardsSection.jsx'),
    departmentStandardBadge: await server.ssrLoadModule('/src/components/departmentStandards/DepartmentStandardBadge.jsx'),
    assignStandardControl: await server.ssrLoadModule('/src/components/departmentStandards/AssignStandardControl.jsx'),
    productIntelligencePanel: await server.ssrLoadModule('/src/components/product/ProductIntelligencePanel.jsx'),
    finishYourUpfitPanel: await server.ssrLoadModule('/src/components/fleetBuilds/FinishYourUpfitPanel.jsx'),
    fleetBuildCard: await server.ssrLoadModule('/src/components/fleetBuilds/FleetBuildCard.jsx'),
    fleetProjectCard: await server.ssrLoadModule('/src/components/fleetProjects/FleetProjectCard.jsx'),
  };
});

after(async () => {
  await server?.close();
});

// React SSR inserts `<!-- -->` marker comments between adjacent JSX text
// expressions — strip them so naive string assertions aren't broken by them
// (see fleet-vehicle-shopping-modes.test.mjs for the same helper).
function stripHtmlComments(html) {
  return html.replace(/<!--\s*-->/g, '');
}

function renderPure(element) {
  return stripHtmlComments(renderToString(element));
}

// Full provider stack (mirrors src/App.jsx's fleet stack) for components that
// embed context-reading children — AddToAllCompatibleBuildsButton (needs
// FleetBuildsContext) and ProductCard's overlay buttons (needs
// SavedProducts/Compare/FleetBuilds contexts) plus react-router's Link.
function renderWithProviders(element, initialEntries = ['/']) {
  const { MemoryRouter } = modules.router;
  const { VehicleProvider } = modules.vehicleContext;
  const { CompareProvider } = modules.compareContext;
  const { RecentlyViewedProvider } = modules.recentlyViewedContext;
  const { SavedProductsProvider } = modules.savedProductsContext;
  const { FleetProjectProvider } = modules.fleetProjectContext;
  const { FleetBuildsProvider } = modules.fleetBuildsContext;
  const { FleetTemplatesProvider } = modules.fleetTemplatesContext;
  const { DepartmentStandardsProvider } = modules.departmentStandardsContext;
  const { ConfiguratorProvider } = modules.configuratorContext;

  return stripHtmlComments(renderToString(
    React.createElement(MemoryRouter, { initialEntries },
      React.createElement(VehicleProvider, null,
        React.createElement(CompareProvider, null,
          React.createElement(RecentlyViewedProvider, null,
            React.createElement(SavedProductsProvider, null,
              React.createElement(FleetProjectProvider, null,
                React.createElement(FleetBuildsProvider, null,
                  React.createElement(FleetTemplatesProvider, null,
                    React.createElement(DepartmentStandardsProvider, null,
                      React.createElement(ConfiguratorProvider, null, element),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ));
}

function makeBuild(overrides = {}) {
  return {
    id: 'build-1', name: 'Build 1', vehicle: null, quantity: 1, buildStyle: null,
    selections: {}, createdAt: 1000, projectId: 'proj-1', ...overrides,
  };
}

function withSelection(build, categoryId, productId = 'p1', label = 'Product') {
  return {
    ...build,
    selections: { ...build.selections, [categoryId]: [{ productId, label, addedAt: 1000 }] },
  };
}

function makeProject(overrides = {}) {
  return { id: 'proj-1', name: 'Project One', archived: false, createdAt: 1000, updatedAt: 1000, ...overrides };
}

function makeStandard(overrides = {}) {
  return {
    id: 'standard-1',
    key: 'patrol',
    name: 'Custom Patrol',
    description: 'A custom patrol standard.',
    categories: { required: ['siren'], recommended: ['console'], optional: ['scene_lighting'] },
    isCustom: true,
    basedOnId: 'patrol',
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Feature 1: Department Standards — default standards data
// ---------------------------------------------------------------------------
describe('DEFAULT_DEPARTMENT_STANDARDS (Feature 1)', () => {
  it('ships exactly the 12 required department standards', () => {
    const { DEFAULT_DEPARTMENT_STANDARDS } = modules.departmentStandardsDomain;
    const keys = DEFAULT_DEPARTMENT_STANDARDS.map((standard) => standard.key).sort();
    assert.deepEqual(keys, [
      'construction', 'dot_truck', 'ems_supervisor', 'fire_command', 'k9', 'patrol',
      'pursuit', 'slicktop', 'supervisor', 'swat', 'traffic_enforcement', 'utility',
    ].sort());
  });

  it('every default standard uses only valid upfit categories, with no category repeated across its own tiers', () => {
    const { DEFAULT_DEPARTMENT_STANDARDS } = modules.departmentStandardsDomain;
    const { ALL_UPFIT_CATEGORY_IDS } = modules.fleetBuildsDomain;
    DEFAULT_DEPARTMENT_STANDARDS.forEach((standard) => {
      const all = [...standard.categories.required, ...standard.categories.recommended, ...standard.categories.optional];
      all.forEach((categoryId) => assert.ok(ALL_UPFIT_CATEGORY_IDS.includes(categoryId), `${standard.key}: ${categoryId} is not a valid upfit category`));
      assert.equal(new Set(all).size, all.length, `${standard.key} repeats a category across tiers`);
    });
  });

  it('is read-only (isCustom false) with id equal to key', () => {
    const { DEFAULT_DEPARTMENT_STANDARDS } = modules.departmentStandardsDomain;
    DEFAULT_DEPARTMENT_STANDARDS.forEach((standard) => {
      assert.equal(standard.isCustom, false);
      assert.equal(standard.id, standard.key);
      assert.equal(standard.basedOnId, null);
    });
  });

  it('getDefaultStandardById resolves a known key and returns null for an unknown/null id', () => {
    const { getDefaultStandardById } = modules.departmentStandardsDomain;
    assert.equal(getDefaultStandardById('patrol').name, 'Patrol');
    assert.equal(getDefaultStandardById('not-a-standard'), null);
    assert.equal(getDefaultStandardById(null), null);
  });
});

// ---------------------------------------------------------------------------
// Feature 1 & 7: Company Standards CRUD (standardRules.ts)
// ---------------------------------------------------------------------------
describe('Department Standards domain rules — clone/rename/delete/category edits', () => {
  it('clones a default standard into an independent, editable company standard', () => {
    const { cloneDepartmentStandard, getDefaultStandardById } = modules.departmentStandardsDomain;
    const source = getDefaultStandardById('patrol');
    const clone = cloneDepartmentStandard('standard-2', 2000, source, 'County Patrol Package');

    assert.equal(clone.id, 'standard-2');
    assert.equal(clone.key, 'patrol');
    assert.equal(clone.name, 'County Patrol Package');
    assert.equal(clone.isCustom, true);
    assert.equal(clone.basedOnId, 'patrol');
    assert.deepEqual(clone.categories, source.categories);

    // Mutating the clone's arrays must never affect the shipped default (deep-enough copy).
    clone.categories.required.push('accessories');
    assert.ok(!source.categories.required.includes('accessories'));
  });

  it('defaults an unnamed clone to "{source} (Copy)"', () => {
    const { cloneDepartmentStandard, getDefaultStandardById } = modules.departmentStandardsDomain;
    const clone = cloneDepartmentStandard('standard-3', 3000, getDefaultStandardById('k9'));
    assert.equal(clone.name, 'K9 (Copy)');
  });

  it('addDepartmentStandard refuses to add past MAX_DEPARTMENT_STANDARDS', () => {
    const { addDepartmentStandard, MAX_DEPARTMENT_STANDARDS } = modules.departmentStandardsDomain;
    const full = Array.from({ length: MAX_DEPARTMENT_STANDARDS }, (_, i) => makeStandard({ id: `s${i}` }));
    const result = addDepartmentStandard(full, makeStandard({ id: 'overflow' }));
    assert.equal(result, full);
    assert.equal(result.length, MAX_DEPARTMENT_STANDARDS);
  });

  it('renameDepartmentStandard only renames the matching custom standard and trims whitespace', () => {
    const { renameDepartmentStandard } = modules.departmentStandardsDomain;
    const current = [makeStandard({ id: 's1', name: 'Old Name' }), makeStandard({ id: 's2', name: 'Other' })];
    const renamed = renameDepartmentStandard(current, 's1', '  New Name  ', 5000);
    assert.equal(renamed[0].name, 'New Name');
    assert.equal(renamed[0].updatedAt, 5000);
    assert.equal(renamed[1].name, 'Other');
  });

  it('renameDepartmentStandard is a no-op for a shipped default entry (isCustom false) and for a blank name', () => {
    const { renameDepartmentStandard } = modules.departmentStandardsDomain;
    const current = [makeStandard({ id: 's1', isCustom: false, name: 'Default' })];
    assert.equal(renameDepartmentStandard(current, 's1', 'New Name', 5000)[0].name, 'Default');
    const customCurrent = [makeStandard({ id: 's1', name: 'Kept' })];
    assert.equal(renameDepartmentStandard(customCurrent, 's1', '   ', 5000)[0].name, 'Kept');
  });

  it('addCategoryToTier dedupes and removeCategoryFromTier removes, only for custom standards', () => {
    const { addCategoryToTier, removeCategoryFromTier } = modules.departmentStandardsDomain;
    const current = [makeStandard({ id: 's1', categories: { required: ['siren'], recommended: [], optional: [] } })];

    const added = addCategoryToTier(current, 's1', 'required', 'console', 6000);
    assert.deepEqual(added[0].categories.required, ['siren', 'console']);
    assert.equal(added[0].updatedAt, 6000);

    const dedupedAgain = addCategoryToTier(added, 's1', 'required', 'console', 7000);
    assert.deepEqual(dedupedAgain[0].categories.required, ['siren', 'console']);

    const removed = removeCategoryFromTier(dedupedAgain, 's1', 'required', 'siren', 8000);
    assert.deepEqual(removed[0].categories.required, ['console']);

    const defaultEntry = [makeStandard({ id: 's1', isCustom: false, categories: { required: ['siren'], recommended: [], optional: [] } })];
    const unchanged = addCategoryToTier(defaultEntry, 's1', 'required', 'console', 9000);
    assert.deepEqual(unchanged[0].categories.required, ['siren']);
  });

  it('getDepartmentStandardById resolves defaults before company standards and returns null when unresolved', () => {
    const { getDepartmentStandardById } = modules.departmentStandardsDomain;
    const custom = [makeStandard({ id: 'custom-1' })];
    assert.equal(getDepartmentStandardById('patrol', custom).name, 'Patrol');
    assert.equal(getDepartmentStandardById('custom-1', custom).name, 'Custom Patrol');
    assert.equal(getDepartmentStandardById('missing', custom), null);
    assert.equal(getDepartmentStandardById(null, custom), null);
  });
});

// ---------------------------------------------------------------------------
// Feature 7: Standard assignment resolution (build overrides project)
// ---------------------------------------------------------------------------
describe('resolveAssignedStandardId / resolveEffectiveStandard (Feature 7 assignment)', () => {
  it('prefers the build’s own assignment over its project’s', () => {
    const { resolveAssignedStandardId } = modules.departmentStandardsDomain;
    const build = makeBuild({ departmentStandardId: 'k9' });
    const project = makeProject({ departmentStandardId: 'patrol' });
    assert.equal(resolveAssignedStandardId(build, project), 'k9');
  });

  it('falls back to the project’s assignment when the build has none', () => {
    const { resolveAssignedStandardId } = modules.departmentStandardsDomain;
    const build = makeBuild({ departmentStandardId: null });
    const project = makeProject({ departmentStandardId: 'patrol' });
    assert.equal(resolveAssignedStandardId(build, project), 'patrol');
  });

  it('resolves null when neither the build nor its project (or no project at all) has an assignment', () => {
    const { resolveAssignedStandardId } = modules.departmentStandardsDomain;
    assert.equal(resolveAssignedStandardId(makeBuild(), makeProject()), null);
    assert.equal(resolveAssignedStandardId(makeBuild(), null), null);
  });

  it('resolveEffectiveStandard resolves the full record across defaults and company standards (cross-project assignment)', () => {
    const { resolveEffectiveStandard } = modules.departmentStandardsDomain;
    const companyStandards = [makeStandard({ id: 'company-1', name: 'County Patrol Package' })];

    // Two different projects can each assign the same company standard —
    // resolution doesn't care which project a build belongs to.
    const projectA = makeProject({ id: 'proj-a', departmentStandardId: 'company-1' });
    const projectB = makeProject({ id: 'proj-b', departmentStandardId: 'company-1' });
    const buildInA = makeBuild({ id: 'build-a', projectId: 'proj-a' });
    const buildInB = makeBuild({ id: 'build-b', projectId: 'proj-b' });

    assert.equal(resolveEffectiveStandard(buildInA, projectA, companyStandards).name, 'County Patrol Package');
    assert.equal(resolveEffectiveStandard(buildInB, projectB, companyStandards).name, 'County Patrol Package');
    assert.equal(resolveEffectiveStandard(makeBuild({ departmentStandardId: 'unknown-id' }), null, companyStandards), null);
  });
});

// ---------------------------------------------------------------------------
// Feature 2: Fleet Completion Engine
// ---------------------------------------------------------------------------
describe('evaluateFleetBuildIntelligence (Fleet Completion Engine)', () => {
  const standard = makeStandard({
    categories: { required: ['roof_lighting', 'siren'], recommended: ['console'], optional: ['scene_lighting'] },
  });

  it('returns null when no standard is assigned (edge case: no standard)', () => {
    const { evaluateFleetBuildIntelligence } = modules.departmentStandardsDomain;
    assert.equal(evaluateFleetBuildIntelligence(makeBuild(), null), null);
  });

  it('scores partial completion with required weighted above recommended/optional', () => {
    const { evaluateFleetBuildIntelligence } = modules.departmentStandardsDomain;
    const build = withSelection(makeBuild(), 'roof_lighting');
    const report = evaluateFleetBuildIntelligence(build, standard);

    assert.equal(report.requiredInstalled, 1);
    assert.equal(report.requiredTotal, 2);
    assert.deepEqual(report.missingRequired, ['siren']);
    assert.deepEqual(report.missingRecommended, ['console']);
    assert.deepEqual(report.missingOptional, ['scene_lighting']);
    assert.equal(report.departmentCompliant, false);
    assert.deepEqual(report.criticalBlockers, ['siren']);
    // (1/2*0.7 + 0/1*0.2 + 0/1*0.1) / 1.0 * 100 = 35
    assert.equal(report.completionPercent, 35);
  });

  it('is fully department-compliant at 100% completion (edge case: 100% completion)', () => {
    const { evaluateFleetBuildIntelligence } = modules.departmentStandardsDomain;
    let build = makeBuild();
    build = withSelection(build, 'roof_lighting', 'p1');
    build = withSelection(build, 'siren', 'p2');
    build = withSelection(build, 'console', 'p3');
    build = withSelection(build, 'scene_lighting', 'p4');
    const report = evaluateFleetBuildIntelligence(build, standard);

    assert.equal(report.completionPercent, 100);
    assert.equal(report.departmentCompliant, true);
    assert.deepEqual(report.missingRequired, []);
    assert.deepEqual(report.criticalBlockers, []);
  });

  it('treats an empty required tier as trivially compliant and renormalizes weights (edge case: empty tier)', () => {
    const { evaluateFleetBuildIntelligence } = modules.departmentStandardsDomain;
    const noRequiredStandard = makeStandard({ categories: { required: [], recommended: ['console'], optional: ['scene_lighting'] } });
    const report = evaluateFleetBuildIntelligence(makeBuild(), noRequiredStandard);

    assert.equal(report.requiredTotal, 0);
    assert.equal(report.departmentCompliant, true);
    assert.equal(report.completionPercent, 0);
  });

  it('scores 0% when nothing has been installed against the standard', () => {
    const { evaluateFleetBuildIntelligence } = modules.departmentStandardsDomain;
    const report = evaluateFleetBuildIntelligence(makeBuild(), standard);
    assert.equal(report.completionPercent, 0);
    assert.equal(report.departmentCompliant, false);
  });
});

// ---------------------------------------------------------------------------
// Features 3 & 6: Fleet Health rollup (Workspace Fleet Intelligence / per-project Fleet Health)
// ---------------------------------------------------------------------------
describe('summarizeFleetHealth (Fleet Health rollup)', () => {
  it('handles an empty entry list (edge case: no builds) without crashing', () => {
    const { summarizeFleetHealth } = modules.departmentStandardsDomain;
    const health = summarizeFleetHealth([]);
    assert.equal(health.buildCount, 0);
    assert.equal(health.vehicleCount, 0);
    assert.equal(health.overallCompletionPercent, 0);
    assert.equal(health.color, 'red');
    assert.equal(health.departmentCompliancePercent, 0);
    assert.deepEqual(health.criticalGaps, []);
  });

  it('buckets every vehicle as "needs review" when no build has a standard assigned (edge case: no standards)', () => {
    const { summarizeFleetHealth } = modules.departmentStandardsDomain;
    const entries = [
      { build: makeBuild({ id: 'b1', quantity: 3 }), standard: null },
      { build: makeBuild({ id: 'b2', quantity: 2 }), standard: null },
    ];
    const health = summarizeFleetHealth(entries);
    assert.equal(health.vehicleCount, 5);
    assert.equal(health.vehiclesNeedReview, 5);
    assert.equal(health.vehiclesReady, 0);
    assert.equal(health.vehiclesInProgress, 0);
    assert.equal(health.vehiclesMissingEquipment, 0);
    assert.equal(health.departmentCompliancePercent, 0);
  });

  it('aggregates a realistic partial-completion mix across ready/in-progress/missing/needs-review buckets', () => {
    const { summarizeFleetHealth } = modules.departmentStandardsDomain;
    const standardReady = makeStandard({ id: 'sA', categories: { required: ['siren'], recommended: [], optional: [] } });
    const standardInProgress = makeStandard({ id: 'sB', categories: { required: ['siren', 'console'], recommended: ['speaker'], optional: [] } });
    const standardMissing = makeStandard({ id: 'sC', categories: { required: ['rear_warning'], recommended: [], optional: [] } });

    const entries = [
      { build: withSelection(makeBuild({ id: 'ready', quantity: 3 }), 'siren'), standard: standardReady },
      { build: withSelection(makeBuild({ id: 'progress', quantity: 2 }), 'console'), standard: standardInProgress },
      { build: makeBuild({ id: 'missing', quantity: 1 }), standard: standardMissing },
      { build: makeBuild({ id: 'review', quantity: 4 }), standard: null },
    ];

    const health = summarizeFleetHealth(entries);
    assert.equal(health.buildCount, 4);
    assert.equal(health.vehicleCount, 10);
    assert.equal(health.vehiclesReady, 3);
    assert.equal(health.vehiclesInProgress, 2);
    assert.equal(health.vehiclesMissingEquipment, 1);
    assert.equal(health.vehiclesNeedReview, 4);
    assert.equal(health.overallCompletionPercent, 35);
    assert.equal(health.color, 'yellow');
    assert.equal(health.departmentCompliancePercent, 50);
    assert.deepEqual(health.criticalGaps, [
      { categoryId: 'siren', label: 'Siren', vehicleCount: 2 },
      { categoryId: 'rear_warning', label: 'Rear Warning', vehicleCount: 1 },
    ]);
  });

  it('reports full readiness at 100% completion (edge case: 100% completion)', () => {
    const { summarizeFleetHealth } = modules.departmentStandardsDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const entries = [
      { build: withSelection(makeBuild({ id: 'b1', quantity: 5 }), 'siren'), standard },
      { build: withSelection(makeBuild({ id: 'b2', quantity: 5 }), 'siren'), standard },
    ];
    const health = summarizeFleetHealth(entries);
    assert.equal(health.vehiclesReady, 10);
    assert.equal(health.overallCompletionPercent, 100);
    assert.equal(health.departmentCompliancePercent, 100);
    assert.equal(health.color, 'green');
    assert.deepEqual(health.criticalGaps, []);
  });

  it('caps criticalGaps at the top 5 by vehicle count, sorted descending', () => {
    const { summarizeFleetHealth } = modules.departmentStandardsDomain;
    const categoryIds = ['roof_lighting', 'siren', 'speaker', 'console', 'partition', 'rear_warning'];
    const entries = categoryIds.map((categoryId, index) => ({
      build: makeBuild({ id: `b-${categoryId}`, quantity: index + 1 }),
      standard: makeStandard({ id: `s-${categoryId}`, categories: { required: [categoryId], recommended: [], optional: [] } }),
    }));
    const health = summarizeFleetHealth(entries);
    assert.equal(health.criticalGaps.length, 5);
    assert.deepEqual(health.criticalGaps.map((gap) => gap.vehicleCount), [6, 5, 4, 3, 2]);
  });

  it('rolls up correctly across entries from more than one Fleet Project (cross-project workspace-wide aggregation)', () => {
    const { summarizeFleetHealth } = modules.departmentStandardsDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const entries = [
      { build: withSelection(makeBuild({ id: 'b1', projectId: 'proj-a', quantity: 2 }), 'siren'), standard },
      { build: makeBuild({ id: 'b2', projectId: 'proj-b', quantity: 3 }), standard },
    ];
    const health = summarizeFleetHealth(entries);
    assert.equal(health.vehicleCount, 5);
    assert.equal(health.vehiclesReady, 2);
    assert.equal(health.vehiclesMissingEquipment, 3);
  });
});

// ---------------------------------------------------------------------------
// Feature 5: Product Intelligence
// ---------------------------------------------------------------------------
describe('getStandardsForProduct / getRequiredByStandards / getRecommendedForStandards (Product Intelligence)', () => {
  it('matches a product against every standard whose tiers reference its classified category', () => {
    const { getStandardsForProduct, getRequiredByStandards, getRecommendedForStandards } = modules.departmentStandardsDomain;
    const sirenProduct = { id: 'p1', title: 'Wail Siren 100W' };
    const patrolStandard = makeStandard({ id: 'patrol', categories: { required: ['siren'], recommended: [], optional: [] } });
    const supervisorStandard = makeStandard({ id: 'supervisor', categories: { required: [], recommended: ['siren'], optional: [] } });
    const swatStandard = makeStandard({ id: 'swat', categories: { required: [], recommended: [], optional: ['siren'] } });

    const matches = getStandardsForProduct(sirenProduct, [patrolStandard, supervisorStandard, swatStandard]);
    assert.equal(matches.length, 3);
    assert.deepEqual(matches.map((m) => m.tier), ['required', 'recommended', 'optional']);

    const requiredBy = getRequiredByStandards(matches);
    assert.deepEqual(requiredBy.map((s) => s.id), ['patrol']);

    const recommendedFor = getRecommendedForStandards(matches);
    assert.deepEqual(recommendedFor.map((s) => s.id).sort(), ['patrol', 'supervisor']);
  });

  it('returns no matches for a product that cannot be classified into any upfit category', () => {
    const { getStandardsForProduct } = modules.departmentStandardsDomain;
    const unclassifiable = { id: 'p2', title: 'Mystery Widget' };
    const matches = getStandardsForProduct(unclassifiable, [makeStandard()]);
    assert.deepEqual(matches, []);
  });

  it('returns no matches for a null/undefined product', () => {
    const { getStandardsForProduct } = modules.departmentStandardsDomain;
    assert.deepEqual(getStandardsForProduct(null, [makeStandard()]), []);
  });
});

// ---------------------------------------------------------------------------
// Components: presentation helpers
// ---------------------------------------------------------------------------
describe('DepartmentStandardBadge helpers', () => {
  it('toStandardCompletionBadge maps a report to green/yellow/red', () => {
    const { toStandardCompletionBadge } = modules.departmentStandardBadge;
    assert.equal(toStandardCompletionBadge({ completionPercent: 100, departmentCompliant: true, requiredInstalled: 2, recommendedInstalled: 1, optionalInstalled: 1 }).color, 'green');
    assert.equal(toStandardCompletionBadge({ completionPercent: 35, departmentCompliant: false, requiredInstalled: 1, recommendedInstalled: 0, optionalInstalled: 0 }).color, 'yellow');
    assert.equal(toStandardCompletionBadge({ completionPercent: 0, departmentCompliant: false, requiredInstalled: 0, recommendedInstalled: 0, optionalInstalled: 0 }).color, 'red');
  });

  it('StandardTierChip renders the tier label', () => {
    const { StandardTierChip } = modules.departmentStandardBadge;
    assert.match(renderPure(React.createElement(StandardTierChip, { tier: 'required' })), /Required/);
    assert.match(renderPure(React.createElement(StandardTierChip, { tier: 'recommended' })), /Recommended/);
    assert.match(renderPure(React.createElement(StandardTierChip, { tier: 'optional' })), /Optional/);
  });
});

describe('AssignStandardControl', () => {
  it('renders default and company standards grouped into optgroups, with the current value selected', () => {
    const { default: AssignStandardControl } = modules.assignStandardControl;
    const html = renderPure(React.createElement(AssignStandardControl, {
      defaultStandards: [{ id: 'patrol', name: 'Patrol' }],
      companyStandards: [{ id: 'company-1', name: 'County Patrol Package' }],
      value: 'company-1',
      inheritedLabel: 'Inherit from Project',
      onChange: () => {},
    }));
    assert.match(html, /Default Standards/);
    assert.match(html, /Company Standards/);
    assert.match(html, /Patrol/);
    assert.match(html, /County Patrol Package/);
    assert.match(html, /Inherit from Project/);
    assert.match(html, /value="company-1"/);
  });
});

// ---------------------------------------------------------------------------
// Feature 3: Workspace Fleet Intelligence section
// ---------------------------------------------------------------------------
describe('WorkspaceFleetIntelligenceSection (Feature 3)', () => {
  it('renders an empty state with no fleet builds (edge case: no builds)', () => {
    const { default: WorkspaceFleetIntelligenceSection } = modules.workspaceFleetIntelligenceSection;
    const html = renderPure(React.createElement(WorkspaceFleetIntelligenceSection, { entries: [], onOpenFleetBuilds: () => {} }));
    assert.match(html, /No fleet builds yet/);
  });

  it('renders the readiness bar, vehicle counts, department compliance, and critical missing equipment', () => {
    const { default: WorkspaceFleetIntelligenceSection } = modules.workspaceFleetIntelligenceSection;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const entries = [
      { build: withSelection(makeBuild({ id: 'b1', quantity: 3 }), 'siren'), standard },
      { build: makeBuild({ id: 'b2', quantity: 2 }), standard },
    ];
    const html = renderPure(React.createElement(WorkspaceFleetIntelligenceSection, { entries, onOpenFleetBuilds: () => {} }));

    assert.match(html, /5 Vehicles/);
    assert.match(html, /3 Complete/);
    assert.match(html, /Department Compliance/);
    assert.match(html, /Vehicles Ready/);
    assert.match(html, /Vehicles In Progress/);
    assert.match(html, /Vehicles Missing Equipment/);
    assert.match(html, /Critical Missing Equipment/);
    assert.match(html, /Vehicles? Missing Siren/);
  });

  it('uses mobile-safe responsive grid classes', () => {
    const { default: WorkspaceFleetIntelligenceSection } = modules.workspaceFleetIntelligenceSection;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const html = renderPure(React.createElement(WorkspaceFleetIntelligenceSection, {
      entries: [{ build: makeBuild(), standard }],
      onOpenFleetBuilds: () => {},
    }));
    assert.match(html, /grid-cols-2 sm:grid-cols-3 lg:grid-cols-5/);
  });
});

// ---------------------------------------------------------------------------
// Features 1 & 7: DepartmentStandardsSection (library + company standards)
// ---------------------------------------------------------------------------
describe('DepartmentStandardsSection (Feature 1 & 7)', () => {
  it('renders every default standard with a Clone to Customize action', () => {
    const { default: DepartmentStandardsSection } = modules.departmentStandardsSection;
    const { DEFAULT_DEPARTMENT_STANDARDS } = modules.departmentStandardsDomain;
    const html = renderPure(React.createElement(DepartmentStandardsSection, {
      defaultStandards: DEFAULT_DEPARTMENT_STANDARDS,
      companyStandards: [],
      onClone: () => {},
      onRename: () => {},
      onDelete: () => {},
      onAddCategory: () => {},
      onRemoveCategory: () => {},
    }));
    assert.match(html, /Department Standards \(12\)/);
    assert.match(html, /Patrol/);
    assert.match(html, /Clone to Customize/);
  });

  it('renders a company standard with rename/duplicate/delete actions and editable category chips', () => {
    const { default: DepartmentStandardsSection } = modules.departmentStandardsSection;
    const companyStandard = makeStandard({ name: 'County Patrol Package' });
    const html = renderPure(React.createElement(DepartmentStandardsSection, {
      defaultStandards: [],
      companyStandards: [companyStandard],
      onClone: () => {},
      onRename: () => {},
      onDelete: () => {},
      onAddCategory: () => {},
      onRemoveCategory: () => {},
    }));
    assert.match(html, /County Patrol Package/);
    assert.match(html, /COMPANY STANDARD/);
    assert.match(html, /Duplicate/);
    assert.match(html, /Delete/);
    assert.match(html, /Add category/);
  });

  it('uses a mobile-safe responsive grid class for the standards list', () => {
    const { default: DepartmentStandardsSection } = modules.departmentStandardsSection;
    const html = renderPure(React.createElement(DepartmentStandardsSection, {
      defaultStandards: [makeStandard({ isCustom: false })],
      companyStandards: [],
      onClone: () => {},
    }));
    assert.match(html, /grid-cols-1 md:grid-cols-2/);
  });
});

// ---------------------------------------------------------------------------
// Feature 5: ProductIntelligencePanelView
// ---------------------------------------------------------------------------
describe('ProductIntelligencePanelView (Feature 5)', () => {
  it('renders nothing when there are no standard matches and nothing commonly installed with it', () => {
    const { ProductIntelligencePanelView } = modules.productIntelligencePanel;
    const html = renderPure(React.createElement(ProductIntelligencePanelView, {
      product: { id: 'p1' }, matches: [], commonlyInstalledWith: [], verticalId: 'police', categoryId: 'light-bars',
    }));
    assert.equal(html, '');
  });

  it('renders Recommended For, Required By, Department Standards, and Commonly Installed With', () => {
    const { ProductIntelligencePanelView } = modules.productIntelligencePanel;
    const patrol = makeStandard({ id: 'patrol', name: 'Patrol' });
    const supervisor = makeStandard({ id: 'supervisor', name: 'Supervisor' });
    const matches = [
      { standard: patrol, tier: 'required' },
      { standard: supervisor, tier: 'recommended' },
    ];
    const commonlyInstalledWith = [
      { id: 'speaker-1', title: 'PA Speaker', verticals: ['police'], category: 'sirens-speakers' },
    ];
    const html = renderWithProviders(React.createElement(ProductIntelligencePanelView, {
      product: { id: 'p1' }, matches, commonlyInstalledWith, verticalId: 'police', categoryId: 'sirens-speakers',
    }));

    assert.match(html, /Recommended For/);
    assert.match(html, /Required By/);
    assert.match(html, /Department Standards/);
    assert.match(html, /Commonly Installed With/);
    assert.match(html, /Patrol/);
    assert.match(html, /Supervisor/);
    assert.match(html, /PA Speaker/);
  });
});

// ---------------------------------------------------------------------------
// Feature 4: FinishYourUpfitPanelView department-standard expansion
// ---------------------------------------------------------------------------
describe('FinishYourUpfitPanelView — department standard status (Feature 4)', () => {
  const standard = makeStandard({
    name: 'Patrol',
    categories: { required: ['roof_lighting', 'siren'], recommended: ['console'], optional: [] },
  });

  it('shows Missing Required/Recommended Equipment and Recommended Next Products when a standard is assigned', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = withSelection(makeBuild(), 'roof_lighting');
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild],
      activeBuild,
      product: { id: 'siren-1', title: 'Wail Siren' },
      effectiveStandard: standard,
      onAddToActiveBuild: () => {},
      onOpenFleetBuilds: () => {},
      onApplyTemplate: () => {},
      onCloneActiveBuild: () => {},
    }));

    assert.match(html, /Department Standard: Patrol/);
    assert.match(html, /Missing Required Equipment/);
    assert.match(html, /Siren/);
    assert.match(html, /Missing Recommended Equipment/);
    assert.match(html, /Console/);
    assert.match(html, /Recommended Next Products/);
    // The current product classifies as "siren", which is missing-required — offered as "Add", not "Browse".
    assert.match(html, /Add Siren/);
    assert.match(html, /Browse Console/);
  });

  it('shows full compliance messaging once every required/recommended category is filled', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    let activeBuild = withSelection(makeBuild(), 'roof_lighting', 'p1');
    activeBuild = withSelection(activeBuild, 'siren', 'p2');
    activeBuild = withSelection(activeBuild, 'console', 'p3');
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild],
      activeBuild,
      product: { id: 'unrelated' },
      effectiveStandard: standard,
      onAddToActiveBuild: () => {},
      onOpenFleetBuilds: () => {},
      onApplyTemplate: () => {},
      onCloneActiveBuild: () => {},
    }));
    assert.match(html, /Fully department-compliant/);
    assert.match(html, /Nothing outstanding/);
  });

  it('renders no standard-status block when no standard is effective (edge case: no standards)', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = makeBuild();
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild],
      activeBuild,
      product: { id: 'p1' },
      effectiveStandard: null,
      onAddToActiveBuild: () => {},
      onOpenFleetBuilds: () => {},
      onApplyTemplate: () => {},
      onCloneActiveBuild: () => {},
    }));
    assert.doesNotMatch(html, /Department Standard:/);
  });
});

// ---------------------------------------------------------------------------
// Feature 7: FleetBuildCard / FleetProjectCard standard assignment surfaces
// ---------------------------------------------------------------------------
describe('FleetBuildCard — department standard assignment (Feature 7: assign to individual builds)', () => {
  it('renders the assignment control and a compliance badge against the effective standard', () => {
    const { default: FleetBuildCard } = modules.fleetBuildCard;
    const standard = makeStandard({ name: 'Patrol', categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = makeBuild();
    const html = renderPure(React.createElement(FleetBuildCard, {
      build,
      isActive: true,
      onSetActive: () => {},
      onRemove: () => {},
      onRename: () => {},
      onUpdateVehicle: () => {},
      onUpdateQuantity: () => {},
      onUpdateStyle: () => {},
      onRemoveProduct: () => {},
      onSaveAsTemplate: () => {},
      onCloneBuild: () => {},
      defaultStandards: [{ id: 'patrol', name: 'Patrol' }],
      companyStandards: [],
      effectiveStandard: standard,
      onAssignStandard: () => {},
    }));
    assert.match(html, /Department Standard/);
    assert.match(html, /vs\. Patrol/);
    assert.match(html, /missing Siren/);
  });
});

describe('FleetProjectCard — Fleet Health (Feature 6) and standard assignment (Feature 7: assign to projects)', () => {
  const baseProps = {
    project: makeProject(),
    summary: { averageCompletionPercent: 50, completionColor: 'yellow', vehicleCount: 2, buildCount: 2, templateCount: 0, lastModified: null },
    isActive: true,
    onOpen: () => {}, onDuplicate: () => {}, onRename: () => {}, onArchive: () => {}, onDelete: () => {},
  };

  it('renders the Fleet Health block with critical warnings when health is provided', () => {
    const { default: FleetProjectCard } = modules.fleetProjectCard;
    const html = renderPure(React.createElement(FleetProjectCard, {
      ...baseProps,
      defaultStandards: [{ id: 'patrol', name: 'Patrol' }],
      companyStandards: [],
      onAssignStandard: () => {},
      health: {
        overallCompletionPercent: 82,
        color: 'yellow',
        criticalGaps: [
          { categoryId: 'siren', label: 'Siren', vehicleCount: 3 },
          { categoryId: 'rear_warning', label: 'Rear Warning', vehicleCount: 2 },
        ],
      },
    }));
    assert.match(html, /Fleet Health/);
    assert.match(html, /82%/);
    assert.match(html, /Critical/);
    assert.match(html, /3 Vehicles Missing Siren/);
    assert.match(html, /2 Vehicles Missing Rear Warning/);
    assert.match(html, /Department Standard/);
  });

  it('omits the Fleet Health block when no health summary is available (edge case: no builds in this project)', () => {
    const { default: FleetProjectCard } = modules.fleetProjectCard;
    const html = renderPure(React.createElement(FleetProjectCard, {
      ...baseProps,
      defaultStandards: [], companyStandards: [], onAssignStandard: () => {}, health: null,
    }));
    assert.doesNotMatch(html, /Fleet Health/);
  });
});
