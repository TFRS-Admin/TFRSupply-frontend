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
    fleetBuildsDomain: await server.ssrLoadModule('/src/domain/fleetBuilds/index.ts'),
    fleetProjectContext: await server.ssrLoadModule('/src/context/FleetProjectContext.jsx'),
    fleetBuildsContext: await server.ssrLoadModule('/src/context/FleetBuildsContext.jsx'),
    fleetTemplatesContext: await server.ssrLoadModule('/src/context/FleetTemplatesContext.jsx'),
    vehicleContext: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    compareContext: await server.ssrLoadModule('/src/context/CompareContext.jsx'),
    recentlyViewedContext: await server.ssrLoadModule('/src/context/RecentlyViewedContext.jsx'),
    savedProductsContext: await server.ssrLoadModule('/src/context/SavedProductsContext.jsx'),
    configuratorContext: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    cloneBuildDialog: await server.ssrLoadModule('/src/components/fleetBuilds/CloneBuildDialog.jsx'),
    fleetTemplateRow: await server.ssrLoadModule('/src/components/fleetBuilds/FleetTemplateRow.jsx'),
    fleetTemplatesSection: await server.ssrLoadModule('/src/components/fleetBuilds/FleetTemplatesSection.jsx'),
    fleetTemplatesWorkspaceSection: await server.ssrLoadModule('/src/components/fleetBuilds/FleetTemplatesWorkspaceSection.jsx'),
    fleetBuildCard: await server.ssrLoadModule('/src/components/fleetBuilds/FleetBuildCard.jsx'),
    fleetBuildsPanel: await server.ssrLoadModule('/src/components/fleetBuilds/FleetBuildsPanel.jsx'),
    finishYourUpfitPanel: await server.ssrLoadModule('/src/components/fleetBuilds/FinishYourUpfitPanel.jsx'),
    workspacePage: await server.ssrLoadModule('/src/pages/WorkspaceDashboard.jsx'),
  };
});

after(async () => {
  await server?.close();
});

// See fleet-vehicle-shopping-modes.test.mjs — React SSR inserts `<!-- -->`
// marker comments between adjacent JSX text expressions; strip them so naive
// string assertions in these SSR-string tests aren't broken by them.
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
  const { FleetProjectProvider } = modules.fleetProjectContext;
  const { FleetBuildsProvider } = modules.fleetBuildsContext;
  const { FleetTemplatesProvider } = modules.fleetTemplatesContext;
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
                    React.createElement(ConfiguratorProvider, null, element),
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

function makeTemplate(overrides = {}) {
  return {
    id: 'template-1',
    name: 'Explorer Patrol',
    vehicle: { vehicleId: 'FORD_PIU', year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' },
    buildStyle: 'patrol',
    selections: {},
    completionPercent: 25,
    sourceBuildId: 'build-1',
    createdAt: 1000,
    updatedAt: 1000,
    usageCount: 0,
    lastUsedAt: null,
    ...overrides,
  };
}

const POLICE_VEHICLE = { vehicleId: 'FORD_PIU', year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' };
const WORK_TRUCK_VEHICLE = { vehicleId: 'RAM_2500', year: '2024', make: 'Ram', model: '2500', vertical: 'Work Truck' };

// ---------------------------------------------------------------------------
// Domain: template CRUD rules
// ---------------------------------------------------------------------------
describe('Template rules — defaultTemplateName', () => {
  it('combines vehicle model and build style label when both are known', () => {
    const { defaultTemplateName } = modules.fleetBuildsDomain;
    assert.equal(defaultTemplateName(POLICE_VEHICLE, 'patrol', 0), 'Explorer PIU Patrol');
  });

  it('falls back to "{model} Template" when there is no build style', () => {
    const { defaultTemplateName } = modules.fleetBuildsDomain;
    assert.equal(defaultTemplateName(POLICE_VEHICLE, null, 0), 'Explorer PIU Template');
  });

  it('falls back to "{style} Template" when there is no vehicle', () => {
    const { defaultTemplateName } = modules.fleetBuildsDomain;
    assert.equal(defaultTemplateName(null, 'supervisor', 0), 'Supervisor Template');
  });

  it('falls back to a sequential "Fleet Template N" when neither is known', () => {
    const { defaultTemplateName } = modules.fleetBuildsDomain;
    assert.equal(defaultTemplateName(null, null, 3), 'Fleet Template 4');
  });
});

describe('Template rules — createTemplateFromBuild / addTemplate / removeTemplate / renameTemplate', () => {
  it('snapshots vehicle, build style, selections, and completion percent from the source build', () => {
    const { createTemplateFromBuild } = modules.fleetBuildsDomain;
    const build = makeBuild({
      id: 'b1',
      buildStyle: 'patrol',
      vehicle: POLICE_VEHICLE,
      selections: { roof_lighting: [{ productId: 'valor', label: 'Valor', addedAt: 1 }] },
    });

    const template = createTemplateFromBuild('t1', 500, build, []);

    assert.equal(template.id, 't1');
    assert.equal(template.name, 'Explorer PIU Patrol');
    assert.deepEqual(template.vehicle, POLICE_VEHICLE);
    assert.equal(template.buildStyle, 'patrol');
    assert.deepEqual(template.selections.roof_lighting.map((i) => i.productId), ['valor']);
    assert.equal(template.completionPercent, 25); // 1 of 4 patrol priority categories filled
    assert.equal(template.sourceBuildId, 'b1');
    assert.equal(template.createdAt, 500);
    assert.equal(template.updatedAt, 500);
    assert.equal(template.usageCount, 0);
    assert.equal(template.lastUsedAt, null);
  });

  it('uses a trimmed custom name when one is supplied, falling back to the default when blank', () => {
    const { createTemplateFromBuild } = modules.fleetBuildsDomain;
    const build = makeBuild({ vehicle: POLICE_VEHICLE, buildStyle: 'patrol' });

    assert.equal(createTemplateFromBuild('t1', 1, build, [], '  Explorer Patrol Standard  ').name, 'Explorer Patrol Standard');
    assert.equal(createTemplateFromBuild('t2', 1, build, [], '   ').name, 'Explorer PIU Patrol');
  });

  it('does not mutate the source build selections (deep-enough copy)', () => {
    const { createTemplateFromBuild } = modules.fleetBuildsDomain;
    const build = makeBuild({ selections: { siren: [{ productId: 's1', label: 'Siren', addedAt: 1 }] } });

    const template = createTemplateFromBuild('t1', 1, build, []);
    template.selections.siren.push({ productId: 's2', label: 'Siren 2', addedAt: 2 });

    assert.equal(build.selections.siren.length, 1);
  });

  it('addTemplate appends and enforces MAX_FLEET_TEMPLATES', () => {
    const { addTemplate, createTemplateFromBuild, MAX_FLEET_TEMPLATES } = modules.fleetBuildsDomain;
    let templates = [];
    for (let i = 0; i < MAX_FLEET_TEMPLATES; i += 1) {
      templates = addTemplate(templates, createTemplateFromBuild(`t${i}`, i, makeBuild(), templates));
    }
    assert.equal(templates.length, MAX_FLEET_TEMPLATES);

    const overflowed = addTemplate(templates, createTemplateFromBuild('overflow', 999, makeBuild(), templates));
    assert.equal(overflowed.length, MAX_FLEET_TEMPLATES);
    assert.equal(overflowed, templates);
  });

  it('removeTemplate filters out only the targeted template', () => {
    const { removeTemplate } = modules.fleetBuildsDomain;
    const templates = [makeTemplate({ id: 'a' }), makeTemplate({ id: 'b' })];
    assert.deepEqual(removeTemplate(templates, 'a').map((t) => t.id), ['b']);
  });

  it('renameTemplate trims whitespace, rejects an empty name, and stamps updatedAt', () => {
    const { renameTemplate } = modules.fleetBuildsDomain;
    const templates = [makeTemplate({ id: 'a', name: 'Old Name', updatedAt: 1 })];

    const renamed = renameTemplate(templates, 'a', '  New Name  ', 999);
    assert.equal(renamed[0].name, 'New Name');
    assert.equal(renamed[0].updatedAt, 999);

    assert.equal(renameTemplate(templates, 'a', '   ', 999), templates);
  });

  it('touchTemplateUsage increments usageCount and sets lastUsedAt for only the targeted template', () => {
    const { touchTemplateUsage } = modules.fleetBuildsDomain;
    const templates = [makeTemplate({ id: 'a', usageCount: 2, lastUsedAt: 10 }), makeTemplate({ id: 'b', usageCount: 0, lastUsedAt: null })];

    const touched = touchTemplateUsage(templates, 'a', 500);
    assert.equal(touched[0].usageCount, 3);
    assert.equal(touched[0].lastUsedAt, 500);
    assert.equal(touched[1].usageCount, 0);
    assert.equal(touched[1].lastUsedAt, null);
  });

  it('getTemplateById resolves a template or returns null for a missing/absent id', () => {
    const { getTemplateById } = modules.fleetBuildsDomain;
    const templates = [makeTemplate({ id: 'a' })];
    assert.equal(getTemplateById(templates, 'a').id, 'a');
    assert.equal(getTemplateById(templates, 'missing'), null);
    assert.equal(getTemplateById(templates, null), null);
    assert.equal(getTemplateById(templates, undefined), null);
  });

  it('countBuildsUsingTemplate counts only builds whose templateId matches', () => {
    const { countBuildsUsingTemplate } = modules.fleetBuildsDomain;
    const builds = [
      makeBuild({ id: 'a', templateId: 'template-1' }),
      makeBuild({ id: 'b', templateId: 'template-1' }),
      makeBuild({ id: 'c', templateId: 'template-2' }),
      makeBuild({ id: 'd', templateId: null }),
    ];
    assert.equal(countBuildsUsingTemplate(builds, 'template-1'), 2);
    assert.equal(countBuildsUsingTemplate(builds, 'template-2'), 1);
    assert.equal(countBuildsUsingTemplate(builds, 'template-3'), 0);
  });
});

// ---------------------------------------------------------------------------
// Domain: clone rules — compatibility re-evaluation never removes products
// ---------------------------------------------------------------------------
describe('Clone rules — reevaluateSelectionsCompatibility', () => {
  it('flags (never removes) a product whose verticals do not include the destination vehicle vertical', () => {
    const { reevaluateSelectionsCompatibility } = modules.fleetBuildsDomain;
    const selections = { roof_lighting: [{ productId: 'valor', label: 'Valor', addedAt: 1 }] };
    const getProductVerticalIds = () => ['police'];

    const { selections: next, flagged } = reevaluateSelectionsCompatibility(selections, WORK_TRUCK_VEHICLE, getProductVerticalIds);

    assert.equal(next.roof_lighting.length, 1); // kept, not removed
    assert.equal(next.roof_lighting[0].incompatible, true);
    assert.deepEqual(flagged, [{ categoryId: 'roof_lighting', productId: 'valor', label: 'Valor' }]);
  });

  it('does not flag a product whose verticals include the destination vehicle vertical', () => {
    const { reevaluateSelectionsCompatibility } = modules.fleetBuildsDomain;
    const selections = { roof_lighting: [{ productId: 'valor', label: 'Valor', addedAt: 1 }] };
    const getProductVerticalIds = () => ['police'];

    const { selections: next, flagged } = reevaluateSelectionsCompatibility(selections, POLICE_VEHICLE, getProductVerticalIds);

    assert.equal(next.roof_lighting[0].incompatible, false);
    assert.deepEqual(flagged, []);
  });

  it('does not flag anything when there is no destination vehicle to compare against', () => {
    const { reevaluateSelectionsCompatibility } = modules.fleetBuildsDomain;
    const selections = { roof_lighting: [{ productId: 'valor', label: 'Valor', addedAt: 1 }] };
    const getProductVerticalIds = () => ['police'];

    const { selections: next, flagged } = reevaluateSelectionsCompatibility(selections, null, getProductVerticalIds);

    assert.equal(next.roof_lighting[0].incompatible, false);
    assert.deepEqual(flagged, []);
  });

  it('does not flag a product with unknown verticals — cannot positively confirm incompatibility', () => {
    const { reevaluateSelectionsCompatibility } = modules.fleetBuildsDomain;
    const selections = { roof_lighting: [{ productId: 'mystery', label: 'Mystery', addedAt: 1 }] };
    const getProductVerticalIds = () => null;

    const { selections: next, flagged } = reevaluateSelectionsCompatibility(selections, WORK_TRUCK_VEHICLE, getProductVerticalIds);

    assert.equal(next.roof_lighting[0].incompatible, false);
    assert.deepEqual(flagged, []);
  });
});

describe('Clone rules — cloneCategorySelections', () => {
  it('produces an independent copy — mutating the clone never affects the source', () => {
    const { cloneCategorySelections } = modules.fleetBuildsDomain;
    const selections = { siren: [{ productId: 's1', label: 'Siren', addedAt: 1 }] };

    const cloned = cloneCategorySelections(selections);
    cloned.siren.push({ productId: 's2', label: 'Siren 2', addedAt: 2 });
    cloned.siren[0].label = 'Mutated';

    assert.equal(selections.siren.length, 1);
    assert.equal(selections.siren[0].label, 'Siren');
  });
});

describe('Clone rules — cloneSourceFromBuild / cloneSourceFromTemplate', () => {
  it('adapts a build, carrying over its build style, selections, and templateId', () => {
    const { cloneSourceFromBuild } = modules.fleetBuildsDomain;
    const build = makeBuild({
      buildStyle: 'patrol',
      selections: { siren: [{ productId: 's1', label: 'Siren', addedAt: 1 }] },
      templateId: 'template-9',
    });

    const source = cloneSourceFromBuild(build);
    assert.equal(source.buildStyle, 'patrol');
    assert.deepEqual(source.selections, build.selections);
    assert.equal(source.templateId, 'template-9');
  });

  it('defaults templateId to null for a build with no lineage', () => {
    const { cloneSourceFromBuild } = modules.fleetBuildsDomain;
    assert.equal(cloneSourceFromBuild(makeBuild()).templateId, null);
  });

  it('adapts a template, setting templateId to the template\'s own id', () => {
    const { cloneSourceFromTemplate } = modules.fleetBuildsDomain;
    const template = makeTemplate({ id: 'template-5', buildStyle: 'supervisor' });

    const source = cloneSourceFromTemplate(template);
    assert.equal(source.buildStyle, 'supervisor');
    assert.deepEqual(source.selections, template.selections);
    assert.equal(source.templateId, 'template-5');
  });
});

describe('Clone rules — cloneFleetBuildFromSource', () => {
  it('creates a new build at the destination name/vehicle/quantity, copying build style and selections', () => {
    const { cloneFleetBuildFromSource, cloneSourceFromBuild } = modules.fleetBuildsDomain;
    const source = cloneSourceFromBuild(makeBuild({
      name: 'Patrol Fleet', buildStyle: 'patrol', vehicle: POLICE_VEHICLE, quantity: 2,
      selections: { roof_lighting: [{ productId: 'valor', label: 'Valor', addedAt: 1 }] },
    }));
    const destination = { name: 'Patrol Fleet (Clone)', vehicle: POLICE_VEHICLE, quantity: 5 };

    const { build, flaggedIncompatible } = cloneFleetBuildFromSource('new-id', 777, source, destination, () => ['police']);

    assert.equal(build.id, 'new-id');
    assert.equal(build.createdAt, 777);
    assert.equal(build.name, 'Patrol Fleet (Clone)');
    assert.deepEqual(build.vehicle, POLICE_VEHICLE);
    assert.equal(build.quantity, 5);
    assert.equal(build.buildStyle, 'patrol');
    assert.deepEqual(build.selections.roof_lighting.map((i) => i.productId), ['valor']);
    assert.equal(flaggedIncompatible.length, 0);
  });

  it('flags incompatible products against the destination vehicle without dropping them, and carries source.templateId', () => {
    const { cloneFleetBuildFromSource, cloneSourceFromTemplate } = modules.fleetBuildsDomain;
    const template = makeTemplate({
      id: 'template-7',
      selections: { roof_lighting: [{ productId: 'valor', label: 'Valor', addedAt: 1 }] },
    });
    const source = cloneSourceFromTemplate(template);
    const destination = { name: 'Work Truck Clone', vehicle: WORK_TRUCK_VEHICLE, quantity: 1 };

    const { build, flaggedIncompatible } = cloneFleetBuildFromSource('new-id', 1, source, destination, () => ['police']);

    assert.equal(build.selections.roof_lighting.length, 1);
    assert.equal(build.selections.roof_lighting[0].incompatible, true);
    assert.equal(build.templateId, 'template-7');
    assert.equal(flaggedIncompatible.length, 1);
    assert.equal(flaggedIncompatible[0].productId, 'valor');
  });

  it('allows an empty destination vehicle, producing a build with no flagged products', () => {
    const { cloneFleetBuildFromSource, cloneSourceFromBuild } = modules.fleetBuildsDomain;
    const source = cloneSourceFromBuild(makeBuild({ selections: { siren: [{ productId: 's1', label: 'Siren', addedAt: 1 }] } }));
    const destination = { name: 'No Vehicle Yet', vehicle: null, quantity: 1 };

    const { build, flaggedIncompatible } = cloneFleetBuildFromSource('new-id', 1, source, destination, () => ['police']);

    assert.equal(build.vehicle, null);
    assert.equal(build.selections.siren[0].incompatible, false);
    assert.equal(flaggedIncompatible.length, 0);
  });
});

describe('Clone rules — applyTemplateToBuild', () => {
  it('keeps the build\'s own vehicle when it already has one, and re-evaluates compatibility against it', () => {
    const { applyTemplateToBuild } = modules.fleetBuildsDomain;
    const build = makeBuild({ id: 'b1', name: 'My Build', quantity: 3, vehicle: WORK_TRUCK_VEHICLE });
    const template = makeTemplate({
      id: 'template-1', vehicle: POLICE_VEHICLE, buildStyle: 'patrol',
      selections: { roof_lighting: [{ productId: 'valor', label: 'Valor', addedAt: 1 }] },
    });

    const { build: updated, flaggedIncompatible } = applyTemplateToBuild(build, template, () => ['police']);

    assert.equal(updated.id, 'b1');
    assert.equal(updated.name, 'My Build');
    assert.equal(updated.quantity, 3);
    assert.deepEqual(updated.vehicle, WORK_TRUCK_VEHICLE); // build's own vehicle wins
    assert.equal(updated.buildStyle, 'patrol');
    assert.equal(updated.templateId, 'template-1');
    assert.equal(updated.selections.roof_lighting[0].incompatible, true);
    assert.equal(flaggedIncompatible.length, 1);
  });

  it('adopts the template\'s vehicle when the build has none yet', () => {
    const { applyTemplateToBuild } = modules.fleetBuildsDomain;
    const build = makeBuild({ id: 'b1', vehicle: null });
    const template = makeTemplate({ vehicle: POLICE_VEHICLE, selections: { roof_lighting: [{ productId: 'valor', label: 'Valor', addedAt: 1 }] } });

    const { build: updated } = applyTemplateToBuild(build, template, () => ['police']);

    assert.deepEqual(updated.vehicle, POLICE_VEHICLE);
    assert.equal(updated.selections.roof_lighting[0].incompatible, false);
  });
});

// ---------------------------------------------------------------------------
// Components: CloneBuildDialog
// ---------------------------------------------------------------------------
describe('CloneBuildDialog', () => {
  it('prefills the destination name from the source name and the quantity from the source quantity', () => {
    const { default: CloneBuildDialog } = modules.cloneBuildDialog;
    const html = renderPure(React.createElement(CloneBuildDialog, {
      sourceLabel: 'Build', sourceName: 'Patrol Fleet', sourceVehicle: POLICE_VEHICLE, sourceQuantity: 4,
      onClose: () => {}, onClone: () => {},
    }));

    assert.match(html, /value="Patrol Fleet \(Clone\)"/);
    assert.match(html, /value="4"/);
    assert.match(html, /Clone Build<\/span>/);
  });

  it('renders the destination vehicle year/make/model selects in a mobile-safe grid', () => {
    const { default: CloneBuildDialog } = modules.cloneBuildDialog;
    const html = renderPure(React.createElement(CloneBuildDialog, {
      sourceName: 'Any Build', onClose: () => {}, onClone: () => {},
    }));

    assert.match(html, /Destination Vehicle/);
    assert.match(html, /grid-cols-1 sm:grid-cols-3/);
  });

  it('summarizeCompatibilityResult reports a "could not complete" message for a null result', () => {
    const { summarizeCompatibilityResult } = modules.cloneBuildDialog;
    assert.match(summarizeCompatibilityResult(null, 'Applied').title, /Could not complete/);
  });

  it('summarizeCompatibilityResult reports a clean message when nothing was flagged', () => {
    const { summarizeCompatibilityResult } = modules.cloneBuildDialog;
    const summary = summarizeCompatibilityResult({ flaggedIncompatible: [] }, 'Cloned to "Tahoe Supervisor"');
    assert.equal(summary.title, 'Cloned to "Tahoe Supervisor"');
    assert.match(summary.description, /Every product is compatible/);
  });

  it('summarizeCompatibilityResult lists flagged product labels without implying removal', () => {
    const { summarizeCompatibilityResult } = modules.cloneBuildDialog;
    const summary = summarizeCompatibilityResult({
      flaggedIncompatible: [{ categoryId: 'roof_lighting', productId: 'valor', label: 'Valor' }],
    }, 'Applied "Explorer Patrol"');

    assert.equal(summary.title, 'Applied "Explorer Patrol"');
    assert.match(summary.description, /1 product flagged incompatible/);
    assert.match(summary.description, /kept, not removed/);
    assert.match(summary.description, /Valor/);
  });
});

// ---------------------------------------------------------------------------
// Components: FleetTemplateRow (pure, fixture-driven)
// ---------------------------------------------------------------------------
describe('FleetTemplateRow', () => {
  function noop() {}

  it('renders the template name, vehicle/style summary, usage count, and completion badge', () => {
    const { default: FleetTemplateRow } = modules.fleetTemplateRow;
    const template = makeTemplate({ name: 'Explorer Patrol', completionPercent: 75 });

    const html = renderPure(React.createElement(FleetTemplateRow, {
      template, buildsUsingTemplate: 3, onApply: noop, onClone: noop, onRename: noop, onDelete: noop,
    }));

    assert.match(html, /value="Explorer Patrol"/);
    assert.match(html, /2024 Ford Explorer PIU/);
    assert.match(html, /Patrol/);
    assert.match(html, /3 vehicles using this template/);
    assert.match(html, /75% Complete/);
  });

  it('renders singular "1 vehicle using this template" for exactly one build', () => {
    const { default: FleetTemplateRow } = modules.fleetTemplateRow;
    const html = renderPure(React.createElement(FleetTemplateRow, {
      template: makeTemplate(), buildsUsingTemplate: 1, onApply: noop, onClone: noop, onRename: noop, onDelete: noop,
    }));
    assert.match(html, /1 vehicle using this template/);
  });

  it('renders Apply Template, Clone, and Delete controls', () => {
    const { default: FleetTemplateRow } = modules.fleetTemplateRow;
    const html = renderPure(React.createElement(FleetTemplateRow, {
      template: makeTemplate(), buildsUsingTemplate: 0, onApply: noop, onClone: noop, onRename: noop, onDelete: noop,
    }));

    assert.match(html, /Apply Template/);
    assert.match(html, /Clone<\/button>/);
    assert.match(html, /aria-label="Delete Explorer Patrol"/);
  });
});

// ---------------------------------------------------------------------------
// Components: FleetTemplatesSection (connected) and FleetTemplatesWorkspaceSection (pure)
// ---------------------------------------------------------------------------
describe('FleetTemplatesSection (Fleet Build Workspace)', () => {
  it('renders an empty state when no templates have been saved yet', () => {
    const { default: FleetTemplatesSection } = modules.fleetTemplatesSection;
    const html = renderWithProviders(React.createElement(FleetTemplatesSection));

    assert.match(html, /Fleet Templates/);
    assert.match(html, /No saved templates yet/);
  });
});

describe('FleetTemplatesWorkspaceSection (/workspace)', () => {
  it('renders an empty state with an "Open Fleet Builds" CTA when there are no templates', () => {
    const { default: FleetTemplatesWorkspaceSection } = modules.fleetTemplatesWorkspaceSection;
    const html = renderPure(React.createElement(FleetTemplatesWorkspaceSection, { templates: [], builds: [], onOpenFleetBuilds: () => {} }));

    assert.match(html, /No saved templates yet/);
    assert.match(html, /Open Fleet Builds/);
  });

  it('renders the template count, average completion, recent templates, and vehicles-using-template counts', () => {
    const { default: FleetTemplatesWorkspaceSection } = modules.fleetTemplatesWorkspaceSection;
    const templates = [
      makeTemplate({ id: 't1', name: 'Explorer Patrol', completionPercent: 50, lastUsedAt: 200 }),
      makeTemplate({ id: 't2', name: 'Tahoe Supervisor', completionPercent: 100, lastUsedAt: 100 }),
    ];
    const builds = [makeBuild({ id: 'b1', templateId: 't1' }), makeBuild({ id: 'b2', templateId: 't1' })];

    const html = renderPure(React.createElement(FleetTemplatesWorkspaceSection, { templates, builds, onOpenFleetBuilds: () => {} }));

    assert.match(html, /Fleet Templates \(2\)/);
    assert.match(html, /Average completion across saved templates.*75%/s);
    assert.match(html, /Explorer Patrol/);
    assert.match(html, /Tahoe Supervisor/);
    assert.match(html, /2 vehicles using this template/);
    assert.match(html, /0 vehicles using this template/);
  });

  it('sorts recent templates by last-used time (falling back to createdAt), most recent first', () => {
    const { default: FleetTemplatesWorkspaceSection } = modules.fleetTemplatesWorkspaceSection;
    const templates = [
      makeTemplate({ id: 't1', name: 'Older Usage', lastUsedAt: 100, createdAt: 1 }),
      makeTemplate({ id: 't2', name: 'Newer Usage', lastUsedAt: 500, createdAt: 1 }),
    ];

    const html = renderPure(React.createElement(FleetTemplatesWorkspaceSection, { templates, builds: [], onOpenFleetBuilds: () => {} }));
    assert.ok(html.indexOf('Newer Usage') < html.indexOf('Older Usage'));
  });

  it('uses a mobile-safe responsive grid', () => {
    const { default: FleetTemplatesWorkspaceSection } = modules.fleetTemplatesWorkspaceSection;
    const html = renderPure(React.createElement(FleetTemplatesWorkspaceSection, { templates: [makeTemplate()], builds: [], onOpenFleetBuilds: () => {} }));
    assert.match(html, /grid-cols-1 md:grid-cols-2/);
  });
});

// ---------------------------------------------------------------------------
// Product Detail: Finish Your Upfit panel template additions
// ---------------------------------------------------------------------------
describe('Finish Your Upfit panel — template actions', () => {
  it('shows "No template applied" when the active build has no applied template', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = makeBuild({ buildStyle: 'patrol' });

    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild], activeBuild, product: { id: 'navigator', title: 'Navigator' },
      templates: [], appliedTemplate: null,
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {}, onApplyTemplate: () => {}, onCloneActiveBuild: () => {},
    }));

    assert.match(html, /Current Template/);
    assert.match(html, /No template applied to this build yet/);
    assert.match(html, /Clone Current Build/);
  });

  it('shows the applied template\'s name when the active build has one', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = makeBuild({ buildStyle: 'patrol', templateId: 'template-1' });
    const appliedTemplate = makeTemplate({ id: 'template-1', name: 'Explorer Patrol' });

    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild], activeBuild, product: { id: 'navigator', title: 'Navigator' },
      templates: [appliedTemplate], appliedTemplate,
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {}, onApplyTemplate: () => {}, onCloneActiveBuild: () => {},
    }));

    assert.match(html, /Explorer Patrol/);
    assert.match(html, /Select a template to apply/);
  });

  it('omits the Apply Template picker when there are no saved templates', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = makeBuild({ buildStyle: 'patrol' });

    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild], activeBuild, product: { id: 'navigator', title: 'Navigator' },
      templates: [], appliedTemplate: null,
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {}, onApplyTemplate: () => {}, onCloneActiveBuild: () => {},
    }));

    assert.doesNotMatch(html, /Select a template to apply/);
  });
});

// ---------------------------------------------------------------------------
// FleetBuildCard: Save as Template / Clone Build actions and incompatibility flag
// ---------------------------------------------------------------------------
describe('FleetBuildCard — Fleet Templates & Vehicle Cloning additions', () => {
  function noop() {}

  it('renders Save as Template and Clone Build actions', () => {
    const { default: FleetBuildCard } = modules.fleetBuildCard;
    const html = renderPure(React.createElement(FleetBuildCard, {
      build: makeBuild(), isActive: false, onSetActive: noop, onRemove: noop, onRename: noop,
      onUpdateVehicle: noop, onUpdateQuantity: noop, onUpdateStyle: noop, onRemoveProduct: noop,
      onSaveAsTemplate: noop, onCloneBuild: noop,
    }));

    assert.match(html, /Save as Template/);
    assert.match(html, /Clone Build/);
  });

  it('flags an incompatible product visibly without removing it from the selected list', () => {
    const { default: FleetBuildCard } = modules.fleetBuildCard;
    const build = makeBuild({
      selections: {
        roof_lighting: [
          { productId: 'valor', label: 'Valor Light Bar', addedAt: 1, incompatible: true },
          { productId: 'other', label: 'Other Light', addedAt: 2, incompatible: false },
        ],
      },
    });

    const html = renderPure(React.createElement(FleetBuildCard, {
      build, isActive: false, onSetActive: noop, onRemove: noop, onRename: noop,
      onUpdateVehicle: noop, onUpdateQuantity: noop, onUpdateStyle: noop, onRemoveProduct: noop,
      onSaveAsTemplate: noop, onCloneBuild: noop,
    }));

    assert.match(html, /Valor Light Bar/);
    assert.match(html, /Other Light/);
    assert.match(html, /Incompatible with selected vehicle\./);
    // Both products remain present — the flag never removes a product.
    assert.match(html, /aria-label="Remove Valor Light Bar from Roof Lighting"/);
    assert.match(html, /aria-label="Remove Other Light from Roof Lighting"/);
  });
});

// ---------------------------------------------------------------------------
// Composition — new surfaces wire together without breaking existing ones
// ---------------------------------------------------------------------------
describe('Composition — Fleet Templates & Vehicle Cloning wiring', () => {
  it('source: App.jsx mounts FleetTemplatesProvider', () => {
    const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
    assert.match(source, /import \{ FleetTemplatesProvider \} from '@\/context\/FleetTemplatesContext'/);
    assert.match(source, /<FleetTemplatesProvider>/);
  });

  it('source: FleetBuildsPanel renders the Fleet Templates section', () => {
    const source = readFileSync(new URL('../src/components/fleetBuilds/FleetBuildsPanel.jsx', import.meta.url), 'utf8');
    assert.match(source, /import FleetTemplatesSection from '\.\/FleetTemplatesSection'/);
    assert.match(source, /<FleetTemplatesSection/);
  });

  it('source: WorkspaceDashboard renders the Fleet Templates workspace section', () => {
    const source = readFileSync(new URL('../src/pages/WorkspaceDashboard.jsx', import.meta.url), 'utf8');
    assert.match(source, /import FleetTemplatesWorkspaceSection from '@\/components\/fleetBuilds\/FleetTemplatesWorkspaceSection'/);
    assert.match(source, /<FleetTemplatesWorkspaceSection/);
  });

  it('source: FinishYourUpfitPanel wires Apply Template and Clone Current Build', () => {
    const source = readFileSync(new URL('../src/components/fleetBuilds/FinishYourUpfitPanel.jsx', import.meta.url), 'utf8');
    assert.match(source, /Clone Current Build/);
    assert.match(source, /applyTemplate/);
  });

  it('WorkspaceDashboardView renders the Fleet Templates section alongside Fleet Builds', () => {
    const { WorkspaceDashboardView } = modules.workspacePage;
    const html = renderWithProviders(React.createElement(WorkspaceDashboardView, {
      savedProducts: [], recentlyViewedProducts: [], compareProducts: [], fleetBuilds: [], fleetTemplates: [],
      cartSummary: null, cartLoading: false, selectedVehicle: null,
      configuratorState: { selectedFamily: null, accessories: [] },
      onClearSaved: () => {}, onClearRecentlyViewed: () => {}, onRemoveFromCompare: () => {}, onClearCompare: () => {},
      onOpenVehicleModal: () => {}, onOpenFleetBuilds: () => {},
    }), ['/workspace']);

    assert.match(html, /Fleet Templates/);
  });
});

// ---------------------------------------------------------------------------
// Mobile-safe structure
// ---------------------------------------------------------------------------
describe('Mobile-safe structure', () => {
  it('CloneBuildDialog stacks the destination vehicle picker to one column below the sm breakpoint', () => {
    const { default: CloneBuildDialog } = modules.cloneBuildDialog;
    const html = renderPure(React.createElement(CloneBuildDialog, { sourceName: 'Any', onClose: () => {}, onClone: () => {} }));
    assert.match(html, /grid-cols-1 sm:grid-cols-3/);
  });

  it('FleetTemplatesWorkspaceSection stacks to one column on mobile before widening to 2 columns', () => {
    const { default: FleetTemplatesWorkspaceSection } = modules.fleetTemplatesWorkspaceSection;
    const html = renderPure(React.createElement(FleetTemplatesWorkspaceSection, { templates: [makeTemplate()], builds: [], onOpenFleetBuilds: () => {} }));
    assert.match(html, /grid-cols-1 md:grid-cols-2/);
  });
});
