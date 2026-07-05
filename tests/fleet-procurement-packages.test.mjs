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
    procurementDomain: await server.ssrLoadModule('/src/domain/procurementPackages/index.ts'),
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
    procurementPage: await server.ssrLoadModule('/src/pages/ProcurementPage.jsx'),
    packageReadinessBadge: await server.ssrLoadModule('/src/components/procurementPackages/PackageReadinessBadge.jsx'),
    packageSummaryCard: await server.ssrLoadModule('/src/components/procurementPackages/PackageSummaryCard.jsx'),
    packageContentsPanel: await server.ssrLoadModule('/src/components/procurementPackages/PackageContentsPanel.jsx'),
    procurementPackagesSummaryBar: await server.ssrLoadModule('/src/components/procurementPackages/ProcurementPackagesSummaryBar.jsx'),
    packageComparisonSection: await server.ssrLoadModule('/src/components/procurementPackages/PackageComparisonSection.jsx'),
    procurementExportPreviewSection: await server.ssrLoadModule('/src/components/procurementPackages/ProcurementExportPreviewSection.jsx'),
    procurementPackagesWorkspaceSection: await server.ssrLoadModule('/src/components/procurementPackages/ProcurementPackagesWorkspaceSection.jsx'),
    finishYourUpfitPanel: await server.ssrLoadModule('/src/components/fleetBuilds/FinishYourUpfitPanel.jsx'),
    projectQuotePage: await server.ssrLoadModule('/src/pages/ProjectQuotePage.jsx'),
  };
});

after(async () => {
  await server?.close();
});

function stripHtmlComments(html) {
  return html.replace(/<!--\s*-->/g, '');
}

function renderPure(element) {
  return stripHtmlComments(renderToString(element));
}

// Full provider stack mirroring src/App.jsx's nesting (see tests/fleet-quote-builder.test.mjs).
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
    id: 'standard-1', key: 'patrol', name: 'Patrol', description: 'A patrol standard.',
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

function makeEntry(build, standard, upfitBuilderDomain) {
  return { build, standard, checklist: upfitBuilderDomain.buildGuidedUpfitChecklist(build, standard, []) };
}

// ---------------------------------------------------------------------------
// groupFleetQuoteEntriesIntoPackages
// ---------------------------------------------------------------------------
describe('groupFleetQuoteEntriesIntoPackages', () => {
  it('groups builds sharing the same effective standard id into one package', () => {
    const { groupFleetQuoteEntriesIntoPackages } = modules.procurementDomain;
    const standard = makeStandard({ name: 'Patrol' });
    const entries = [
      makeEntry(makeBuild({ id: 'a' }), standard, modules.upfitBuilderDomain),
      makeEntry(makeBuild({ id: 'b' }), standard, modules.upfitBuilderDomain),
    ];
    const groups = groupFleetQuoteEntriesIntoPackages(entries);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].id, 'standard-1');
    assert.equal(groups[0].name, 'Patrol');
    assert.equal(groups[0].entries.length, 2);
  });

  it('buckets builds with no effective standard into one "unassigned" package', () => {
    const { groupFleetQuoteEntriesIntoPackages, UNASSIGNED_PACKAGE_ID, UNASSIGNED_PACKAGE_NAME } = modules.procurementDomain;
    const entries = [
      makeEntry(makeBuild({ id: 'a' }), null, modules.upfitBuilderDomain),
      makeEntry(makeBuild({ id: 'b' }), null, modules.upfitBuilderDomain),
    ];
    const groups = groupFleetQuoteEntriesIntoPackages(entries);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].id, UNASSIGNED_PACKAGE_ID);
    assert.equal(groups[0].name, UNASSIGNED_PACKAGE_NAME);
  });

  it('sorts named packages alphabetically with Unassigned always last', () => {
    const { groupFleetQuoteEntriesIntoPackages } = modules.procurementDomain;
    const swat = makeStandard({ id: 'std-swat', name: 'SWAT' });
    const k9 = makeStandard({ id: 'std-k9', name: 'K9' });
    const entries = [
      makeEntry(makeBuild({ id: 'a' }), swat, modules.upfitBuilderDomain),
      makeEntry(makeBuild({ id: 'b' }), null, modules.upfitBuilderDomain),
      makeEntry(makeBuild({ id: 'c' }), k9, modules.upfitBuilderDomain),
    ];
    const groups = groupFleetQuoteEntriesIntoPackages(entries);
    assert.deepEqual(groups.map((group) => group.name), ['K9', 'SWAT', 'Unassigned Vehicles']);
  });

  it('treats two distinct standards with the same display name as two different packages', () => {
    const { groupFleetQuoteEntriesIntoPackages } = modules.procurementDomain;
    const standardA = makeStandard({ id: 'std-a', name: 'Patrol' });
    const standardB = makeStandard({ id: 'std-b', name: 'Patrol' });
    const entries = [
      makeEntry(makeBuild({ id: 'a' }), standardA, modules.upfitBuilderDomain),
      makeEntry(makeBuild({ id: 'b' }), standardB, modules.upfitBuilderDomain),
    ];
    const groups = groupFleetQuoteEntriesIntoPackages(entries);
    assert.equal(groups.length, 2);
  });
});

// ---------------------------------------------------------------------------
// detectDuplicateConfigurations
// ---------------------------------------------------------------------------
describe('detectDuplicateConfigurations', () => {
  it('flags two builds sharing the same vehicle spec and build style', () => {
    const { detectDuplicateConfigurations } = modules.procurementDomain;
    const buildA = makeBuild({ id: 'a', name: 'Build A' });
    const buildB = makeBuild({ id: 'b', name: 'Build B' });
    const groups = detectDuplicateConfigurations([buildA, buildB]);
    assert.equal(groups.length, 1);
    assert.deepEqual(groups[0].buildIds.sort(), ['a', 'b']);
  });

  it('does not flag builds with the same vehicle but a different build style', () => {
    const { detectDuplicateConfigurations } = modules.procurementDomain;
    const buildA = makeBuild({ id: 'a', buildStyle: 'patrol' });
    const buildB = makeBuild({ id: 'b', buildStyle: 'supervisor' });
    assert.deepEqual(detectDuplicateConfigurations([buildA, buildB]), []);
  });

  it('excludes builds with no vehicle assigned from duplicate detection', () => {
    const { detectDuplicateConfigurations } = modules.procurementDomain;
    const buildA = makeBuild({ id: 'a', vehicle: null });
    const buildB = makeBuild({ id: 'b', vehicle: null });
    assert.deepEqual(detectDuplicateConfigurations([buildA, buildB]), []);
  });

  it('returns nothing for a single build', () => {
    const { detectDuplicateConfigurations } = modules.procurementDomain;
    assert.deepEqual(detectDuplicateConfigurations([makeBuild()]), []);
  });
});

// ---------------------------------------------------------------------------
// resolvePackageReadiness
// ---------------------------------------------------------------------------
describe('resolvePackageReadiness', () => {
  it('is "blocked" for an empty package', () => {
    const { resolvePackageReadiness } = modules.procurementDomain;
    const readiness = resolvePackageReadiness([]);
    assert.equal(readiness.level, 'blocked');
  });

  it('is "blocked" when required equipment is missing', () => {
    const { resolvePackageReadiness } = modules.procurementDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const entries = [makeEntry(makeBuild(), standard, modules.upfitBuilderDomain)];
    const readiness = resolvePackageReadiness(entries);
    assert.equal(readiness.level, 'blocked');
    assert.ok(readiness.reasons.some((reason) => /required equipment/.test(reason)));
  });

  it('is "blocked" when a build is missing a vehicle assignment', () => {
    const { resolvePackageReadiness } = modules.procurementDomain;
    const build = makeBuild({ vehicle: null });
    const readiness = resolvePackageReadiness([makeEntry(build, null, modules.upfitBuilderDomain)]);
    assert.equal(readiness.level, 'blocked');
    assert.ok(readiness.reasons.some((reason) => /missing a vehicle assignment/.test(reason)));
  });

  it('is "needs_review" when a duplicate configuration is detected but equipment is otherwise complete', () => {
    const { resolvePackageReadiness, detectDuplicateConfigurations } = modules.procurementDomain;
    const buildA = makeBuild({ id: 'a' });
    const buildB = makeBuild({ id: 'b' });
    const duplicates = detectDuplicateConfigurations([buildA, buildB]);
    const entries = [makeEntry(buildA, null, modules.upfitBuilderDomain), makeEntry(buildB, null, modules.upfitBuilderDomain)];
    const readiness = resolvePackageReadiness(entries, duplicates);
    assert.equal(readiness.level, 'needs_review');
    assert.ok(readiness.reasons.some((reason) => /duplicate vehicle configuration/.test(reason)));
  });

  it('is "needs_review" when no Department Standard is assigned to the package', () => {
    const { resolvePackageReadiness } = modules.procurementDomain;
    const readiness = resolvePackageReadiness([makeEntry(makeBuild(), null, modules.upfitBuilderDomain)]);
    assert.equal(readiness.level, 'needs_review');
    assert.ok(readiness.reasons.some((reason) => /No Department Standard/.test(reason)));
  });

  it('is "minor_issues" when required equipment is complete but recommended equipment is missing', () => {
    const { resolvePackageReadiness } = modules.procurementDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: ['console'], optional: [] } });
    const build = withSelection(makeBuild(), 'siren', 'siren-1');
    const readiness = resolvePackageReadiness([makeEntry(build, standard, modules.upfitBuilderDomain)]);
    assert.equal(readiness.level, 'minor_issues');
  });

  it('is "ready" when every build has a vehicle, a standard, and full required/recommended completion, with no duplicates', () => {
    const { resolvePackageReadiness } = modules.procurementDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: ['console'], optional: [] } });
    let build = withSelection(makeBuild(), 'siren', 'siren-1');
    build = withSelection(build, 'console', 'console-1');
    const readiness = resolvePackageReadiness([makeEntry(build, standard, modules.upfitBuilderDomain)]);
    assert.equal(readiness.level, 'ready');
    assert.deepEqual(readiness.reasons, []);
  });
});

// ---------------------------------------------------------------------------
// aggregatePackageSummary / buildProcurementPackages
// ---------------------------------------------------------------------------
describe('aggregatePackageSummary', () => {
  it('composes vehicle count, equipment count, completion, readiness, missing equipment, and recommended additions', () => {
    const { aggregatePackageSummary, groupFleetQuoteEntriesIntoPackages } = modules.procurementDomain;
    const standard = makeStandard({ name: 'Patrol', categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = withSelection(makeBuild({ quantity: 10 }), 'siren', 'siren-1');
    const [group] = groupFleetQuoteEntriesIntoPackages([makeEntry(build, standard, modules.upfitBuilderDomain)]);

    const pkg = aggregatePackageSummary(group, { products: [], getProduct: () => null });

    assert.equal(pkg.name, 'Patrol');
    assert.equal(pkg.departmentLabel, 'Patrol');
    assert.equal(pkg.vehicleCount, 10);
    assert.equal(pkg.equipmentCount, 1);
    assert.equal(pkg.completionPercent, 100);
    assert.equal(pkg.readiness.level, 'ready');
    assert.deepEqual(pkg.buildIds, ['build-1']);
    assert.deepEqual(pkg.duplicateConfigurations, []);
  });

  it('caps recommended additions and de-duplicates by product id across builds in the package', () => {
    const { aggregatePackageSummary, groupFleetQuoteEntriesIntoPackages } = modules.procurementDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const sirenProduct = makeProduct({ id: 'siren-2', title: 'Wail Siren 200W' });
    const buildA = makeBuild({ id: 'a' });
    const buildB = makeBuild({ id: 'b' });
    const [group] = groupFleetQuoteEntriesIntoPackages([
      makeEntry(buildA, standard, modules.upfitBuilderDomain),
      makeEntry(buildB, standard, modules.upfitBuilderDomain),
    ]);
    const deps = { products: [sirenProduct], getProduct: (id) => (id === sirenProduct.id ? sirenProduct : null) };
    const pkg = aggregatePackageSummary(group, deps);
    assert.equal(pkg.recommendedAdditions.length, 1);
    assert.equal(pkg.recommendedAdditions[0].product.id, 'siren-2');
  });
});

describe('buildProcurementPackages', () => {
  it('groups and aggregates in one call', () => {
    const { buildProcurementPackages } = modules.procurementDomain;
    const standard = makeStandard({ name: 'K9' });
    const entries = [makeEntry(makeBuild(), standard, modules.upfitBuilderDomain)];
    const packages = buildProcurementPackages(entries, { products: [], getProduct: () => null });
    assert.equal(packages.length, 1);
    assert.equal(packages[0].name, 'K9');
  });

  it('returns an empty array for an empty project', () => {
    const { buildProcurementPackages } = modules.procurementDomain;
    assert.deepEqual(buildProcurementPackages([], { products: [], getProduct: () => null }), []);
  });
});

// ---------------------------------------------------------------------------
// buildPackageContents
// ---------------------------------------------------------------------------
describe('buildPackageContents', () => {
  it('lists vehicle types, grouped products, and tiered equipment with per-category status', () => {
    const { groupFleetQuoteEntriesIntoPackages, buildPackageContents } = modules.procurementDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: ['console'], optional: [] } });
    const buildA = withSelection(makeBuild({ id: 'a', name: 'Build A', quantity: 5 }), 'siren', 'siren-1', 'Wail Siren');
    const buildB = makeBuild({ id: 'b', name: 'Build B', quantity: 3 });
    const [group] = groupFleetQuoteEntriesIntoPackages([
      makeEntry(buildA, standard, modules.upfitBuilderDomain),
      makeEntry(buildB, standard, modules.upfitBuilderDomain),
    ]);

    const contents = buildPackageContents(group);

    assert.equal(contents.vehicleTypes.length, 2);
    assert.equal(contents.products.length, 1);
    assert.equal(contents.products[0].label, 'Wail Siren');

    const required = contents.requiredEquipment.find((entry) => entry.categoryId === 'siren');
    assert.equal(required.status, 'partial');
    assert.deepEqual(required.equippedBuildIds, ['a']);

    const recommended = contents.recommendedEquipment.find((entry) => entry.categoryId === 'console');
    assert.equal(recommended.status, 'missing');
  });

  it('reports "complete" when every build in the package has the category filled', () => {
    const { groupFleetQuoteEntriesIntoPackages, buildPackageContents } = modules.procurementDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const buildA = withSelection(makeBuild({ id: 'a' }), 'siren', 'siren-1');
    const buildB = withSelection(makeBuild({ id: 'b' }), 'siren', 'siren-2');
    const [group] = groupFleetQuoteEntriesIntoPackages([
      makeEntry(buildA, standard, modules.upfitBuilderDomain),
      makeEntry(buildB, standard, modules.upfitBuilderDomain),
    ]);
    const required = buildPackageContents(group).requiredEquipment.find((entry) => entry.categoryId === 'siren');
    assert.equal(required.status, 'complete');
    assert.deepEqual(required.equippedBuildIds.sort(), ['a', 'b']);
  });
});

// ---------------------------------------------------------------------------
// summarizeProcurementPackages
// ---------------------------------------------------------------------------
describe('summarizeProcurementPackages', () => {
  it('counts packages by readiness level', () => {
    const { summarizeProcurementPackages } = modules.procurementDomain;
    const packages = [
      { readiness: { level: 'ready' } },
      { readiness: { level: 'ready' } },
      { readiness: { level: 'minor_issues' } },
      { readiness: { level: 'needs_review' } },
      { readiness: { level: 'blocked' } },
    ];
    assert.deepEqual(summarizeProcurementPackages(packages), {
      packageCount: 5, readyCount: 2, minorIssuesCount: 1, needsReviewCount: 1, blockedCount: 1,
    });
  });

  it('returns all-zero counts for no packages', () => {
    const { summarizeProcurementPackages } = modules.procurementDomain;
    assert.deepEqual(summarizeProcurementPackages([]), {
      packageCount: 0, readyCount: 0, minorIssuesCount: 0, needsReviewCount: 0, blockedCount: 0,
    });
  });
});

// ---------------------------------------------------------------------------
// selectPackagesForComparison
// ---------------------------------------------------------------------------
describe('selectPackagesForComparison', () => {
  it('returns packages in the source order for selected ids and drops missing ids', () => {
    const { selectPackagesForComparison } = modules.procurementDomain;
    const packages = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    assert.deepEqual(selectPackagesForComparison(packages, ['c', 'a', 'gone']), [{ id: 'a' }, { id: 'c' }]);
  });

  it('returns an empty array with no selection', () => {
    const { selectPackagesForComparison } = modules.procurementDomain;
    assert.deepEqual(selectPackagesForComparison([{ id: 'a' }], []), []);
  });
});

// ---------------------------------------------------------------------------
// buildProcurementExportPreview
// ---------------------------------------------------------------------------
describe('buildProcurementExportPreview', () => {
  it('remaps buildExportPreview fields to the procurement vocabulary and reuses its recommendation de-duplication', () => {
    const { buildProcurementExportPreview } = modules.procurementDomain;
    const sharedProduct = makeProduct({ id: 'shared-1' });
    const recommendation = { productId: 'shared-1', score: 10, reasonCodes: [], reasons: [], matchingCategoryId: null, matchingDepartmentStandardId: null, matchingBuildStyleId: null, compatibilityStatus: 'unknown', recommendationType: 'recommended', rank: 1 };

    const preview = buildProcurementExportPreview({
      departmentLabel: 'Patrol',
      packageName: 'Patrol Package',
      vehicleSummaries: [
        { buildId: 'b1', recommendedAdditions: [{ recommendation, product: sharedProduct }] },
        { buildId: 'b2', recommendedAdditions: [{ recommendation, product: sharedProduct }] },
      ],
      equipment: [],
      missingEquipment: { critical: [], recommended: [], optional: [], byVehicle: {}, byDepartmentStandard: {}, byCategory: {} },
      procurementNotes: 'Ship by Q3.',
      generatedAt: 555,
    });

    assert.equal(preview.departmentLabel, 'Patrol');
    assert.equal(preview.packageName, 'Patrol Package');
    assert.equal(preview.recommendations.length, 1);
    assert.equal(preview.procurementNotes, 'Ship by Q3.');
    assert.equal(preview.generatedAt, 555);
  });

  it('defaults procurementNotes to an empty string when omitted', () => {
    const { buildProcurementExportPreview } = modules.procurementDomain;
    const preview = buildProcurementExportPreview({
      departmentLabel: 'Not Assigned', packageName: 'Empty Package', vehicleSummaries: [], equipment: [],
      missingEquipment: { critical: [], recommended: [], optional: [], byVehicle: {}, byDepartmentStandard: {}, byCategory: {} },
      generatedAt: 1,
    });
    assert.equal(preview.procurementNotes, '');
  });
});

// ---------------------------------------------------------------------------
// resolveProductPackageInclusion — Product Detail integration
// ---------------------------------------------------------------------------
describe('resolveProductPackageInclusion', () => {
  it('reports included=true with the owning build/category and package name', () => {
    const { resolveProductPackageInclusion } = modules.procurementDomain;
    const standard = makeStandard({ id: 'standard-1', name: 'Patrol' });
    const build = withSelection(makeBuild({ name: 'Build A', departmentStandardId: 'standard-1' }), 'siren', 'siren-1');
    const inclusion = resolveProductPackageInclusion([build], 'siren-1', makeProject(), [standard]);
    assert.deepEqual(inclusion, {
      included: true, buildId: 'build-1', buildName: 'Build A', categoryId: 'siren',
      packageId: 'standard-1', packageName: 'Patrol',
    });
  });

  it('resolves the "Unassigned Vehicles" package when the owning build has no effective standard', () => {
    const { resolveProductPackageInclusion, UNASSIGNED_PACKAGE_ID, UNASSIGNED_PACKAGE_NAME } = modules.procurementDomain;
    const build = withSelection(makeBuild(), 'siren', 'siren-1');
    const inclusion = resolveProductPackageInclusion([build], 'siren-1', makeProject(), []);
    assert.equal(inclusion.included, true);
    assert.equal(inclusion.packageId, UNASSIGNED_PACKAGE_ID);
    assert.equal(inclusion.packageName, UNASSIGNED_PACKAGE_NAME);
  });

  it('reports included=false with null package fields when the product is not selected anywhere', () => {
    const { resolveProductPackageInclusion } = modules.procurementDomain;
    const inclusion = resolveProductPackageInclusion([makeBuild()], 'not-selected', makeProject(), []);
    assert.deepEqual(inclusion, { included: false, buildId: null, buildName: null, categoryId: null, packageId: null, packageName: null });
  });
});

// ---------------------------------------------------------------------------
// Large fleets — the pipeline scales without throwing and totals stay correct
// ---------------------------------------------------------------------------
describe('large fleets', () => {
  it('groups a 25-build project (MAX_FLEET_BUILDS) into packages without error, with correct rollups', () => {
    const { buildProcurementPackages, summarizeProcurementPackages } = modules.procurementDomain;
    const patrolStandard = makeStandard({ id: 'std-patrol', name: 'Patrol', categories: { required: ['siren'], recommended: [], optional: [] } });
    const swatStandard = makeStandard({ id: 'std-swat', name: 'SWAT', categories: { required: ['push_bumper'], recommended: [], optional: [] } });

    // Vehicle year varies per build so 20 distinct Fleet Builds don't
    // collide as "duplicate configurations" (see detectDuplicateConfigurations)
    // — this test is about pipeline scale/correctness, not duplicate detection.
    const patrolEntries = Array.from({ length: 20 }, (_, index) => makeEntry(
      withSelection(makeBuild({ id: `patrol-${index}`, name: `Patrol ${index}`, quantity: 2, vehicle: { year: String(2000 + index), make: 'Ford', model: 'Explorer' } }), 'siren', 'shared-siren', 'Shared Siren'),
      patrolStandard,
      modules.upfitBuilderDomain,
    ));
    const swatEntries = Array.from({ length: 5 }, (_, index) => makeEntry(
      withSelection(makeBuild({ id: `swat-${index}`, name: `SWAT ${index}`, quantity: 1, vehicle: { year: String(2010 + index), make: 'Ford', model: 'Explorer' } }), 'push_bumper', `bumper-${index}`, 'Push Bumper'),
      swatStandard,
      modules.upfitBuilderDomain,
    ));

    const packages = buildProcurementPackages([...patrolEntries, ...swatEntries], { products: [], getProduct: () => null });
    const summary = summarizeProcurementPackages(packages);

    assert.equal(packages.length, 2);
    const patrolPackage = packages.find((pkg) => pkg.name === 'Patrol');
    assert.equal(patrolPackage.vehicleCount, 40);
    assert.equal(patrolPackage.equipmentCount, 1);
    assert.equal(patrolPackage.readiness.level, 'ready');
    assert.equal(summary.packageCount, 2);
    assert.equal(summary.readyCount, 2);
  });
});

// ---------------------------------------------------------------------------
// Empty states
// ---------------------------------------------------------------------------
describe('empty states', () => {
  it('produces no packages for an empty entries list', () => {
    const { buildProcurementPackages, summarizeProcurementPackages } = modules.procurementDomain;
    const packages = buildProcurementPackages([], { products: [], getProduct: () => null });
    assert.deepEqual(packages, []);
    assert.deepEqual(summarizeProcurementPackages(packages).packageCount, 0);
  });
});

// ---------------------------------------------------------------------------
// Component rendering — fixture-driven
// ---------------------------------------------------------------------------
describe('PackageReadinessBadge', () => {
  it('renders each readiness level label', () => {
    const { default: PackageReadinessBadge } = modules.packageReadinessBadge;
    ['ready', 'minor_issues', 'needs_review', 'blocked'].forEach((level) => {
      const html = renderPure(React.createElement(PackageReadinessBadge, {
        readiness: { level, label: level, reasons: [] }, compact: true, showReasons: false,
      }));
      assert.match(html, new RegExp(level));
    });
  });
});

function makePackageFixture(overrides = {}) {
  return {
    id: 'standard-1', name: 'Patrol', departmentLabel: 'Patrol', buildIds: ['build-1'],
    vehicleCount: 10, equipmentCount: 2, completionPercent: 80,
    readiness: { level: 'minor_issues', label: 'Minor Issues', reasons: ['1 recommended equipment item missing across this package.'] },
    missingEquipment: { critical: [], recommended: [{ buildId: 'build-1' }], optional: [], byVehicle: {}, byDepartmentStandard: {}, byCategory: {} },
    recommendedAdditions: [], duplicateConfigurations: [], ...overrides,
  };
}

function makeContentsFixture(overrides = {}) {
  return {
    vehicleTypes: [{ buildId: 'build-1', buildName: 'Build 1', vehicleLabel: '2024 Ford Explorer', buildStyleLabel: 'Patrol', quantity: 10 }],
    products: [{ productId: 'p1', label: 'Wail Siren', categoryId: 'siren', categoryLabel: 'Siren', quantity: 10, vehicleCount: 1, buildIds: ['build-1'] }],
    requiredEquipment: [{ categoryId: 'siren', categoryLabel: 'Siren', tier: 'required', status: 'complete', equippedBuildIds: ['build-1'] }],
    recommendedEquipment: [{ categoryId: 'console', categoryLabel: 'Console', tier: 'recommended', status: 'missing', equippedBuildIds: [] }],
    optionalEquipment: [],
    ...overrides,
  };
}

describe('PackageContentsPanel', () => {
  it('renders vehicle types, products, and tiered equipment with status chips', () => {
    const { default: PackageContentsPanel } = modules.packageContentsPanel;
    const html = renderPure(React.createElement(PackageContentsPanel, { contents: makeContentsFixture() }));
    assert.match(html, /Vehicle Types \(1\)/);
    assert.match(html, /Wail Siren/);
    assert.match(html, /Console/);
    assert.match(html, /Complete/);
    assert.match(html, /Missing/);
  });
});

describe('PackageSummaryCard', () => {
  it('renders collapsed with core stats and does not render Package Contents', () => {
    const { default: PackageSummaryCard } = modules.packageSummaryCard;
    const html = renderPure(React.createElement(PackageSummaryCard, {
      pkg: makePackageFixture(), contents: makeContentsFixture(), expanded: false, onToggleExpand: () => {},
      selected: false, onToggleSelected: () => {}, notes: '', onChangeNotes: () => {},
    }));
    assert.match(html, /Patrol/);
    assert.match(html, /Minor Issues/);
    assert.doesNotMatch(html, /package-contents-panel/);
  });

  it('renders Package Contents and the export preview toggle when expanded', () => {
    const { default: PackageSummaryCard } = modules.packageSummaryCard;
    const html = renderPure(React.createElement(PackageSummaryCard, {
      pkg: makePackageFixture(), contents: makeContentsFixture(), expanded: true, onToggleExpand: () => {},
      selected: true, onToggleSelected: () => {},
      exportPreview: { departmentLabel: 'Patrol', packageName: 'Patrol', vehicleSummaries: [], equipment: [], missingEquipment: { critical: [], recommended: [], optional: [] }, recommendations: [], procurementNotes: '', generatedAt: 1 },
      notes: '', onChangeNotes: () => {},
    }));
    assert.match(html, /package-contents-panel/);
    assert.match(html, /Show Export Preview/);
  });
});

describe('ProcurementPackagesSummaryBar', () => {
  it('renders the package count and readiness breakdown', () => {
    const { default: ProcurementPackagesSummaryBar } = modules.procurementPackagesSummaryBar;
    const html = renderPure(React.createElement(ProcurementPackagesSummaryBar, {
      summary: { packageCount: 4, readyCount: 1, minorIssuesCount: 1, needsReviewCount: 1, blockedCount: 1 },
    }));
    assert.match(html, /Package Count/);
    assert.match(html, />4</);
  });
});

describe('PackageComparisonSection', () => {
  it('prompts to select packages when none are selected', () => {
    const { default: PackageComparisonSection } = modules.packageComparisonSection;
    const html = renderPure(React.createElement(PackageComparisonSection, { packages: [], maxComparisonPackages: 4 }));
    assert.match(html, /Select two or more packages/);
  });

  it('renders a comparison table for selected packages', () => {
    const { default: PackageComparisonSection } = modules.packageComparisonSection;
    const html = renderPure(React.createElement(PackageComparisonSection, {
      packages: [makePackageFixture({ id: 'a', name: 'Patrol' }), makePackageFixture({ id: 'b', name: 'SWAT' })],
      maxComparisonPackages: 4,
    }));
    assert.match(html, /package-comparison-table/);
    assert.match(html, /Patrol/);
    assert.match(html, /SWAT/);
  });
});

describe('ProcurementExportPreviewSection', () => {
  it('is collapsed by default with a toggle button present', () => {
    const { default: ProcurementExportPreviewSection } = modules.procurementExportPreviewSection;
    const html = renderPure(React.createElement(ProcurementExportPreviewSection, {
      preview: { departmentLabel: 'Patrol', packageName: 'Patrol', vehicleSummaries: [], equipment: [], missingEquipment: { critical: [], recommended: [], optional: [] }, recommendations: [], procurementNotes: '', generatedAt: 1 },
      notes: '', onChangeNotes: () => {},
    }));
    assert.match(html, /Show Export Preview/);
    assert.doesNotMatch(html, /procurement-export-preview-document/);
  });
});

describe('ProcurementPackagesWorkspaceSection', () => {
  it('renders a prompt to create a project when none is active', () => {
    const { default: ProcurementPackagesWorkspaceSection } = modules.procurementPackagesWorkspaceSection;
    const html = renderWithProviders(React.createElement(ProcurementPackagesWorkspaceSection, { hasActiveProject: false }));
    assert.match(html, /Create or select a Fleet Project/);
  });

  it('renders package/ready/blocked counts and an Open Procurement Workspace link when a project is active', () => {
    const { default: ProcurementPackagesWorkspaceSection } = modules.procurementPackagesWorkspaceSection;
    const html = renderWithProviders(React.createElement(ProcurementPackagesWorkspaceSection, {
      hasActiveProject: true,
      summary: { packageCount: 3, readyCount: 2, minorIssuesCount: 0, needsReviewCount: 0, blockedCount: 1 },
    }));
    assert.match(html, /3/);
    assert.match(html, /Open Procurement Workspace/);
  });
});

// ---------------------------------------------------------------------------
// ProcurementPage — empty state and full connected composition
// ---------------------------------------------------------------------------
describe('ProcurementPageView', () => {
  it('renders a no-active-project message when hasActiveProject is false', () => {
    const { ProcurementPageView } = modules.procurementPage;
    const html = renderWithProviders(React.createElement(ProcurementPageView, { hasActiveProject: false }));
    assert.match(html, /procurement-no-project/);
    assert.match(html, /No active Fleet Project\./);
  });

  it('renders a no-packages message when the active project has no fleet builds', () => {
    const { ProcurementPageView } = modules.procurementPage;
    const html = renderWithProviders(React.createElement(ProcurementPageView, {
      hasActiveProject: true, packages: [], summary: { packageCount: 0, readyCount: 0, minorIssuesCount: 0, needsReviewCount: 0, blockedCount: 0 },
    }));
    assert.match(html, /procurement-no-packages/);
  });

  it('renders package cards and the comparison section when packages exist', () => {
    const { ProcurementPageView } = modules.procurementPage;
    const pkg = makePackageFixture();
    const html = renderWithProviders(React.createElement(ProcurementPageView, {
      hasActiveProject: true,
      packages: [pkg],
      contentsByPackageId: { [pkg.id]: makeContentsFixture() },
      summary: { packageCount: 1, readyCount: 0, minorIssuesCount: 1, needsReviewCount: 0, blockedCount: 0 },
      expandedPackageId: null, onToggleExpand: () => {},
      selectedIds: [], onToggleSelected: () => {},
      comparisonPackages: [], exportPreviews: {}, notesByPackageId: {}, onChangeNotes: () => {},
    }));
    assert.match(html, /package-summary-card/);
    assert.match(html, /package-comparison-section/);
  });
});

describe('ProcurementPage (connected)', () => {
  it('renders the full page against a fresh (bootstrap-default-project) fleet workspace', () => withLocalStorage({}, () => {
    const { default: ProcurementPage } = modules.procurementPage;
    const html = renderWithProviders(React.createElement(ProcurementPage), ['/procurement']);
    assert.match(html, /Procurement Packages/);
    assert.match(html, /procurement-packages-summary-bar|procurement-no-packages/);
  }));

  it('renders a package card for a seeded project with a department-standard-assigned fleet build', () => withLocalStorage({
    tfr_fleet_projects: { projects: [makeProject()], activeProjectId: 'proj-1' },
    tfr_fleet_builds: {
      builds: [withSelection(makeBuild({ quantity: 12, departmentStandardId: 'patrol' }), 'siren', 'siren-1', 'Wail Siren')],
      activeBuildIdByProject: { 'proj-1': 'build-1' },
    },
  }, () => {
    const { default: ProcurementPage } = modules.procurementPage;
    const html = renderWithProviders(React.createElement(ProcurementPage), ['/procurement']);
    assert.match(html, /Patrol/);
    assert.match(html, /package-summary-card/);
  }));
});

// ---------------------------------------------------------------------------
// Project Quote integration — "Generate Procurement Package" button
// ---------------------------------------------------------------------------
describe('ProjectQuotePageView — Generate Procurement Package button', () => {
  it('renders a link to /procurement when a project is active', () => {
    const { ProjectQuotePageView } = modules.projectQuotePage;
    const html = renderWithProviders(React.createElement(ProjectQuotePageView, {
      hasActiveProject: true,
      projectSummary: { projectId: 'proj-1', projectName: 'My Project', departmentLabel: 'Not Assigned', buildCount: 0, vehicleCount: 0, completionPercent: 0, fleetHealthColor: 'red', quoteStatus: { level: 'blocked', label: 'Blocked', reasons: [] }, lastUpdated: null },
      totals: { totalVehicles: 0, totalLineItems: 0, totalEquipmentPieces: 0, completionPercent: 0, requiredEquipmentRemaining: 0, recommendedEquipmentRemaining: 0 },
      missingReport: { critical: [], recommended: [], optional: [], byVehicle: {}, byDepartmentStandard: {}, byCategory: {} },
      exportPreview: { departmentLabel: 'Not Assigned', projectName: 'My Project', vehicleSummaries: [], equipmentSummary: [], missingEquipment: { critical: [], recommended: [], optional: [] }, recommendations: [], quoteNotes: '', generatedAt: 1 },
    }));
    assert.match(html, /generate-procurement-package-link/);
    assert.match(html, /Generate Procurement Package/);
  });

  it('omits the button when no project is active', () => {
    const { ProjectQuotePageView } = modules.projectQuotePage;
    const html = renderWithProviders(React.createElement(ProjectQuotePageView, { hasActiveProject: false }));
    assert.doesNotMatch(html, /generate-procurement-package-link/);
  });
});

describe('ProjectQuotePage.jsx — source wiring', () => {
  it('links to /procurement', () => {
    const source = readFileSync(new URL('../src/pages/ProjectQuotePage.jsx', import.meta.url), 'utf8');
    assert.match(source, /to="\/procurement"/);
  });
});

// ---------------------------------------------------------------------------
// Product Detail integration — Included In Procurement Package / Not Included
// ---------------------------------------------------------------------------
describe('FinishYourUpfitPanelView — package inclusion status', () => {
  const baseProps = {
    builds: [makeBuild()],
    activeBuild: makeBuild(),
    product: makeProduct({ id: 'product-1' }),
    activeProject: makeProject(),
    quoteInclusion: { included: false, buildId: null, buildName: null, categoryId: null },
  };

  it('shows "Not Included" with an Add to Package action when the product is absent', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      ...baseProps,
      packageInclusion: { included: false, buildId: null, buildName: null, categoryId: null, packageId: null, packageName: null },
      onAddToActiveBuild: () => {},
      onOpenFleetBuilds: () => {},
    }));
    assert.match(html, /Not Included/);
    assert.match(html, /Add to Package/);
  });

  it('shows "Included In Procurement Package" with a Remove from Package action when the product is present', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      ...baseProps,
      packageInclusion: { included: true, buildId: 'build-1', buildName: 'Build 1', categoryId: 'siren', packageId: 'patrol', packageName: 'Patrol' },
      onAddToActiveBuild: () => {},
      onOpenFleetBuilds: () => {},
    }));
    assert.match(html, /Included In Procurement Package — Patrol/);
    assert.match(html, /Remove from Package/);
  });

  it('renders nothing extra when there is no active Fleet Project', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      ...baseProps,
      activeProject: null,
      packageInclusion: { included: false, buildId: null, buildName: null, categoryId: null, packageId: null, packageName: null },
      onAddToActiveBuild: () => {},
      onOpenFleetBuilds: () => {},
    }));
    assert.doesNotMatch(html, /finish-your-upfit-package-inclusion/);
  });
});

describe('FinishYourUpfitPanel.jsx — source wiring', () => {
  it('imports resolveProductPackageInclusion and wires removeProductFromBuild for packages', () => {
    const source = readFileSync(new URL('../src/components/fleetBuilds/FinishYourUpfitPanel.jsx', import.meta.url), 'utf8');
    assert.match(source, /resolveProductPackageInclusion/);
    assert.match(source, /handleRemoveFromPackage/);
  });
});

// ---------------------------------------------------------------------------
// Workspace integration — source-level wiring checks
// ---------------------------------------------------------------------------
describe('WorkspaceDashboard.jsx — source wiring', () => {
  it('composes ProcurementPackagesWorkspaceSection', () => {
    const source = readFileSync(new URL('../src/pages/WorkspaceDashboard.jsx', import.meta.url), 'utf8');
    assert.match(source, /ProcurementPackagesWorkspaceSection/);
    assert.match(source, /groupFleetQuoteEntriesIntoPackages/);
  });
});

// ---------------------------------------------------------------------------
// Route wiring
// ---------------------------------------------------------------------------
describe('App.jsx — /procurement route', () => {
  it('mounts ProcurementPage at /procurement', () => {
    const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
    assert.match(source, /import ProcurementPage from '@\/pages\/ProcurementPage';/);
    assert.match(source, /path="\/procurement" element=\{<ProcurementPage \/>\}/);
  });
});
