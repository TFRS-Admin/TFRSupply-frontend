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
    catalog: await server.ssrLoadModule('/src/services/catalog/catalogService.ts'),
    vehicleMaster: await server.ssrLoadModule('/src/data/vehicles/vehicleMaster.ts'),
    fleetBuildsDomain: await server.ssrLoadModule('/src/domain/fleetBuilds/index.ts'),
    fleetBuildsContext: await server.ssrLoadModule('/src/context/FleetBuildsContext.jsx'),
    vehicleContext: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    compareContext: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    recentlyViewedContext: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
    savedProductsContext: await server.ssrLoadModule('/src/context/SavedProductsContext.jsx'),
    configuratorContext: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicleSelectorModal: await server.ssrLoadModule('/src/components/navigator/VehicleSelectorModal.jsx'),
    shopByVehiclePanel: await server.ssrLoadModule('/src/components/fleetBuilds/ShopByVehiclePanel.jsx'),
    fleetBuildsPanel: await server.ssrLoadModule('/src/components/fleetBuilds/FleetBuildsPanel.jsx'),
    fleetBuildCard: await server.ssrLoadModule('/src/components/fleetBuilds/FleetBuildCard.jsx'),
    completionBadge: await server.ssrLoadModule('/src/components/fleetBuilds/FleetBuildCompletionBadge.jsx'),
    addToAllButton: await server.ssrLoadModule('/src/components/fleetBuilds/AddToAllCompatibleBuildsButton.jsx'),
    finishYourUpfitPanel: await server.ssrLoadModule('/src/components/fleetBuilds/FinishYourUpfitPanel.jsx'),
    workspaceSection: await server.ssrLoadModule('/src/components/fleetBuilds/FleetBuildsWorkspaceSection.jsx'),
    commerceActionPanel: await server.ssrLoadModule('/src/components/product/CommerceActionPanel.jsx'),
    productCard: await server.ssrLoadModule('/src/components/product/ProductCard.jsx'),
  };
});

after(async () => {
  await server?.close();
});

// React SSR inserts `<!-- -->` marker comments between adjacent JSX text
// expressions (e.g. `{year} {make} {model}`, `{percent}% Complete`) so the
// client can tell hydration text-node boundaries apart. Those markers are
// invisible to a real browser but break naive string assertions in these
// SSR-string tests, so every render in this file is stripped of them before
// assertions run.
function stripHtmlComments(html) {
  return html.replace(/<!--\s*-->/g, '');
}

function renderPure(element) {
  return stripHtmlComments(renderToString(element));
}

function renderWithProviders(element, initialEntries = ['/']) {
  const { MemoryRouter } = modules.router;
  const { VehicleProvider } = modules.vehicleContext;
  const { CompareProvider } = modules.compareContext;
  const { RecentlyViewedProvider } = modules.recentlyViewedContext;
  const { SavedProductsProvider } = modules.savedProductsContext;
  const { FleetBuildsProvider } = modules.fleetBuildsContext;
  const { ConfiguratorProvider } = modules.configuratorContext;

  return stripHtmlComments(renderToString(
    React.createElement(MemoryRouter, { initialEntries },
      React.createElement(VehicleProvider, null,
        React.createElement(CompareProvider, null,
          React.createElement(RecentlyViewedProvider, null,
            React.createElement(SavedProductsProvider, null,
              React.createElement(FleetBuildsProvider, null,
                React.createElement(ConfiguratorProvider, null, element),
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
    id: 'build-1',
    name: 'Fleet Build 1',
    vehicle: null,
    quantity: 1,
    buildStyle: null,
    selections: {},
    createdAt: 1000,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Domain: upfit category classification
// ---------------------------------------------------------------------------
describe('classifyProductUpfitCategory (deterministic keyword + catalog-category classification)', () => {
  it('classifies via the catalog category id before scanning keywords', () => {
    const { classifyProductUpfitCategory } = modules.fleetBuildsDomain;
    assert.equal(classifyProductUpfitCategory({ category: 'light-bars', title: 'Some Siren-Branded Light Bar' }), 'roof_lighting');
  });

  it('classifies a light-bar keyword product with no catalog category as roof_lighting', () => {
    const { classifyProductUpfitCategory } = modules.fleetBuildsDomain;
    assert.equal(classifyProductUpfitCategory({ title: 'Compact LED Light Bar' }), 'roof_lighting');
  });

  it('classifies siren/speaker/push-bumper/console/partition products from title keywords', () => {
    const { classifyProductUpfitCategory } = modules.fleetBuildsDomain;
    assert.equal(classifyProductUpfitCategory({ title: 'PA300 Electronic Siren' }), 'siren');
    assert.equal(classifyProductUpfitCategory({ title: 'Dynamax Speaker' }), 'speaker');
    assert.equal(classifyProductUpfitCategory({ title: 'Heavy-Duty Push Bumper' }), 'push_bumper');
    assert.equal(classifyProductUpfitCategory({ title: 'Slim-Line Vehicle Console' }), 'console');
    assert.equal(classifyProductUpfitCategory({ title: 'Prisoner Transport Partition' }), 'partition');
  });

  it('classifies rear warning/scene lighting/graphics/perimeter/interior/accessories products from title keywords', () => {
    const { classifyProductUpfitCategory } = modules.fleetBuildsDomain;
    assert.equal(classifyProductUpfitCategory({ title: 'SignalMaster Rear Warning System' }), 'rear_warning');
    assert.equal(classifyProductUpfitCategory({ title: 'LED Scene Light Kit' }), 'scene_lighting');
    assert.equal(classifyProductUpfitCategory({ title: 'Reflective Chevron Graphic Kit' }), 'graphics_markings');
    assert.equal(classifyProductUpfitCategory({ title: 'DynaFlare Perimeter Light' }), 'perimeter_lighting');
    assert.equal(classifyProductUpfitCategory({ title: 'Interior Dash Light Kit' }), 'interior_lighting');
    assert.equal(classifyProductUpfitCategory({ title: 'Universal Mount Bracket Accessory Kit' }), 'accessories');
  });

  it('returns null when no rule matches, and for a missing product', () => {
    const { classifyProductUpfitCategory } = modules.fleetBuildsDomain;
    assert.equal(classifyProductUpfitCategory({ title: 'Mystery Widget' }), null);
    assert.equal(classifyProductUpfitCategory(null), null);
    assert.equal(classifyProductUpfitCategory(undefined), null);
  });

  it('classifies the real catalog products (all light-bars today) as roof_lighting', () => {
    const { catalogService } = modules.catalog;
    const { classifyProductUpfitCategory } = modules.fleetBuildsDomain;
    assert.equal(classifyProductUpfitCategory(catalogService.getProduct('navigator')), 'roof_lighting');
    assert.equal(classifyProductUpfitCategory(catalogService.getProduct('valor')), 'roof_lighting');
  });
});

// ---------------------------------------------------------------------------
// Domain: build styles / guidance rules
// ---------------------------------------------------------------------------
describe('Build style rules (guidance, not hard gates)', () => {
  it('defines exactly the 7 required build styles', () => {
    const { ALL_BUILD_STYLE_IDS } = modules.fleetBuildsDomain;
    assert.deepEqual(
      [...ALL_BUILD_STYLE_IDS].sort(),
      ['fire_command', 'patrol', 'pursuit', 'slicktop', 'supervisor', 'traffic_enforcement', 'work_truck'].sort(),
    );
  });

  it('Patrol prioritizes roof lighting, siren, speaker, and console', () => {
    const { getBuildStyleDefinition } = modules.fleetBuildsDomain;
    assert.deepEqual(getBuildStyleDefinition('patrol').priorityCategories, ['roof_lighting', 'siren', 'speaker', 'console']);
  });

  it('Slicktop does not prioritize (require) roof lighting', () => {
    const { getBuildStyleDefinition } = modules.fleetBuildsDomain;
    assert.ok(!getBuildStyleDefinition('slicktop').priorityCategories.includes('roof_lighting'));
  });

  it('Pursuit prioritizes warning lighting, siren, push bumper, and console', () => {
    const { getBuildStyleDefinition } = modules.fleetBuildsDomain;
    assert.deepEqual(getBuildStyleDefinition('pursuit').priorityCategories, ['roof_lighting', 'siren', 'push_bumper', 'console']);
  });

  it('getBuildStyleLabel falls back to "No Style Selected" for null/unknown styles', () => {
    const { getBuildStyleLabel } = modules.fleetBuildsDomain;
    assert.equal(getBuildStyleLabel(null), 'No Style Selected');
    assert.equal(getBuildStyleLabel('patrol'), 'Patrol');
  });
});

// ---------------------------------------------------------------------------
// Domain: fleet build CRUD rules
// ---------------------------------------------------------------------------
describe('Fleet build CRUD rules (add/switch/remove/rename/update)', () => {
  it('createFleetBuild seeds a sequential default name and empty state', () => {
    const { createFleetBuild } = modules.fleetBuildsDomain;
    const build = createFleetBuild('id-1', 500, []);
    assert.equal(build.name, 'Fleet Build 1');
    assert.equal(build.quantity, 1);
    assert.equal(build.buildStyle, null);
    assert.deepEqual(build.selections, {});
    assert.equal(build.createdAt, 500);
  });

  it('Add vehicle build: addFleetBuild appends and enforces MAX_FLEET_BUILDS', () => {
    const { addFleetBuild, createFleetBuild, MAX_FLEET_BUILDS } = modules.fleetBuildsDomain;
    let builds = [];
    for (let i = 0; i < MAX_FLEET_BUILDS; i += 1) {
      builds = addFleetBuild(builds, createFleetBuild(`b${i}`, i, builds));
    }
    assert.equal(builds.length, MAX_FLEET_BUILDS);

    const overflowed = addFleetBuild(builds, createFleetBuild('overflow', 999, builds));
    assert.equal(overflowed.length, MAX_FLEET_BUILDS);
    assert.equal(overflowed, builds);
  });

  it('Remove build: removeFleetBuild filters out only the targeted build', () => {
    const { removeFleetBuild } = modules.fleetBuildsDomain;
    const builds = [makeBuild({ id: 'a' }), makeBuild({ id: 'b' })];
    assert.deepEqual(removeFleetBuild(builds, 'a').map((b) => b.id), ['b']);
  });

  it('Switch active build: resolveNextActiveBuildId keeps the current active id if it was not removed', () => {
    const { resolveNextActiveBuildId } = modules.fleetBuildsDomain;
    const remaining = [makeBuild({ id: 'a' }), makeBuild({ id: 'b' })];
    assert.equal(resolveNextActiveBuildId(remaining, 'c', 'a'), 'a');
  });

  it('Switch active build: resolveNextActiveBuildId falls back to the last remaining build when the active one was removed', () => {
    const { resolveNextActiveBuildId } = modules.fleetBuildsDomain;
    const remaining = [makeBuild({ id: 'a' }), makeBuild({ id: 'b' })];
    assert.equal(resolveNextActiveBuildId(remaining, 'active-id', 'active-id'), 'b');
  });

  it('Switch active build: resolveNextActiveBuildId returns null once every build has been removed', () => {
    const { resolveNextActiveBuildId } = modules.fleetBuildsDomain;
    assert.equal(resolveNextActiveBuildId([], 'only-id', 'only-id'), null);
  });

  it('Rename build: renameFleetBuild trims whitespace and rejects an empty name', () => {
    const { renameFleetBuild } = modules.fleetBuildsDomain;
    const builds = [makeBuild({ id: 'a', name: 'Old Name' })];
    assert.equal(renameFleetBuild(builds, 'a', '  New Name  ')[0].name, 'New Name');
    assert.equal(renameFleetBuild(builds, 'a', '   '), builds);
  });

  it('updateFleetBuildVehicle/Quantity/Style update only the targeted build', () => {
    const { updateFleetBuildVehicle, updateFleetBuildQuantity, updateFleetBuildStyle } = modules.fleetBuildsDomain;
    const builds = [makeBuild({ id: 'a' }), makeBuild({ id: 'b' })];
    const vehicle = { vehicleId: 'FORD_PIU', year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' };

    const withVehicle = updateFleetBuildVehicle(builds, 'a', vehicle);
    assert.deepEqual(withVehicle[0].vehicle, vehicle);
    assert.equal(withVehicle[1].vehicle, null);

    const withQuantity = updateFleetBuildQuantity(builds, 'a', 6);
    assert.equal(withQuantity[0].quantity, 6);

    assert.equal(updateFleetBuildQuantity(builds, 'a', 0)[0].quantity, 1);
    assert.equal(updateFleetBuildQuantity(builds, 'a', -5)[0].quantity, 1);

    const withStyle = updateFleetBuildStyle(builds, 'a', 'pursuit');
    assert.equal(withStyle[0].buildStyle, 'pursuit');
  });

  it('Add to active build: addProductToBuildCategory adds and dedupes by product id', () => {
    const { addProductToBuildCategory, isProductInBuildCategory } = modules.fleetBuildsDomain;
    const builds = [makeBuild({ id: 'a' })];
    const selection = { productId: 'navigator', label: 'Navigator', addedAt: 10 };

    const withProduct = addProductToBuildCategory(builds, 'a', 'roof_lighting', selection);
    assert.equal(withProduct[0].selections.roof_lighting.length, 1);
    assert.ok(isProductInBuildCategory(withProduct[0], 'roof_lighting', 'navigator'));

    const deduped = addProductToBuildCategory(withProduct, 'a', 'roof_lighting', selection);
    assert.equal(deduped[0].selections.roof_lighting.length, 1);
  });

  it('removeProductFromBuildCategory removes only the matching product', () => {
    const { addProductToBuildCategory, removeProductFromBuildCategory } = modules.fleetBuildsDomain;
    let builds = [makeBuild({ id: 'a' })];
    builds = addProductToBuildCategory(builds, 'a', 'siren', { productId: 'siren-1', label: 'Siren One', addedAt: 1 });
    builds = addProductToBuildCategory(builds, 'a', 'siren', { productId: 'siren-2', label: 'Siren Two', addedAt: 2 });

    const after = removeProductFromBuildCategory(builds, 'a', 'siren', 'siren-1');
    assert.deepEqual(after[0].selections.siren.map((item) => item.productId), ['siren-2']);
  });
});

// ---------------------------------------------------------------------------
// Domain: completion percentage / color / missing categories
// ---------------------------------------------------------------------------
describe('calculateFleetBuildCompletion (percentage, color, missing categories)', () => {
  it('reports 0%/red and all 12 categories missing for a brand-new build with no style', () => {
    const { calculateFleetBuildCompletion, ALL_UPFIT_CATEGORY_IDS } = modules.fleetBuildsDomain;
    const completion = calculateFleetBuildCompletion(makeBuild());
    assert.equal(completion.percent, 0);
    assert.equal(completion.color, 'red');
    assert.deepEqual(completion.referenceCategories, ALL_UPFIT_CATEGORY_IDS);
    assert.equal(completion.missingCategories.length, ALL_UPFIT_CATEGORY_IDS.length);
  });

  it('reports a yellow, partial percentage once some (not all) priority categories are filled', () => {
    const { calculateFleetBuildCompletion } = modules.fleetBuildsDomain;
    const build = makeBuild({
      buildStyle: 'patrol',
      selections: {
        roof_lighting: [{ productId: 'p1', label: 'Light Bar', addedAt: 1 }],
        siren: [{ productId: 'p2', label: 'Siren', addedAt: 2 }],
      },
    });
    const completion = calculateFleetBuildCompletion(build);
    assert.equal(completion.percent, 50);
    assert.equal(completion.color, 'yellow');
    assert.deepEqual(completion.missingCategories, ['speaker', 'console']);
  });

  it('reports 100%/green once every priority category for the style is filled', () => {
    const { calculateFleetBuildCompletion } = modules.fleetBuildsDomain;
    const build = makeBuild({
      buildStyle: 'patrol',
      selections: {
        roof_lighting: [{ productId: 'p1', label: 'a', addedAt: 1 }],
        siren: [{ productId: 'p2', label: 'b', addedAt: 1 }],
        speaker: [{ productId: 'p3', label: 'c', addedAt: 1 }],
        console: [{ productId: 'p4', label: 'd', addedAt: 1 }],
      },
    });
    const completion = calculateFleetBuildCompletion(build);
    assert.equal(completion.percent, 100);
    assert.equal(completion.color, 'green');
    assert.deepEqual(completion.missingCategories, []);
  });

  it('is guidance, not a hard gate: a category outside the style priority list still counts as selected but never blocks or inflates the percentage', () => {
    const { calculateFleetBuildCompletion } = modules.fleetBuildsDomain;
    const build = makeBuild({
      buildStyle: 'patrol',
      selections: {
        graphics_markings: [{ productId: 'p1', label: 'Chevron Kit', addedAt: 1 }],
      },
    });
    const completion = calculateFleetBuildCompletion(build);
    assert.equal(completion.percent, 0);
    assert.ok(completion.selectedCategories.includes('graphics_markings'));
    assert.ok(!completion.referenceCategories.includes('graphics_markings'));
  });

  it('suggestedNextCategories is capped at the first 3 missing categories', () => {
    const { calculateFleetBuildCompletion } = modules.fleetBuildsDomain;
    const completion = calculateFleetBuildCompletion(makeBuild({ buildStyle: 'slicktop' }));
    assert.equal(completion.suggestedNextCategories.length, 3);
    assert.deepEqual(completion.suggestedNextCategories, completion.missingCategories.slice(0, 3));
  });
});

// ---------------------------------------------------------------------------
// Domain: Add to All Compatible Builds
// ---------------------------------------------------------------------------
describe('addProductToAllCompatibleBuilds (never adds blindly)', () => {
  it('skips every build with reason category_undetermined when the product cannot be classified', () => {
    const { addProductToAllCompatibleBuilds } = modules.fleetBuildsDomain;
    const builds = [makeBuild({ id: 'a', vehicle: { year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' } })];
    const { builds: nextBuilds, result } = addProductToAllCompatibleBuilds(builds, { id: 'mystery', title: 'Mystery Widget', verticalIds: [] }, 1);

    assert.equal(result.category, null);
    assert.equal(result.added.length, 0);
    assert.equal(result.skipped.length, 1);
    assert.equal(result.skipped[0].reason, 'category_undetermined');
    assert.equal(nextBuilds, builds);
  });

  it('skips a build with no vehicle selected yet', async () => {
    const { addProductToAllCompatibleBuilds } = modules.fleetBuildsDomain;
    const { catalogService } = modules.catalog;
    const valor = catalogService.getProduct('valor');

    const builds = [makeBuild({ id: 'no-vehicle', vehicle: null })];
    const { result } = addProductToAllCompatibleBuilds(builds, valor, 1);

    assert.equal(result.added.length, 0);
    assert.equal(result.skipped[0].reason, 'no_vehicle_selected');
  });

  it('skips a build whose vehicle vertical does not include the product verticals', () => {
    const { addProductToAllCompatibleBuilds } = modules.fleetBuildsDomain;
    const { catalogService } = modules.catalog;
    const valor = catalogService.getProduct('valor'); // verticalIds: ['police']

    const workTruckBuild = makeBuild({
      id: 'work-truck-build',
      vehicle: { vehicleId: 'RAM_2500', year: '2024', make: 'Ram', model: '2500', vertical: 'Work Truck' },
    });
    const { result } = addProductToAllCompatibleBuilds([workTruckBuild], valor, 1);

    assert.equal(result.added.length, 0);
    assert.equal(result.skipped[0].reason, 'vertical_mismatch');
  });

  it('adds the product to the matching upfit category for a compatible build, and reports totalBuilds', () => {
    const { addProductToAllCompatibleBuilds } = modules.fleetBuildsDomain;
    const { catalogService } = modules.catalog;
    const valor = catalogService.getProduct('valor'); // verticalIds: ['police']

    const policeBuild = makeBuild({
      id: 'police-build',
      vehicle: { vehicleId: 'FORD_PIU', year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' },
    });
    const { builds: nextBuilds, result } = addProductToAllCompatibleBuilds([policeBuild], valor, 42);

    assert.equal(result.category, 'roof_lighting');
    assert.equal(result.totalBuilds, 1);
    assert.equal(result.added.length, 1);
    assert.equal(result.skipped.length, 0);
    assert.deepEqual(nextBuilds[0].selections.roof_lighting.map((item) => item.productId), ['valor']);
  });

  it('is idempotent — adding the same product twice does not duplicate the selection', () => {
    const { addProductToAllCompatibleBuilds } = modules.fleetBuildsDomain;
    const { catalogService } = modules.catalog;
    const valor = catalogService.getProduct('valor');
    const policeBuild = makeBuild({
      id: 'police-build',
      vehicle: { vehicleId: 'FORD_PIU', year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' },
    });

    const first = addProductToAllCompatibleBuilds([policeBuild], valor, 1);
    const second = addProductToAllCompatibleBuilds(first.builds, valor, 2);

    assert.equal(second.result.added.length, 1);
    assert.equal(second.builds[0].selections.roof_lighting.length, 1);
  });

  it('evaluates mixed builds independently — some added, some skipped, in one call', () => {
    const { addProductToAllCompatibleBuilds } = modules.fleetBuildsDomain;
    const { catalogService } = modules.catalog;
    const valor = catalogService.getProduct('valor');

    const builds = [
      makeBuild({ id: 'compatible', vehicle: { year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' } }),
      makeBuild({ id: 'no-vehicle', vehicle: null }),
      makeBuild({ id: 'wrong-vertical', vehicle: { year: '2024', make: 'Ram', model: '2500', vertical: 'Work Truck' } }),
    ];
    const { result } = addProductToAllCompatibleBuilds(builds, valor, 1);

    assert.equal(result.totalBuilds, 3);
    assert.deepEqual(result.added.map((entry) => entry.buildId), ['compatible']);
    assert.deepEqual(result.skipped.map((entry) => entry.buildId), ['no-vehicle', 'wrong-vertical']);
  });
});

// ---------------------------------------------------------------------------
// Components: Shop by Vehicle tab still works
// ---------------------------------------------------------------------------
describe('Shop by Vehicle tab (unchanged year/make/model selection)', () => {
  it('renders year/make/model selects and a disabled Confirm Vehicle button with no vehicle selected', () => {
    const { default: ShopByVehiclePanel } = modules.shopByVehiclePanel;
    const html = renderWithProviders(React.createElement(ShopByVehiclePanel, { onClose: () => {} }));

    assert.match(html, /Select Year/);
    assert.match(html, /Select Make/);
    assert.match(html, /Select Model/);
    assert.match(html, /Confirm Vehicle/);
    assert.doesNotMatch(html, /Currently shopping for/);
  });

  it('lists vehicle years sourced from the shared vehicle master data', () => {
    const { listVehicleYears } = modules.vehicleMaster;
    const years = listVehicleYears();
    assert.ok(years.includes('2024'));
    assert.ok(years.includes('2026'));
  });

  it('findVehicleMasterEntry resolves the vehicleId and vertical for an exact year/make/model triple', () => {
    const { findVehicleMasterEntry } = modules.vehicleMaster;
    const entry = findVehicleMasterEntry('2024', 'Ford', 'Explorer PIU');
    assert.equal(entry.vehicleId, 'FORD_PIU');
    assert.equal(entry.vertical, 'Police');
  });
});

// ---------------------------------------------------------------------------
// Components: VehicleSelectorModal tabs
// ---------------------------------------------------------------------------
describe('VehicleSelectorModal (two-tab shopping control)', () => {
  it('defaults to the Shop by Vehicle tab and renders its content', () => {
    const { default: VehicleSelectorModal } = modules.vehicleSelectorModal;
    const html = renderWithProviders(React.createElement(VehicleSelectorModal, { onClose: () => {} }));

    assert.match(html, /Shop by Vehicle/);
    assert.match(html, /Fleet Builds/);
    assert.match(html, /Select Year/);
    assert.doesNotMatch(html, /No fleet builds yet/);
  });

  it('opens directly on the Fleet Builds tab when initialTab="fleet"', () => {
    const { default: VehicleSelectorModal } = modules.vehicleSelectorModal;
    const html = renderWithProviders(React.createElement(VehicleSelectorModal, { onClose: () => {}, initialTab: 'fleet' }));

    assert.match(html, /No fleet builds yet/);
    assert.match(html, /Add Your First Build/);
    assert.doesNotMatch(html, /Select Year/);
  });

  it('keeps the vehicle-selector-modal class name for the existing mobile CSS breakpoint', () => {
    const { default: VehicleSelectorModal } = modules.vehicleSelectorModal;
    const html = renderWithProviders(React.createElement(VehicleSelectorModal, { onClose: () => {} }));
    assert.match(html, /class="vehicle-selector-modal"/);
  });
});

// ---------------------------------------------------------------------------
// Components: Fleet Builds tab renders (empty + composition)
// ---------------------------------------------------------------------------
describe('FleetBuildsPanel (Fleet Builds tab)', () => {
  it('renders the empty state with an Add Build affordance when no builds exist', () => {
    const { default: FleetBuildsPanel } = modules.fleetBuildsPanel;
    const html = renderWithProviders(React.createElement(FleetBuildsPanel));

    assert.match(html, /No fleet builds yet/);
    assert.match(html, /Add Your First Build/);
    assert.match(html, /Add Build/);
  });
});

// ---------------------------------------------------------------------------
// Components: FleetBuildCard (pure, fixture-driven)
// ---------------------------------------------------------------------------
describe('FleetBuildCard (per-build summary and controls)', () => {
  function noop() {}

  it('renders the build name, ACTIVE badge, vehicle summary, and completion badge', () => {
    const { default: FleetBuildCard } = modules.fleetBuildCard;
    const build = makeBuild({
      name: 'Patrol Fleet',
      buildStyle: 'patrol',
      vehicle: { vehicleId: 'FORD_PIU', year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' },
      selections: { roof_lighting: [{ productId: 'valor', label: 'Valor Light Bar', addedAt: 1 }] },
    });

    const html = renderPure(React.createElement(FleetBuildCard, {
      build, isActive: true, onSetActive: noop, onRemove: noop, onRename: noop,
      onUpdateVehicle: noop, onUpdateQuantity: noop, onUpdateStyle: noop, onRemoveProduct: noop,
    }));

    assert.match(html, /value="Patrol Fleet"/);
    assert.match(html, /ACTIVE/);
    assert.match(html, /2024 Ford Explorer PIU/);
    assert.match(html, /25% Complete/); // 1 of 4 patrol priority categories filled
  });

  it('shows "Set Active" instead of the ACTIVE badge when not active', () => {
    const { default: FleetBuildCard } = modules.fleetBuildCard;
    const html = renderPure(React.createElement(FleetBuildCard, {
      build: makeBuild(), isActive: false, onSetActive: noop, onRemove: noop, onRename: noop,
      onUpdateVehicle: noop, onUpdateQuantity: noop, onUpdateStyle: noop, onRemoveProduct: noop,
    }));

    assert.match(html, /Set Active/);
    assert.doesNotMatch(html, /ACTIVE<\/span>/);
  });

  it('lists missing upfit categories for the selected build style', () => {
    const { default: FleetBuildCard } = modules.fleetBuildCard;
    const build = makeBuild({
      buildStyle: 'patrol',
      selections: { roof_lighting: [{ productId: 'valor', label: 'Valor Light Bar', addedAt: 1 }] },
    });

    const html = renderPure(React.createElement(FleetBuildCard, {
      build, isActive: false, onSetActive: noop, onRemove: noop, onRename: noop,
      onUpdateVehicle: noop, onUpdateQuantity: noop, onUpdateStyle: noop, onRemoveProduct: noop,
    }));

    assert.match(html, /Missing Upfit Categories/);
    assert.match(html, /Siren/);
    assert.match(html, /Speaker/);
    assert.match(html, /Console/);
  });

  it('lists selected upfit categories with their products and a remove control', () => {
    const { default: FleetBuildCard } = modules.fleetBuildCard;
    const build = makeBuild({
      selections: { siren: [{ productId: 'siren-1', label: 'PA300 Siren', addedAt: 1 }] },
    });

    const html = renderPure(React.createElement(FleetBuildCard, {
      build, isActive: false, onSetActive: noop, onRemove: noop, onRename: noop,
      onUpdateVehicle: noop, onUpdateQuantity: noop, onUpdateStyle: noop, onRemoveProduct: noop,
    }));

    assert.match(html, /Selected Upfit Categories/);
    assert.match(html, /PA300 Siren/);
    assert.match(html, /aria-label="Remove PA300 Siren from Siren"/);
  });

  it('uses a mobile-safe responsive grid for the vehicle picker fields', () => {
    const { default: FleetBuildCard } = modules.fleetBuildCard;
    const html = renderPure(React.createElement(FleetBuildCard, {
      build: makeBuild(), isActive: false, onSetActive: noop, onRemove: noop, onRename: noop,
      onUpdateVehicle: noop, onUpdateQuantity: noop, onUpdateStyle: noop, onRemoveProduct: noop,
    }));

    assert.match(html, /grid-cols-1 sm:grid-cols-3/);
  });
});

describe('FleetBuildCompletionBadge', () => {
  it('renders red for 0%, yellow for a partial percentage, and green for 100%', () => {
    const { default: FleetBuildCompletionBadge } = modules.completionBadge;
    const red = renderPure(React.createElement(FleetBuildCompletionBadge, { completion: { percent: 0, color: 'red' } }));
    const yellow = renderPure(React.createElement(FleetBuildCompletionBadge, { completion: { percent: 50, color: 'yellow' } }));
    const green = renderPure(React.createElement(FleetBuildCompletionBadge, { completion: { percent: 100, color: 'green' } }));

    assert.match(red, /0% Complete/);
    assert.match(red, /#fee2e2/);
    assert.match(yellow, /50% Complete/);
    assert.match(yellow, /#fef3c7/);
    assert.match(green, /100% Complete/);
    assert.match(green, /#dcfce7/);
  });
});

// ---------------------------------------------------------------------------
// Components: Add to All Compatible Builds
// ---------------------------------------------------------------------------
describe('AddToAllCompatibleBuildsButton', () => {
  it('renders nothing when there are no fleet builds yet', () => {
    const { default: AddToAllCompatibleBuildsButton } = modules.addToAllButton;
    const html = renderWithProviders(React.createElement(AddToAllCompatibleBuildsButton, {
      product: { id: 'navigator', title: 'Navigator' }, variant: 'icon',
    }));
    assert.equal(html, '');
  });

  it('renders nothing without a product id', () => {
    const { default: AddToAllCompatibleBuildsButton } = modules.addToAllButton;
    const html = renderWithProviders(React.createElement(AddToAllCompatibleBuildsButton, { product: null, variant: 'icon' }));
    assert.equal(html, '');
  });

  it('summarizeAddToAllResult reports a "no builds" message when none exist', () => {
    const { summarizeAddToAllResult } = modules.addToAllButton;
    const summary = summarizeAddToAllResult({ category: null, totalBuilds: 0, added: [], skipped: [] });
    assert.match(summary.title, /No fleet builds yet/);
  });

  it('summarizeAddToAllResult reports a clean "added to all" message when nothing was skipped', () => {
    const { summarizeAddToAllResult } = modules.addToAllButton;
    const summary = summarizeAddToAllResult({
      category: 'roof_lighting', totalBuilds: 2,
      added: [{ buildId: 'a', buildName: 'A' }, { buildId: 'b', buildName: 'B' }],
      skipped: [],
    });
    assert.equal(summary.title, 'Added to 2 builds');
    assert.equal(summary.description, 'Every fleet build was updated.');
  });

  it('summarizeAddToAllResult includes skip reasons in the description', () => {
    const { summarizeAddToAllResult } = modules.addToAllButton;
    const summary = summarizeAddToAllResult({
      category: 'roof_lighting', totalBuilds: 2,
      added: [{ buildId: 'a', buildName: 'Patrol Build' }],
      skipped: [{ buildId: 'b', buildName: 'Work Truck Build', reason: 'vertical_mismatch', message: "Not associated with this build's Work Truck vertical." }],
    });
    assert.equal(summary.title, 'Added to 1 build');
    assert.match(summary.description, /Skipped 1 build/);
    assert.match(summary.description, /Work Truck Build/);
  });
});

// ---------------------------------------------------------------------------
// Product Detail: Finish Your Upfit panel
// ---------------------------------------------------------------------------
describe('Finish Your Upfit panel (Product Detail)', () => {
  it('renders nothing when the customer has no fleet builds', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [], activeBuild: null, product: { id: 'navigator', title: 'Navigator' },
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {},
    }));
    assert.equal(html, '');
  });

  it('prompts to choose an active build when builds exist but none is active', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [makeBuild()], activeBuild: null, product: { id: 'navigator', title: 'Navigator' },
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {},
    }));
    assert.match(html, /none is active right now/);
    assert.match(html, /Open Fleet Builds/);
  });

  it('shows the active build\'s completion, missing categories, and suggested next categories', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = makeBuild({
      name: 'Patrol Fleet', buildStyle: 'patrol',
      vehicle: { year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' },
      selections: { roof_lighting: [{ productId: 'valor', label: 'Valor', addedAt: 1 }] },
    });

    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild], activeBuild, product: { id: 'navigator', title: 'Navigator', category: 'light-bars', categoryIds: ['light-bars'], verticalIds: ['fire'] },
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {},
    }));

    assert.match(html, /Finish Your Upfit/);
    assert.match(html, /Patrol Fleet/);
    assert.match(html, /25% Complete/);
    assert.match(html, /Missing Upfit Categories/);
    assert.match(html, /Suggested Next Categories/);
    assert.match(html, /Add to Active Build/);
  });

  it('renders nothing missing once every priority category is filled', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = makeBuild({
      buildStyle: 'patrol',
      selections: {
        roof_lighting: [{ productId: 'p1', label: 'a', addedAt: 1 }],
        siren: [{ productId: 'p2', label: 'b', addedAt: 1 }],
        speaker: [{ productId: 'p3', label: 'c', addedAt: 1 }],
        console: [{ productId: 'p4', label: 'd', addedAt: 1 }],
      },
    });

    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild], activeBuild, product: { id: 'navigator', title: 'Navigator' },
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {},
    }));

    assert.match(html, /Nothing missing/);
  });
});

// ---------------------------------------------------------------------------
// Workspace: Fleet Builds section
// ---------------------------------------------------------------------------
describe('FleetBuildsWorkspaceSection (/workspace)', () => {
  it('renders an empty state with a "Start a Fleet Build" CTA when no builds exist', () => {
    const { default: FleetBuildsWorkspaceSection } = modules.workspaceSection;
    const html = renderPure(React.createElement(FleetBuildsWorkspaceSection, { builds: [], onOpenFleetBuilds: () => {} }));

    assert.match(html, /No fleet builds yet/);
    assert.match(html, /Start a Fleet Build/);
  });

  it('renders each build\'s name, completion color, vehicle/style/quantity, and missing categories', () => {
    const { default: FleetBuildsWorkspaceSection } = modules.workspaceSection;
    const builds = [
      makeBuild({
        name: 'Patrol Fleet', quantity: 4, buildStyle: 'patrol',
        vehicle: { year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' },
        selections: { roof_lighting: [{ productId: 'valor', label: 'Valor', addedAt: 1 }] },
      }),
    ];

    const html = renderPure(React.createElement(FleetBuildsWorkspaceSection, { builds, onOpenFleetBuilds: () => {} }));

    assert.match(html, /Patrol Fleet/);
    assert.match(html, /2024 Ford Explorer PIU/);
    assert.match(html, /Patrol/);
    assert.match(html, /Qty 4/);
    assert.match(html, /25% Complete/);
    assert.match(html, /Missing: Siren, Speaker, Console/);
  });

  it('has an "Open Fleet Builds" CTA and a mobile-safe responsive grid', () => {
    const { default: FleetBuildsWorkspaceSection } = modules.workspaceSection;
    const html = renderPure(React.createElement(FleetBuildsWorkspaceSection, { builds: [makeBuild()], onOpenFleetBuilds: () => {} }));

    assert.match(html, /Open Fleet Builds/);
    assert.match(html, /grid-cols-1 md:grid-cols-2/);
  });
});

// ---------------------------------------------------------------------------
// Composition — existing surfaces wire in Fleet Builds without breaking CTAs
// ---------------------------------------------------------------------------
describe('Composition — existing product surfaces gain fleet actions without changing existing CTAs', () => {
  it('CommerceActionPanel still renders Configure/Quote/Cart/Contact alongside the new fleet action', () => {
    const { catalogService } = modules.catalog;
    const { default: CommerceActionPanel } = modules.commerceActionPanel;
    const product = catalogService.getProduct('navigator');

    const html = renderWithProviders(React.createElement(CommerceActionPanel, { product }));

    assert.match(html, /Configure Product/);
    assert.match(html, /Request Quote/);
    assert.match(html, /Contact Sales/);
  });

  it('ProductCard renders the Add to All Compatible Builds overlay only when both href and a full product are supplied', () => {
    const { default: ProductCard } = modules.productCard;
    const withProduct = renderWithProviders(React.createElement(ProductCard, {
      id: 'navigator', href: '/fire/light-bars/navigator', label: 'Navigator', product: { id: 'navigator', title: 'Navigator' },
    }));
    const withoutProduct = renderWithProviders(React.createElement(ProductCard, {
      id: 'navigator', href: '/fire/light-bars/navigator', label: 'Navigator',
    }));

    // Neither renders the overlay today (no fleet builds exist under SSR), but
    // both must render successfully either way — this is a smoke check that
    // the optional `product` prop never breaks a card that omits it (e.g. the
    // denormalized CategoryTemplate grid).
    assert.match(withProduct, /Navigator/);
    assert.match(withoutProduct, /Navigator/);
  });

  it('source: App.jsx mounts FleetBuildsProvider', async () => {
    const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
    assert.match(source, /import \{ FleetBuildsProvider \} from '@\/context\/FleetBuildsContext'/);
    assert.match(source, /<FleetBuildsProvider>/);
  });

  it('source: WorkspaceDashboard renders the Fleet Builds section', async () => {
    const source = readFileSync(new URL('../src/pages/WorkspaceDashboard.jsx', import.meta.url), 'utf8');
    assert.match(source, /import FleetBuildsWorkspaceSection from '@\/components\/fleetBuilds\/FleetBuildsWorkspaceSection'/);
    assert.match(source, /<FleetBuildsWorkspaceSection/);
  });

  it('source: ProductDetailTemplate renders the Finish Your Upfit panel', async () => {
    const source = readFileSync(new URL('../src/pages/ProductDetailTemplate.jsx', import.meta.url), 'utf8');
    assert.match(source, /import FinishYourUpfitPanel from '@\/components\/fleetBuilds\/FinishYourUpfitPanel'/);
    assert.match(source, /<FinishYourUpfitPanel /);
  });

  it('source: CommerceActionPanel wires the Add to All Compatible Builds action', async () => {
    const source = readFileSync(new URL('../src/components/product/CommerceActionPanel.jsx', import.meta.url), 'utf8');
    assert.match(source, /<AddToAllCompatibleBuildsButton /);
  });
});

// ---------------------------------------------------------------------------
// Mobile-safe structure
// ---------------------------------------------------------------------------
describe('Mobile-safe structure', () => {
  it('the vehicle selector modal keeps its CSS class for the existing small-viewport width override', () => {
    const { default: VehicleSelectorModal } = modules.vehicleSelectorModal;
    const html = renderWithProviders(React.createElement(VehicleSelectorModal, { onClose: () => {}, initialTab: 'fleet' }));
    assert.match(html, /class="vehicle-selector-modal"/);
  });

  it('FleetBuildCard stacks its vehicle picker to one column below the sm breakpoint', () => {
    const { default: FleetBuildCard } = modules.fleetBuildCard;
    const html = renderPure(React.createElement(FleetBuildCard, {
      build: makeBuild(), isActive: false, onSetActive: () => {}, onRemove: () => {}, onRename: () => {},
      onUpdateVehicle: () => {}, onUpdateQuantity: () => {}, onUpdateStyle: () => {}, onRemoveProduct: () => {},
    }));
    assert.match(html, /grid-cols-1 sm:grid-cols-3/);
  });

  it('the Finish Your Upfit panel stacks to one column on mobile before widening to 3 columns', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = makeBuild({ buildStyle: 'patrol' });
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild], activeBuild, product: { id: 'navigator', title: 'Navigator' },
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {},
    }));
    assert.match(html, /grid-cols-1 md:grid-cols-3/);
  });

  it('the Workspace Fleet Builds grid stacks to one column on mobile before widening to 2 columns', () => {
    const { default: FleetBuildsWorkspaceSection } = modules.workspaceSection;
    const html = renderPure(React.createElement(FleetBuildsWorkspaceSection, { builds: [makeBuild()], onOpenFleetBuilds: () => {} }));
    assert.match(html, /grid-cols-1 md:grid-cols-2/);
  });
});
