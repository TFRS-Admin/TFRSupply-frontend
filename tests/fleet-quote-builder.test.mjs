import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    fleetQuoteDomain: await server.ssrLoadModule('/src/domain/fleetQuote/index.ts'),
    fleetBuildsDomain: await server.ssrLoadModule('/src/domain/fleetBuilds/index.ts'),
    departmentStandardsDomain: await server.ssrLoadModule('/src/domain/departmentStandards/index.ts'),
    upfitBuilderDomain: await server.ssrLoadModule('/src/domain/upfitBuilder/index.ts'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicleContext: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    compareContext: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    recentlyViewedContext: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
    savedProductsContext: await server.ssrLoadModule('/src/context/SavedProductsContext.jsx'),
    fleetProjectContext: await server.ssrLoadModule('/src/context/FleetProjectContext.jsx'),
    fleetBuildsContext: await server.ssrLoadModule('/src/context/FleetBuildsContext.jsx'),
    fleetTemplatesContext: await server.ssrLoadModule('/src/context/FleetTemplatesContext.jsx'),
    departmentStandardsContext: await server.ssrLoadModule('/src/context/DepartmentStandardsContext.jsx'),
    upfitBuilderContext: await server.ssrLoadModule('/src/context/UpfitBuilderContext.jsx'),
    configuratorContext: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    projectQuotePage: await server.ssrLoadModule('/src/pages/ProjectQuotePage.jsx'),
    projectQuoteSummaryCard: await server.ssrLoadModule('/src/components/fleetQuote/ProjectQuoteSummaryCard.jsx'),
    vehicleQuoteCard: await server.ssrLoadModule('/src/components/fleetQuote/VehicleQuoteCard.jsx'),
    vehicleSummarySection: await server.ssrLoadModule('/src/components/fleetQuote/VehicleSummarySection.jsx'),
    quoteItemsSection: await server.ssrLoadModule('/src/components/fleetQuote/QuoteItemsSection.jsx'),
    projectTotalsSection: await server.ssrLoadModule('/src/components/fleetQuote/ProjectTotalsSection.jsx'),
    missingEquipmentReportSection: await server.ssrLoadModule('/src/components/fleetQuote/MissingEquipmentReportSection.jsx'),
    exportPreviewSection: await server.ssrLoadModule('/src/components/fleetQuote/ExportPreviewSection.jsx'),
    projectQuoteWorkspaceSection: await server.ssrLoadModule('/src/components/fleetQuote/ProjectQuoteWorkspaceSection.jsx'),
    quoteReadinessBadge: await server.ssrLoadModule('/src/components/fleetQuote/QuoteReadinessBadge.jsx'),
    upfitBuilderReviewStep: await server.ssrLoadModule('/src/components/upfitBuilder/UpfitBuilderReviewStep.jsx'),
    finishYourUpfitPanel: await server.ssrLoadModule('/src/components/fleetBuilds/FinishYourUpfitPanel.jsx'),
  };
});

after(async () => {
  await server?.close();
});

// React SSR inserts `<!-- -->` marker comments between adjacent JSX text
// expressions — strip them so naive string assertions aren't broken by them.
function stripHtmlComments(html) {
  return html.replace(/<!--\s*-->/g, '');
}

function renderPure(element) {
  return stripHtmlComments(renderToString(element));
}

// Full provider stack mirroring src/App.jsx's nesting (see
// tests/guided-upfit-builder.test.mjs for the same pattern).
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
  const { UpfitBuilderProvider } = modules.upfitBuilderContext;
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
                      React.createElement(UpfitBuilderProvider, null,
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
    ),
  ));
}

function withLocalStorage(seed, fn) {
  const store = new Map(Object.entries(seed).map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]));
  global.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)); },
    removeItem: (key) => { store.delete(key); },
  };
  try {
    return fn();
  } finally {
    delete global.localStorage;
  }
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
function makeBuild(overrides = {}) {
  return {
    id: 'build-1', name: 'Build 1', vehicle: { year: '2024', make: 'Ford', model: 'Explorer', vertical: 'Police' },
    quantity: 1, buildStyle: 'patrol', selections: {}, createdAt: 1000, projectId: 'proj-1', ...overrides,
  };
}

function withSelection(build, categoryId, productId = 'p1', label = 'Selected Product') {
  return {
    ...build,
    selections: { ...build.selections, [categoryId]: [...(build.selections[categoryId] ?? []), { productId, label, addedAt: 1000 }] },
  };
}

function makeProject(overrides = {}) {
  return { id: 'proj-1', name: 'Project One', archived: false, createdAt: 1000, updatedAt: 1000, ...overrides };
}

function makeStandard(overrides = {}) {
  return {
    id: 'standard-1', key: 'patrol', name: 'Custom Patrol', description: 'A custom patrol standard.',
    categories: { required: [], recommended: [], optional: [] },
    isCustom: true, basedOnId: 'patrol', createdAt: 1000, updatedAt: 1000, ...overrides,
  };
}

function makeProduct(overrides = {}) {
  return {
    id: 'product-1', title: 'Generic Product', label: 'Generic Product',
    verticalIds: ['police'], categoryIds: ['sirens-speakers'], commerce: {}, marketing: {}, ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildFleetQuoteEntries — resolves standard + checklist once per build
// ---------------------------------------------------------------------------
describe('buildFleetQuoteEntries', () => {
  it('resolves each build’s effective standard and Guided Upfit Builder checklist', () => {
    const { buildFleetQuoteEntries } = modules.fleetQuoteDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = withSelection(makeBuild({ departmentStandardId: 'standard-1' }), 'console', 'p1');
    const [entry] = buildFleetQuoteEntries([build], makeProject(), [standard]);

    assert.equal(entry.standard.id, 'standard-1');
    assert.deepEqual(entry.checklist.missingRequired, ['siren']);
  });

  it('never reads UpfitBuilderContext skip state — optional categories always report missing, not skipped', () => {
    const { buildFleetQuoteEntries } = modules.fleetQuoteDomain;
    const [entry] = buildFleetQuoteEntries([makeBuild()], makeProject(), []);
    assert.equal(entry.checklist.skippedOptional.length, 0);
    assert.ok(entry.checklist.steps.every((step) => step.status !== 'skipped'));
  });
});

// ---------------------------------------------------------------------------
// resolveProjectDepartmentLabel
// ---------------------------------------------------------------------------
describe('resolveProjectDepartmentLabel', () => {
  it('returns "Not Assigned" with no builds', () => {
    const { resolveProjectDepartmentLabel } = modules.fleetQuoteDomain;
    assert.equal(resolveProjectDepartmentLabel([]), 'Not Assigned');
  });

  it('returns the shared standard name when every build agrees', () => {
    const { resolveProjectDepartmentLabel } = modules.fleetQuoteDomain;
    const standard = makeStandard({ name: 'Patrol Standard' });
    const entries = [{ build: makeBuild(), standard, checklist: {} }, { build: makeBuild({ id: 'build-2' }), standard, checklist: {} }];
    assert.equal(resolveProjectDepartmentLabel(entries), 'Patrol Standard');
  });

  it('returns "Mixed" when builds have different standards', () => {
    const { resolveProjectDepartmentLabel } = modules.fleetQuoteDomain;
    const entries = [
      { build: makeBuild(), standard: makeStandard({ name: 'Patrol' }), checklist: {} },
      { build: makeBuild({ id: 'build-2' }), standard: makeStandard({ id: 'standard-2', name: 'Supervisor' }), checklist: {} },
    ];
    assert.equal(resolveProjectDepartmentLabel(entries), 'Mixed');
  });

  it('returns "Not Assigned" when no build has a standard', () => {
    const { resolveProjectDepartmentLabel } = modules.fleetQuoteDomain;
    const entries = [{ build: makeBuild(), standard: null, checklist: {} }];
    assert.equal(resolveProjectDepartmentLabel(entries), 'Not Assigned');
  });
});

// ---------------------------------------------------------------------------
// resolveQuoteReadiness — deterministic scoring
// ---------------------------------------------------------------------------
describe('resolveQuoteReadiness', () => {
  it('is "blocked" with no active project', () => {
    const { resolveQuoteReadiness } = modules.fleetQuoteDomain;
    const readiness = resolveQuoteReadiness(false, []);
    assert.equal(readiness.level, 'blocked');
    assert.match(readiness.reasons[0], /No active Fleet Project/);
  });

  it('is "blocked" with an active project but no fleet builds', () => {
    const { resolveQuoteReadiness } = modules.fleetQuoteDomain;
    const readiness = resolveQuoteReadiness(true, []);
    assert.equal(readiness.level, 'blocked');
    assert.match(readiness.reasons[0], /No vehicles/);
  });

  it('is "incomplete" when required equipment is missing', () => {
    const { resolveQuoteReadiness } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = makeBuild();
    const readiness = resolveQuoteReadiness(true, [{ build, standard, checklist: buildGuidedUpfitChecklist(build, standard, []) }]);
    assert.equal(readiness.level, 'incomplete');
    assert.ok(readiness.reasons.some((reason) => /required equipment/.test(reason)));
  });

  it('is "incomplete" when a build has no vehicle assigned', () => {
    const { resolveQuoteReadiness } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const build = makeBuild({ vehicle: null });
    const readiness = resolveQuoteReadiness(true, [{ build, standard: null, checklist: buildGuidedUpfitChecklist(build, null, []) }]);
    assert.equal(readiness.level, 'incomplete');
    assert.ok(readiness.reasons.some((reason) => /missing a vehicle assignment/.test(reason)));
  });

  it('is "minor_issues" when required equipment is complete but recommended equipment is missing', () => {
    const { resolveQuoteReadiness } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: ['console'], optional: [] } });
    const build = withSelection(makeBuild(), 'siren', 'siren-1');
    const readiness = resolveQuoteReadiness(true, [{ build, standard, checklist: buildGuidedUpfitChecklist(build, standard, []) }]);
    assert.equal(readiness.level, 'minor_issues');
  });

  it('is "minor_issues" when no build has a Department Standard assigned', () => {
    const { resolveQuoteReadiness } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const build = makeBuild();
    const readiness = resolveQuoteReadiness(true, [{ build, standard: null, checklist: buildGuidedUpfitChecklist(build, null, []) }]);
    assert.equal(readiness.level, 'minor_issues');
    assert.ok(readiness.reasons.some((reason) => /No Department Standard/.test(reason)));
  });

  it('is "ready" when every build has a vehicle, a standard, and full required/recommended completion', () => {
    const { resolveQuoteReadiness } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: ['console'], optional: [] } });
    let build = withSelection(makeBuild(), 'siren', 'siren-1');
    build = withSelection(build, 'console', 'console-1');
    const readiness = resolveQuoteReadiness(true, [{ build, standard, checklist: buildGuidedUpfitChecklist(build, standard, []) }]);
    assert.equal(readiness.level, 'ready');
    assert.deepEqual(readiness.reasons, []);
  });
});

describe('meetsProjectQuoteReadinessThreshold', () => {
  it('passes for "ready" and "minor_issues", not for "incomplete"/"blocked"', () => {
    const { meetsProjectQuoteReadinessThreshold } = modules.fleetQuoteDomain;
    assert.equal(meetsProjectQuoteReadinessThreshold({ level: 'ready', label: 'Ready', reasons: [] }), true);
    assert.equal(meetsProjectQuoteReadinessThreshold({ level: 'minor_issues', label: 'Minor Issues', reasons: [] }), true);
    assert.equal(meetsProjectQuoteReadinessThreshold({ level: 'incomplete', label: 'Incomplete', reasons: [] }), false);
    assert.equal(meetsProjectQuoteReadinessThreshold({ level: 'blocked', label: 'Blocked', reasons: [] }), false);
  });
});

// ---------------------------------------------------------------------------
// aggregateVehicleQuote
// ---------------------------------------------------------------------------
describe('aggregateVehicleQuote', () => {
  it('reports installed/missing products, estimated equipment count, and completion from the checklist', () => {
    const { aggregateVehicleQuote } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: ['console'], optional: [] } });
    let build = withSelection(makeBuild({ quantity: 18, name: 'Explorer Patrol' }), 'siren', 'siren-1', 'Wail Siren');
    const checklist = buildGuidedUpfitChecklist(build, standard, []);
    const entry = { build, standard, checklist };

    const summary = aggregateVehicleQuote(entry, { products: [], getProduct: () => null });

    assert.equal(summary.buildName, 'Explorer Patrol');
    assert.equal(summary.quantity, 18);
    assert.equal(summary.estimatedEquipmentCount, 1 * 18);
    assert.deepEqual(summary.installedProducts, [{ productId: 'siren-1', label: 'Wail Siren', categoryId: 'siren', categoryLabel: 'Siren' }]);
    assert.deepEqual(summary.missingRequiredCategories, []);
    assert.deepEqual(summary.missingRecommendedCategories, ['Console']);
    assert.ok(summary.missingProducts.some((missing) => missing.categoryId === 'console' && missing.tier === 'recommended'));
  });

  it('recommendationStatus is "fully_equipped" once department-compliant', () => {
    const { aggregateVehicleQuote } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = withSelection(makeBuild(), 'siren', 'siren-1');
    const entry = { build, standard, checklist: buildGuidedUpfitChecklist(build, standard, []) };
    const summary = aggregateVehicleQuote(entry, { products: [], getProduct: () => null });
    assert.equal(summary.recommendationStatus, 'fully_equipped');
  });

  it('recommendationStatus is "no_recommendations" when incomplete but the thin catalog scores nothing', () => {
    const { aggregateVehicleQuote } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = makeBuild();
    const entry = { build, standard, checklist: buildGuidedUpfitChecklist(build, standard, []) };
    const summary = aggregateVehicleQuote(entry, { products: [], getProduct: () => null });
    assert.equal(summary.recommendationStatus, 'no_recommendations');
    assert.deepEqual(summary.recommendedAdditions, []);
  });

  it('recommendationStatus is "has_recommendations" when the catalog can score a real gap-filling product', () => {
    const { aggregateVehicleQuote } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = makeBuild();
    const sirenProduct = makeProduct({ id: 'siren-2', title: 'Wail Siren 200W' });
    const entry = { build, standard, checklist: buildGuidedUpfitChecklist(build, standard, []) };
    const summary = aggregateVehicleQuote(entry, { products: [sirenProduct], getProduct: (id) => (id === sirenProduct.id ? sirenProduct : null) });
    assert.equal(summary.recommendationStatus, 'has_recommendations');
    assert.equal(summary.recommendedAdditions.length, 1);
    assert.equal(summary.recommendedAdditions[0].product.id, 'siren-2');
  });
});

// ---------------------------------------------------------------------------
// aggregateProjectQuote
// ---------------------------------------------------------------------------
describe('aggregateProjectQuote', () => {
  it('composes Fleet Health, department label, and quote readiness for the Project Summary block', () => {
    const { aggregateProjectQuote } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ name: 'Patrol Standard', categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = withSelection(makeBuild({ quantity: 5 }), 'siren', 'siren-1');
    const entries = [{ build, standard, checklist: buildGuidedUpfitChecklist(build, standard, []) }];

    const summary = aggregateProjectQuote(makeProject({ name: 'My Project' }), entries, 5000);

    assert.equal(summary.projectName, 'My Project');
    assert.equal(summary.departmentLabel, 'Patrol Standard');
    assert.equal(summary.vehicleCount, 5);
    assert.equal(summary.completionPercent, 100);
    assert.equal(summary.fleetHealthColor, 'green');
    assert.equal(summary.quoteStatus.level, 'ready');
    assert.equal(summary.lastUpdated, 5000);
  });

  it('falls back to a "No Active Project" label with no project', () => {
    const { aggregateProjectQuote } = modules.fleetQuoteDomain;
    const summary = aggregateProjectQuote(null, [], null);
    assert.equal(summary.projectName, 'No Active Project');
    assert.equal(summary.quoteStatus.level, 'blocked');
  });
});

// ---------------------------------------------------------------------------
// buildVehicleQuoteSections / groupQuoteItems
// ---------------------------------------------------------------------------
describe('buildVehicleQuoteSections', () => {
  it('generates one section per build, labeled "{Model} {Style} x{quantity}", grouped by category', () => {
    const { buildVehicleQuoteSections } = modules.fleetQuoteDomain;
    let build = withSelection(makeBuild({ quantity: 18 }), 'siren', 'siren-1', 'Wail Siren');
    build = withSelection(build, 'console', 'console-1', 'Patrol Console');
    const [section] = buildVehicleQuoteSections([{ build, standard: null, checklist: {} }]);

    assert.equal(section.vehicleLabel, 'Explorer Patrol x18');
    assert.equal(section.categories.length, 2);
    assert.deepEqual(section.categories.map((category) => category.categoryLabel).sort(), ['Console', 'Siren']);
  });

  it('excludes categories with no selections', () => {
    const { buildVehicleQuoteSections } = modules.fleetQuoteDomain;
    const [section] = buildVehicleQuoteSections([{ build: makeBuild(), standard: null, checklist: {} }]);
    assert.deepEqual(section.categories, []);
  });
});

describe('groupQuoteItems', () => {
  it('groups identical equipment together: quantity sums build.quantity, vehicleCount counts distinct builds', () => {
    const { groupQuoteItems } = modules.fleetQuoteDomain;
    const buildA = withSelection(makeBuild({ id: 'build-a', quantity: 18 }), 'siren', 'shared-siren', 'Shared Siren');
    const buildB = withSelection(makeBuild({ id: 'build-b', quantity: 4 }), 'siren', 'shared-siren', 'Shared Siren');
    const groups = groupQuoteItems([
      { build: buildA, standard: null, checklist: {} },
      { build: buildB, standard: null, checklist: {} },
    ]);

    assert.equal(groups.length, 1);
    assert.equal(groups[0].quantity, 22);
    assert.equal(groups[0].vehicleCount, 2);
    assert.deepEqual(groups[0].buildIds.sort(), ['build-a', 'build-b']);
  });

  it('keeps distinct products as separate lines', () => {
    const { groupQuoteItems } = modules.fleetQuoteDomain;
    let build = withSelection(makeBuild({ quantity: 3 }), 'siren', 'siren-1');
    build = withSelection(build, 'console', 'console-1');
    const groups = groupQuoteItems([{ build, standard: null, checklist: {} }]);
    assert.equal(groups.length, 2);
  });
});

// ---------------------------------------------------------------------------
// calculateProjectTotals
// ---------------------------------------------------------------------------
describe('calculateProjectTotals', () => {
  it('computes vehicle/line-item/equipment-piece totals and vehicle-weighted remaining counts', () => {
    const { calculateProjectTotals, groupQuoteItems } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: ['console'], optional: [] } });
    const buildA = withSelection(makeBuild({ id: 'build-a', quantity: 18 }), 'siren', 'siren-1');
    const buildB = makeBuild({ id: 'build-b', quantity: 4 });
    const entries = [
      { build: buildA, standard, checklist: buildGuidedUpfitChecklist(buildA, standard, []) },
      { build: buildB, standard, checklist: buildGuidedUpfitChecklist(buildB, standard, []) },
    ];
    const groupedItems = groupQuoteItems(entries);
    const totals = calculateProjectTotals(entries, groupedItems);

    assert.equal(totals.totalVehicles, 22);
    assert.equal(totals.totalLineItems, 1);
    assert.equal(totals.totalEquipmentPieces, 18);
    // buildA: missing recommended (console) x18; buildB: missing required (siren) + recommended (console) x4
    assert.equal(totals.requiredEquipmentRemaining, 1 * 4);
    assert.equal(totals.recommendedEquipmentRemaining, (1 * 18) + (1 * 4));
  });

  it('returns all-zero totals for an empty project', () => {
    const { calculateProjectTotals } = modules.fleetQuoteDomain;
    const totals = calculateProjectTotals([], []);
    assert.equal(totals.totalVehicles, 0);
    assert.equal(totals.totalLineItems, 0);
    assert.equal(totals.totalEquipmentPieces, 0);
    assert.equal(totals.requiredEquipmentRemaining, 0);
    assert.equal(totals.recommendedEquipmentRemaining, 0);
  });
});

// ---------------------------------------------------------------------------
// buildMissingEquipmentReport
// ---------------------------------------------------------------------------
describe('buildMissingEquipmentReport', () => {
  it('splits outstanding categories into critical/recommended/optional and groups by vehicle/standard/category', () => {
    const { buildMissingEquipmentReport } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    // Every category not explicitly required/recommended defaults to optional
    // (see resolveCategoryTier in src/domain/upfitBuilder/guidedChecklist.ts) —
    // with nothing selected, all 12 categories are outstanding: 1 required, 1
    // recommended, 10 optional.
    const standard = makeStandard({ name: 'Patrol Standard', categories: { required: ['siren'], recommended: ['console'], optional: [] } });
    const build = makeBuild({ name: 'Explorer Patrol' });
    const entries = [{ build, standard, checklist: buildGuidedUpfitChecklist(build, standard, []) }];

    const report = buildMissingEquipmentReport(entries);

    assert.equal(report.critical.length, 1);
    assert.equal(report.critical[0].categoryId, 'siren');
    assert.equal(report.recommended.length, 1);
    assert.equal(report.optional.length, 10);
    assert.ok(report.byVehicle['Explorer Patrol']);
    assert.equal(report.byVehicle['Explorer Patrol'].length, 12);
    assert.ok(report.byDepartmentStandard['Patrol Standard']);
    assert.ok(report.byCategory['Siren']);
  });

  it('groups unassigned builds under "No Standard Assigned"', () => {
    const { buildMissingEquipmentReport } = modules.fleetQuoteDomain;
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const build = makeBuild();
    const entries = [{ build, standard: null, checklist: buildGuidedUpfitChecklist(build, null, []) }];
    const report = buildMissingEquipmentReport(entries);
    assert.ok(report.byDepartmentStandard['No Standard Assigned']);
  });

  it('returns empty tiers and groups for a fully-equipped project', () => {
    const { buildMissingEquipmentReport } = modules.fleetQuoteDomain;
    assert.deepEqual(buildMissingEquipmentReport([]), {
      critical: [], recommended: [], optional: [], byVehicle: {}, byDepartmentStandard: {}, byCategory: {},
    });
  });
});

// ---------------------------------------------------------------------------
// resolveProductQuoteInclusion — Product Detail integration
// ---------------------------------------------------------------------------
describe('resolveProductQuoteInclusion', () => {
  it('reports included=true with the owning build/category when the product is selected anywhere in the project', () => {
    const { resolveProductQuoteInclusion } = modules.fleetQuoteDomain;
    const build = withSelection(makeBuild({ name: 'Build A' }), 'siren', 'siren-1');
    const inclusion = resolveProductQuoteInclusion([build], 'siren-1');
    assert.deepEqual(inclusion, { included: true, buildId: 'build-1', buildName: 'Build A', categoryId: 'siren' });
  });

  it('reports included=false when the product is not selected in any build', () => {
    const { resolveProductQuoteInclusion } = modules.fleetQuoteDomain;
    const inclusion = resolveProductQuoteInclusion([makeBuild()], 'not-selected');
    assert.deepEqual(inclusion, { included: false, buildId: null, buildName: null, categoryId: null });
  });

  it('returns not-included for an empty project', () => {
    const { resolveProductQuoteInclusion } = modules.fleetQuoteDomain;
    assert.deepEqual(resolveProductQuoteInclusion([], 'anything').included, false);
  });
});

// ---------------------------------------------------------------------------
// buildExportPreview
// ---------------------------------------------------------------------------
describe('buildExportPreview', () => {
  it('assembles the preview document and deduplicates recommended products across vehicles', () => {
    const { buildExportPreview } = modules.fleetQuoteDomain;
    const sharedProduct = makeProduct({ id: 'shared-1' });
    const recommendation = { productId: 'shared-1', score: 10, reasonCodes: [], reasons: [], matchingCategoryId: null, matchingDepartmentStandardId: null, matchingBuildStyleId: null, compatibilityStatus: 'unknown', recommendationType: 'recommended', rank: 1 };

    const preview = buildExportPreview({
      departmentLabel: 'Patrol',
      projectName: 'My Project',
      vehicleSummaries: [
        { buildId: 'b1', recommendedAdditions: [{ recommendation, product: sharedProduct }] },
        { buildId: 'b2', recommendedAdditions: [{ recommendation, product: sharedProduct }] },
      ],
      equipmentSummary: [],
      missingEquipment: { critical: [], recommended: [], optional: [], byVehicle: {}, byDepartmentStandard: {}, byCategory: {} },
      quoteNotes: 'Deliver by June.',
      generatedAt: 12345,
    });

    assert.equal(preview.departmentLabel, 'Patrol');
    assert.equal(preview.projectName, 'My Project');
    assert.equal(preview.recommendations.length, 1);
    assert.equal(preview.quoteNotes, 'Deliver by June.');
    assert.equal(preview.generatedAt, 12345);
  });

  it('defaults quoteNotes to an empty string when omitted', () => {
    const { buildExportPreview } = modules.fleetQuoteDomain;
    const preview = buildExportPreview({
      departmentLabel: 'Not Assigned', projectName: 'Empty Project', vehicleSummaries: [], equipmentSummary: [],
      missingEquipment: { critical: [], recommended: [], optional: [], byVehicle: {}, byDepartmentStandard: {}, byCategory: {} },
      generatedAt: 1,
    });
    assert.equal(preview.quoteNotes, '');
  });
});

// ---------------------------------------------------------------------------
// Large fleets — the pipeline scales without throwing and totals stay correct
// ---------------------------------------------------------------------------
describe('large fleets', () => {
  it('aggregates a 25-build project (MAX_FLEET_BUILDS) without error, with correct totals', () => {
    const { buildFleetQuoteEntries, aggregateProjectQuote, aggregateVehicleQuote, buildVehicleQuoteSections, groupQuoteItems, calculateProjectTotals, buildMissingEquipmentReport, buildExportPreview } = modules.fleetQuoteDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });

    const builds = Array.from({ length: 25 }, (_, index) => (
      withSelection(makeBuild({ id: `build-${index}`, name: `Build ${index}`, quantity: 2, departmentStandardId: 'standard-1' }), 'siren', 'shared-siren', 'Shared Siren')
    ));

    const entries = buildFleetQuoteEntries(builds, makeProject(), [standard]);
    const projectSummary = aggregateProjectQuote(makeProject(), entries, null);
    const vehicles = entries.map((entry) => aggregateVehicleQuote(entry, { products: [], getProduct: () => null }));
    const sections = buildVehicleQuoteSections(entries);
    const groupedItems = groupQuoteItems(entries);
    const totals = calculateProjectTotals(entries, groupedItems);
    const missingReport = buildMissingEquipmentReport(entries);
    const preview = buildExportPreview({
      departmentLabel: projectSummary.departmentLabel, projectName: projectSummary.projectName,
      vehicleSummaries: vehicles, equipmentSummary: groupedItems, missingEquipment: missingReport, generatedAt: 1,
    });

    assert.equal(entries.length, 25);
    assert.equal(vehicles.length, 25);
    assert.equal(sections.length, 25);
    assert.equal(groupedItems.length, 1);
    assert.equal(groupedItems[0].vehicleCount, 25);
    assert.equal(groupedItems[0].quantity, 50);
    assert.equal(totals.totalVehicles, 50);
    assert.equal(totals.totalEquipmentPieces, 50);
    assert.equal(totals.requiredEquipmentRemaining, 0);
    assert.equal(projectSummary.quoteStatus.level, 'ready');
    assert.equal(preview.vehicleSummaries.length, 25);
  });
});

// ---------------------------------------------------------------------------
// Component rendering — fixture-driven
// ---------------------------------------------------------------------------
describe('ProjectQuoteSummaryCard', () => {
  it('renders project name, department, fleet health, and quote status', () => {
    const { default: ProjectQuoteSummaryCard } = modules.projectQuoteSummaryCard;
    const html = renderPure(React.createElement(ProjectQuoteSummaryCard, {
      summary: {
        projectId: 'proj-1', projectName: '2026 Patrol Replacement', departmentLabel: 'Patrol Standard',
        buildCount: 2, vehicleCount: 22, completionPercent: 80, fleetHealthColor: 'yellow',
        quoteStatus: { level: 'minor_issues', label: 'Minor Issues', reasons: ['1 fleet build has no Department Standard assigned.'] },
        lastUpdated: 1700000000000,
      },
    }));
    assert.match(html, /2026 Patrol Replacement/);
    assert.match(html, /Patrol Standard/);
    assert.match(html, /Minor Issues/);
    assert.match(html, /80%/);
  });
});

describe('VehicleQuoteCard', () => {
  const vehicle = {
    buildId: 'build-1', buildName: 'Explorer Patrol', vehicleLabel: '2024 Ford Explorer', buildStyleLabel: 'Patrol',
    departmentStandardName: 'Patrol Standard', quantity: 18, completionPercent: 50, departmentCompliant: false,
    estimatedEquipmentCount: 18, missingRequiredCategories: ['Siren'], missingRecommendedCategories: [],
    installedProducts: [{ productId: 'p1', label: 'Console', categoryId: 'console', categoryLabel: 'Console' }],
    missingProducts: [{ categoryId: 'siren', categoryLabel: 'Siren', tier: 'required' }],
    recommendedAdditions: [], recommendationStatus: 'no_recommendations',
  };

  it('renders collapsed with core stats and missing required equipment', () => {
    const { default: VehicleQuoteCard } = modules.vehicleQuoteCard;
    const html = renderPure(React.createElement(VehicleQuoteCard, { vehicle, expanded: false, onToggleExpand: () => {} }));
    assert.match(html, /Explorer Patrol/);
    assert.match(html, /2024 Ford Explorer/);
    assert.match(html, /Siren/);
    assert.doesNotMatch(html, /vehicle-quote-card-expanded/);
  });

  it('renders installed/missing products and recommended additions when expanded', () => {
    const { default: VehicleQuoteCard } = modules.vehicleQuoteCard;
    const html = renderPure(React.createElement(VehicleQuoteCard, { vehicle, expanded: true, onToggleExpand: () => {} }));
    assert.match(html, /vehicle-quote-card-expanded/);
    assert.match(html, /Nothing installed yet\.|Console/);
  });
});

describe('QuoteItemsSection', () => {
  it('renders vehicle sections and the grouped equipment table', () => {
    const { default: QuoteItemsSection } = modules.quoteItemsSection;
    const html = renderPure(React.createElement(QuoteItemsSection, {
      sections: [{ buildId: 'b1', buildName: 'Build 1', vehicleLabel: 'Explorer Patrol x18', quantity: 18, categories: [{ categoryId: 'siren', categoryLabel: 'Siren', products: [{ productId: 'p1', label: 'Wail Siren' }] }] }],
      groupedItems: [{ productId: 'p1', label: 'Wail Siren', categoryId: 'siren', categoryLabel: 'Siren', quantity: 18, vehicleCount: 1, buildIds: ['b1'] }],
    }));
    assert.match(html, /Explorer Patrol x18/);
    assert.match(html, /Wail Siren/);
    assert.match(html, /Grouped Equipment Summary/);
  });

  it('renders an empty state with no fleet builds', () => {
    const { default: QuoteItemsSection } = modules.quoteItemsSection;
    const html = renderPure(React.createElement(QuoteItemsSection, { sections: [], groupedItems: [] }));
    assert.match(html, /No fleet builds in this project yet\./);
  });
});

describe('ProjectTotalsSection', () => {
  it('renders every project total', () => {
    const { default: ProjectTotalsSection } = modules.projectTotalsSection;
    const html = renderPure(React.createElement(ProjectTotalsSection, {
      totals: { totalVehicles: 22, totalLineItems: 5, totalEquipmentPieces: 40, completionPercent: 75, requiredEquipmentRemaining: 3, recommendedEquipmentRemaining: 2 },
    }));
    assert.match(html, /Total Vehicles/);
    assert.match(html, /22/);
    assert.match(html, /75%/);
  });
});

describe('MissingEquipmentReportSection', () => {
  it('renders tier lists and the default "By Vehicle" grouping', () => {
    const { default: MissingEquipmentReportSection } = modules.missingEquipmentReportSection;
    const entry = { buildId: 'b1', buildName: 'Explorer Patrol', vehicleLabel: '2024 Ford Explorer', categoryId: 'siren', categoryLabel: 'Siren', tier: 'required', standardName: 'Patrol' };
    const html = renderPure(React.createElement(MissingEquipmentReportSection, {
      report: { critical: [entry], recommended: [], optional: [], byVehicle: { 'Explorer Patrol': [entry] }, byDepartmentStandard: { Patrol: [entry] }, byCategory: { Siren: [entry] } },
    }));
    assert.match(html, /Critical Missing Equipment \(1\)/);
    assert.match(html, /Explorer Patrol/);
    assert.match(html, /By Vehicle/);
  });

  it('renders "nothing outstanding" empty states for each tier', () => {
    const { default: MissingEquipmentReportSection } = modules.missingEquipmentReportSection;
    const html = renderPure(React.createElement(MissingEquipmentReportSection, {
      report: { critical: [], recommended: [], optional: [], byVehicle: {}, byDepartmentStandard: {}, byCategory: {} },
    }));
    assert.match(html, /Nothing outstanding\./);
    assert.match(html, /Nothing missing across this project\./);
  });
});

describe('ExportPreviewSection', () => {
  it('is collapsed by default (no document rendered) with a toggle button present', () => {
    const { default: ExportPreviewSection } = modules.exportPreviewSection;
    const html = renderPure(React.createElement(ExportPreviewSection, {
      preview: { departmentLabel: 'Patrol', projectName: 'My Project', vehicleSummaries: [], equipmentSummary: [], missingEquipment: { critical: [], recommended: [], optional: [] }, recommendations: [], quoteNotes: '', generatedAt: 1 },
      quoteNotes: '', onChangeQuoteNotes: () => {},
    }));
    assert.match(html, /Show Export Preview/);
    assert.doesNotMatch(html, /export-preview-document/);
  });
});

describe('ProjectQuoteWorkspaceSection', () => {
  it('renders a prompt to create a project when none is active', () => {
    const { default: ProjectQuoteWorkspaceSection } = modules.projectQuoteWorkspaceSection;
    const html = renderWithProviders(React.createElement(ProjectQuoteWorkspaceSection, { hasActiveProject: false }));
    assert.match(html, /Create or select a Fleet Project/);
  });

  it('renders readiness and an Open Project Quote link when a project is active', () => {
    const { default: ProjectQuoteWorkspaceSection } = modules.projectQuoteWorkspaceSection;
    const html = renderWithProviders(React.createElement(ProjectQuoteWorkspaceSection, {
      hasActiveProject: true, projectName: 'My Project',
      quoteStatus: { level: 'ready', label: 'Ready', reasons: [] },
      requiredEquipmentRemaining: 0, recommendedEquipmentRemaining: 2,
    }));
    assert.match(html, /My Project/);
    assert.match(html, /Ready/);
    assert.match(html, /Open Project Quote/);
  });
});

// ---------------------------------------------------------------------------
// ProjectQuotePage — empty state and full connected composition
// ---------------------------------------------------------------------------
describe('ProjectQuotePageView', () => {
  it('renders a no-active-project message when hasActiveProject is false', () => {
    const { ProjectQuotePageView } = modules.projectQuotePage;
    const html = renderWithProviders(React.createElement(ProjectQuotePageView, { hasActiveProject: false }));
    assert.match(html, /project-quote-no-project/);
    assert.match(html, /No active Fleet Project\./);
  });
});

describe('ProjectQuotePage (connected)', () => {
  it('renders the full page against a fresh (bootstrap-default-project) fleet workspace', () => withLocalStorage({}, () => {
    const { default: ProjectQuotePage } = modules.projectQuotePage;
    const html = renderWithProviders(React.createElement(ProjectQuotePage), ['/project-quote']);
    assert.match(html, /Project Quote/);
    assert.match(html, /project-quote-summary-card|No fleet builds in this project yet\./);
  }));

  it('renders vehicle summary cards, quote items, and totals for a seeded project with fleet builds', () => withLocalStorage({
    tfr_fleet_projects: { projects: [makeProject()], activeProjectId: 'proj-1' },
    tfr_fleet_builds: {
      builds: [withSelection(makeBuild({ quantity: 18 }), 'siren', 'siren-1', 'Wail Siren')],
      activeBuildIdByProject: { 'proj-1': 'build-1' },
    },
  }, () => {
    const { default: ProjectQuotePage } = modules.projectQuotePage;
    const html = renderWithProviders(React.createElement(ProjectQuotePage), ['/project-quote']);
    assert.match(html, /Explorer Patrol x18/);
    assert.match(html, /Wail Siren/);
    assert.match(html, /Project Totals/);
  }));
});

// ---------------------------------------------------------------------------
// Guided Upfit Builder integration — "Generate Project Quote" button
// ---------------------------------------------------------------------------
describe('UpfitBuilderReviewStep — Generate Project Quote button', () => {
  const checklist = { overallPercent: 100, missingRequired: [], missingRecommended: [], skippedOptional: [] };

  it('is hidden by default (showGenerateProjectQuote defaults to false)', () => {
    const { default: UpfitBuilderReviewStep } = modules.upfitBuilderReviewStep;
    const html = renderWithProviders(React.createElement(UpfitBuilderReviewStep, { build: makeBuild(), checklist, onGoToStep: () => {}, quoteRecipientEmail: 'quotes@example.com' }));
    assert.doesNotMatch(html, /upfit-builder-generate-project-quote/);
  });

  it('renders when showGenerateProjectQuote is true', () => {
    const { default: UpfitBuilderReviewStep } = modules.upfitBuilderReviewStep;
    const html = renderWithProviders(React.createElement(UpfitBuilderReviewStep, { build: makeBuild(), checklist, onGoToStep: () => {}, quoteRecipientEmail: 'quotes@example.com', showGenerateProjectQuote: true }));
    assert.match(html, /upfit-builder-generate-project-quote/);
    assert.match(html, /Generate Project Quote/);
  });
});

describe('GuidedUpfitBuilderPage.jsx — source wiring', () => {
  it('computes project quote readiness and threads showGenerateProjectQuote through to the view', () => {
    const source = readFileSync(new URL('../src/pages/GuidedUpfitBuilderPage.jsx', import.meta.url), 'utf8');
    assert.match(source, /buildFleetQuoteEntries/);
    assert.match(source, /meetsProjectQuoteReadinessThreshold/);
    assert.match(source, /showGenerateProjectQuote/);
  });
});

// ---------------------------------------------------------------------------
// Product Detail integration — Included In Quote / Not Yet Included
// ---------------------------------------------------------------------------
describe('FinishYourUpfitPanelView — quote inclusion status', () => {
  const baseProps = {
    builds: [makeBuild()],
    activeBuild: makeBuild(),
    product: makeProduct({ id: 'product-1' }),
    activeProject: makeProject(),
  };

  it('shows "Not Yet Included" with an Add to Quote action when the product is absent', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      ...baseProps,
      quoteInclusion: { included: false, buildId: null, buildName: null, categoryId: null },
      onAddToActiveBuild: () => {},
      onOpenFleetBuilds: () => {},
    }));
    assert.match(html, /Not Yet Included/);
    assert.match(html, /Add to Quote/);
  });

  it('shows "Included In Quote" with a Remove from Quote action when the product is present', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      ...baseProps,
      quoteInclusion: { included: true, buildId: 'build-1', buildName: 'Build 1', categoryId: 'siren' },
      onAddToActiveBuild: () => {},
      onOpenFleetBuilds: () => {},
    }));
    assert.match(html, /Included In Quote/);
    assert.match(html, /Remove from Quote/);
  });

  it('renders nothing extra when there is no active Fleet Project', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      ...baseProps,
      activeProject: null,
      quoteInclusion: { included: false, buildId: null, buildName: null, categoryId: null },
      onAddToActiveBuild: () => {},
      onOpenFleetBuilds: () => {},
    }));
    assert.doesNotMatch(html, /finish-your-upfit-quote-inclusion/);
  });
});

describe('FinishYourUpfitPanel.jsx — source wiring', () => {
  it('imports resolveProductQuoteInclusion and wires removeProductFromBuild', () => {
    const source = readFileSync(new URL('../src/components/fleetBuilds/FinishYourUpfitPanel.jsx', import.meta.url), 'utf8');
    assert.match(source, /resolveProductQuoteInclusion/);
    assert.match(source, /removeProductFromBuild/);
  });
});

// ---------------------------------------------------------------------------
// Workspace integration — source-level wiring checks
// ---------------------------------------------------------------------------
describe('WorkspaceDashboard.jsx — source wiring', () => {
  it('composes ProjectQuoteWorkspaceSection', () => {
    const source = readFileSync(new URL('../src/pages/WorkspaceDashboard.jsx', import.meta.url), 'utf8');
    assert.match(source, /ProjectQuoteWorkspaceSection/);
    assert.match(source, /buildFleetQuoteEntries/);
  });
});

// ---------------------------------------------------------------------------
// Route wiring
// ---------------------------------------------------------------------------
describe('App.jsx — /project-quote route', () => {
  it('mounts ProjectQuotePage at /project-quote', () => {
    const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
    assert.match(source, /import ProjectQuotePage from '@\/pages\/ProjectQuotePage';/);
    assert.match(source, /path="\/project-quote" element=\{<ProjectQuotePage \/>\}/);
  });
});
