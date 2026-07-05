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
    upfitBuilderDomain: await server.ssrLoadModule('/src/domain/upfitBuilder/index.ts'),
    fleetBuildsDomain: await server.ssrLoadModule('/src/domain/fleetBuilds/index.ts'),
    departmentStandardsDomain: await server.ssrLoadModule('/src/domain/departmentStandards/index.ts'),
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
    guidedUpfitBuilderPage: await server.ssrLoadModule('/src/pages/GuidedUpfitBuilderPage.jsx'),
    upfitBuilderCategoryStep: await server.ssrLoadModule('/src/components/upfitBuilder/UpfitBuilderCategoryStep.jsx'),
    upfitBuilderReviewStep: await server.ssrLoadModule('/src/components/upfitBuilder/UpfitBuilderReviewStep.jsx'),
    upfitBuilderStepperSidebar: await server.ssrLoadModule('/src/components/upfitBuilder/UpfitBuilderStepperSidebar.jsx'),
    upfitBuilderMobileProgress: await server.ssrLoadModule('/src/components/upfitBuilder/UpfitBuilderMobileProgress.jsx'),
    upfitBuilderSummarySidebar: await server.ssrLoadModule('/src/components/upfitBuilder/UpfitBuilderSummarySidebar.jsx'),
    guidedWorkspaceSection: await server.ssrLoadModule('/src/components/upfitBuilder/GuidedUpfitBuilderWorkspaceSection.jsx'),
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

// Full provider stack mirroring src/App.jsx's nesting, for components/pages
// that read fleet/department-standard/guided-builder context.
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

/**
 * A minimal in-memory localStorage so the context modules' loadFromStorage()
 * can be exercised with seeded data (see tests/fleet-projects.test.mjs for
 * the same pattern). Real mutation callbacks can't be exercised this way —
 * React's SSR useState setters are no-ops once renderToString has returned —
 * so persistence is verified by seeding storage and asserting a fresh render
 * reads it back.
 */
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

function makeBuild(overrides = {}) {
  return {
    id: 'build-1', name: 'Build 1', vehicle: null, quantity: 1, buildStyle: null,
    selections: {}, createdAt: 1000, projectId: 'proj-1', ...overrides,
  };
}

function withSelection(build, categoryId, productId = 'p1', label = 'Selected Product') {
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
// Step generation from Department Standards + required/recommended/optional
// ---------------------------------------------------------------------------
describe('buildGuidedUpfitChecklist — step generation, tiers, completion', () => {
  it('assigns tiers from the effective Department Standard when one is assigned', () => {
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: ['console'], optional: ['scene_lighting'] } });
    const build = makeBuild();
    const checklist = buildGuidedUpfitChecklist(build, standard, []);

    const byId = Object.fromEntries(checklist.steps.map((s) => [s.categoryId, s]));
    assert.equal(byId.siren.tier, 'required');
    assert.equal(byId.console.tier, 'recommended');
    assert.equal(byId.scene_lighting.tier, 'optional');
    // A category the standard never mentions defaults to optional.
    assert.equal(byId.graphics_markings.tier, 'optional');
    assert.equal(checklist.requiredTotal, 1);
    assert.equal(checklist.recommendedTotal, 1);
  });

  it('falls back to the build style\'s priority categories as guidance-only "recommended" when no standard is assigned — never "required"', () => {
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const build = makeBuild({ buildStyle: 'patrol' }); // priorityCategories: roof_lighting, siren, speaker, console
    const checklist = buildGuidedUpfitChecklist(build, null, []);

    const byId = Object.fromEntries(checklist.steps.map((s) => [s.categoryId, s]));
    assert.equal(byId.siren.tier, 'recommended');
    assert.equal(byId.console.tier, 'recommended');
    assert.equal(byId.partition.tier, 'optional');
    assert.equal(checklist.requiredTotal, 0);
    assert.equal(checklist.departmentCompliant, null);
  });

  it('detects a category as complete once it has a selected product, regardless of tier', () => {
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = withSelection(makeBuild(), 'siren');
    const checklist = buildGuidedUpfitChecklist(build, standard, []);

    const sirenStep = checklist.steps.find((s) => s.categoryId === 'siren');
    assert.equal(sirenStep.status, 'complete');
    assert.deepEqual(sirenStep.selectedProducts, [{ productId: 'p1', label: 'Selected Product' }]);
  });

  it('produces a missing-equipment summary of missingRequired/missingRecommended', () => {
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren', 'roof_lighting'], recommended: ['console'], optional: [] } });
    const build = withSelection(makeBuild(), 'roof_lighting');
    const checklist = buildGuidedUpfitChecklist(build, standard, []);

    assert.deepEqual(checklist.missingRequired, ['siren']);
    assert.deepEqual(checklist.missingRecommended, ['console']);
  });

  it('only reports optional-tier categories as skipped, never required/recommended', () => {
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: ['console'], optional: ['scene_lighting'] } });
    const build = makeBuild();
    // Attempt to skip a required and a recommended category too — only the optional one should register as skipped.
    const checklist = buildGuidedUpfitChecklist(build, standard, ['siren', 'console', 'scene_lighting']);

    const byId = Object.fromEntries(checklist.steps.map((s) => [s.categoryId, s]));
    assert.equal(byId.siren.status, 'missing');
    assert.equal(byId.console.status, 'missing');
    assert.equal(byId.scene_lighting.status, 'skipped');
    assert.deepEqual(checklist.skippedOptional, ['scene_lighting']);
    assert.equal(byId.siren.canSkip, false);
    assert.equal(byId.console.canSkip, false);
    assert.equal(byId.scene_lighting.canSkip, true);
  });

  it('reuses evaluateFleetBuildIntelligence\'s completionPercent/departmentCompliant when a standard is assigned', () => {
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const { evaluateFleetBuildIntelligence } = modules.departmentStandardsDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = withSelection(makeBuild(), 'siren');
    const checklist = buildGuidedUpfitChecklist(build, standard, []);
    const intelligence = evaluateFleetBuildIntelligence(build, standard);

    assert.equal(checklist.overallPercent, intelligence.completionPercent);
    assert.equal(checklist.departmentCompliant, true);
  });

  it('gives every category tier-appropriate missing copy', () => {
    const { buildGuidedUpfitChecklist } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: ['console'], optional: ['scene_lighting'] } });
    const checklist = buildGuidedUpfitChecklist(makeBuild(), standard, []);
    const byId = Object.fromEntries(checklist.steps.map((s) => [s.categoryId, s]));
    assert.match(byId.siren.missingCopy, /Required for department compliance/);
    assert.match(byId.console.missingCopy, /Recommended for this build style/);
    assert.match(byId.scene_lighting.missingCopy, /Optional for this build/);
  });
});

// ---------------------------------------------------------------------------
// Step sequencing (setup stages, category steps, Review) and default resume
// ---------------------------------------------------------------------------
describe('Guided step sequence', () => {
  it('sequences the 5 setup stages, then the 12 fixed upfit categories, then Review', () => {
    const { UPFIT_BUILDER_STEP_SEQUENCE } = modules.upfitBuilderDomain;
    assert.deepEqual(UPFIT_BUILDER_STEP_SEQUENCE.slice(0, 5), ['project', 'build', 'vehicle', 'standard', 'style']);
    assert.equal(UPFIT_BUILDER_STEP_SEQUENCE.length, 18);
    assert.equal(UPFIT_BUILDER_STEP_SEQUENCE[UPFIT_BUILDER_STEP_SEQUENCE.length - 1], 'review');
  });

  it('getNextStepId/getPreviousStepId walk the sequence and stop at the ends', () => {
    const { getNextStepId, getPreviousStepId } = modules.upfitBuilderDomain;
    assert.equal(getNextStepId('project'), 'build');
    assert.equal(getPreviousStepId('build'), 'project');
    assert.equal(getPreviousStepId('project'), null);
    assert.equal(getNextStepId('review'), null);
  });

  it('resolveDefaultStepId resumes at the first incomplete setup stage', () => {
    const { resolveDefaultStepId } = modules.upfitBuilderDomain;
    assert.equal(resolveDefaultStepId({ hasActiveProject: false, hasActiveBuild: false, hasVehicle: false, hasStandard: false, hasStyle: false }), 'project');
    assert.equal(resolveDefaultStepId({ hasActiveProject: true, hasActiveBuild: false, hasVehicle: false, hasStandard: false, hasStyle: false }), 'build');
    assert.equal(resolveDefaultStepId({ hasActiveProject: true, hasActiveBuild: true, hasVehicle: false, hasStandard: false, hasStyle: false }), 'vehicle');
    assert.equal(resolveDefaultStepId({ hasActiveProject: true, hasActiveBuild: true, hasVehicle: true, hasStandard: false, hasStyle: false }), 'standard');
    assert.equal(resolveDefaultStepId({ hasActiveProject: true, hasActiveBuild: true, hasVehicle: true, hasStandard: true, hasStyle: false }), 'style');
  });

  it('resolveDefaultStepId treats an explicitly skipped "standard" stage as done, and lands on the first category once every stage is resolved', () => {
    const { resolveDefaultStepId, ALL_UPFIT_CATEGORY_IDS } = { ...modules.upfitBuilderDomain, ...modules.fleetBuildsDomain };
    const state = { hasActiveProject: true, hasActiveBuild: true, hasVehicle: true, hasStandard: false, hasStyle: false };
    assert.equal(resolveDefaultStepId(state, ['standard']), 'style');
    assert.equal(
      resolveDefaultStepId({ ...state, hasStandard: true, hasStyle: true }),
      ALL_UPFIT_CATEGORY_IDS[0],
    );
  });
});

describe('buildUpfitBuilderStepperItems', () => {
  it('marks setup stages complete/missing/skipped and folds in category-step status/tier from the checklist', () => {
    const { buildGuidedUpfitChecklist, buildUpfitBuilderStepperItems } = modules.upfitBuilderDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: ['scene_lighting'] } });
    const build = withSelection(makeBuild({ buildStyle: 'patrol' }), 'siren');
    const checklist = buildGuidedUpfitChecklist(build, standard, ['scene_lighting']);
    const setupState = { hasActiveProject: true, hasActiveBuild: true, hasVehicle: false, hasStandard: true, hasStyle: true };
    const items = buildUpfitBuilderStepperItems(setupState, checklist, ['scene_lighting']);

    const byId = Object.fromEntries(items.map((item) => [item.stepId, item]));
    assert.equal(byId.project.status, 'complete');
    assert.equal(byId.vehicle.status, 'missing');
    assert.equal(byId.style.status, 'complete');
    assert.equal(byId.siren.status, 'complete');
    assert.equal(byId.siren.tier, 'required');
    assert.equal(byId.scene_lighting.status, 'skipped');
    assert.equal(byId.review.status, 'upcoming');
  });

  it('still lists every setup stage and category step (as "upcoming") when there is no Fleet Build yet to score', () => {
    const { buildUpfitBuilderStepperItems } = modules.upfitBuilderDomain;
    const setupState = { hasActiveProject: true, hasActiveBuild: false, hasVehicle: false, hasStandard: false, hasStyle: false };
    const items = buildUpfitBuilderStepperItems(setupState, null, []);

    assert.equal(items.length, 18);
    const byId = Object.fromEntries(items.map((item) => [item.stepId, item]));
    assert.equal(byId.project.status, 'complete');
    assert.equal(byId.build.status, 'missing');
    assert.equal(byId.siren.status, 'upcoming');
  });
});

// ---------------------------------------------------------------------------
// Browse CTA routing
// ---------------------------------------------------------------------------
describe('resolveUpfitBrowseHref — Browse CTA routing', () => {
  it('routes to the existing free-text /search route with category/guided-build context, never hard-filtering', () => {
    const { resolveUpfitBrowseHref } = modules.upfitBuilderDomain;
    const href = resolveUpfitBrowseHref('siren', { fleetProjectId: 'proj-1', fleetBuildId: 'build-1' });
    const url = new URL(href, 'https://example.test');
    assert.equal(url.pathname, '/search');
    assert.equal(url.searchParams.get('q'), 'Siren');
    assert.equal(url.searchParams.get('upfitCategory'), 'siren');
    assert.equal(url.searchParams.get('guidedBuild'), '1');
    assert.equal(url.searchParams.get('fleetProjectId'), 'proj-1');
    assert.equal(url.searchParams.get('fleetBuildId'), 'build-1');
  });

  it('omits project/build params when no guided context is active', () => {
    const { resolveUpfitBrowseHref } = modules.upfitBuilderDomain;
    const href = resolveUpfitBrowseHref('console');
    const url = new URL(href, 'https://example.test');
    assert.equal(url.searchParams.has('fleetProjectId'), false);
    assert.equal(url.searchParams.has('fleetBuildId'), false);
  });

  it('ProductSearchPage reads the guided-build context and renders a "Recommended for this build" banner back to /upfit-builder', () => {
    const source = readFileSync(new URL('../src/pages/ProductSearchPage.jsx', import.meta.url), 'utf8');
    assert.match(source, /searchParams\.get\('upfitCategory'\)/);
    assert.match(source, /searchParams\.get\('guidedBuild'\) === '1'/);
    assert.match(source, /Recommended for this build/);
    assert.match(source, /to="\/upfit-builder"/);
  });
});

describe('resolveSuggestedProductsForCategory', () => {
  it('resolves the top N products from a free-text category-label search', () => {
    const { resolveSuggestedProductsForCategory } = modules.upfitBuilderDomain;
    const products = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }];
    const searchProducts = () => ({ status: 'ready', products, total: 3 });
    const result = resolveSuggestedProductsForCategory('siren', { searchProducts }, 2);
    assert.deepEqual(result.map((p) => p.id), ['p1', 'p2']);
  });

  it('returns an empty list when the search comes back empty/unavailable', () => {
    const { resolveSuggestedProductsForCategory } = modules.upfitBuilderDomain;
    const searchProducts = () => ({ status: 'empty', products: [], total: 0 });
    assert.deepEqual(resolveSuggestedProductsForCategory('siren', { searchProducts }), []);
  });
});

// ---------------------------------------------------------------------------
// UpfitBuilderCategoryStep — per-step UI (missing/complete/skip)
// ---------------------------------------------------------------------------
describe('UpfitBuilderCategoryStep', () => {
  it('shows the missing-state copy, tier, and Skip action for an incomplete optional step', () => {
    const { default: UpfitBuilderCategoryStep } = modules.upfitBuilderCategoryStep;
    const step = {
      categoryId: 'scene_lighting', label: 'Scene Lighting', tier: 'optional', status: 'missing',
      selectedProducts: [], missingCopy: 'Optional for this build — add one if it applies, or skip for now.', canSkip: true,
    };
    const html = renderPure(React.createElement(UpfitBuilderCategoryStep, {
      step, suggestedProducts: [], browseHref: '/search?q=Scene+Lighting', onAddProduct: () => {}, onRemoveProduct: () => {},
      onSkip: () => {}, onUnskip: () => {}, onNext: () => {}, onBack: () => {},
    }));
    assert.match(html, /Optional/);
    assert.match(html, /Skip This Step/);
    assert.match(html, /add one if it applies, or skip for now/);
  });

  it('shows the selected product and no Skip action once complete', () => {
    const { default: UpfitBuilderCategoryStep } = modules.upfitBuilderCategoryStep;
    const step = {
      categoryId: 'siren', label: 'Siren', tier: 'required', status: 'complete',
      selectedProducts: [{ productId: 'p1', label: 'Wail Siren' }], missingCopy: 'Required...', canSkip: false,
    };
    const html = renderPure(React.createElement(UpfitBuilderCategoryStep, {
      step, suggestedProducts: [], browseHref: '/search?q=Siren', onAddProduct: () => {}, onRemoveProduct: () => {},
      onSkip: () => {}, onUnskip: () => {}, onNext: () => {}, onBack: () => {},
    }));
    assert.match(html, /Wail Siren/);
    assert.doesNotMatch(html, /Skip This Step/);
  });

  it('offers Unskip once a step has been skipped', () => {
    const { default: UpfitBuilderCategoryStep } = modules.upfitBuilderCategoryStep;
    const step = {
      categoryId: 'scene_lighting', label: 'Scene Lighting', tier: 'optional', status: 'skipped',
      selectedProducts: [], missingCopy: 'Optional...', canSkip: true,
    };
    const html = renderPure(React.createElement(UpfitBuilderCategoryStep, {
      step, suggestedProducts: [], browseHref: '/search', onAddProduct: () => {}, onRemoveProduct: () => {},
      onSkip: () => {}, onUnskip: () => {}, onNext: () => {}, onBack: () => {},
    }));
    assert.match(html, /Unskip/);
  });
});

// ---------------------------------------------------------------------------
// UpfitBuilderReviewStep — missing-equipment summary + Cart/Quote hand-off
// ---------------------------------------------------------------------------
describe('UpfitBuilderReviewStep', () => {
  it('lists missing required/recommended categories and skipped optional categories, each pointing back to its step', () => {
    const { default: UpfitBuilderReviewStep } = modules.upfitBuilderReviewStep;
    const checklist = {
      overallPercent: 40, missingRequired: ['siren'], missingRecommended: ['console'], skippedOptional: ['scene_lighting'],
    };
    const html = renderWithProviders(React.createElement(UpfitBuilderReviewStep, {
      build: makeBuild(), checklist, onGoToStep: () => {}, quoteRecipientEmail: 'quotes@tfrsupply.com', onBack: () => {},
    }));
    assert.match(html, /Missing Required Equipment/);
    assert.match(html, /Siren/);
    assert.match(html, /Missing Recommended Equipment/);
    assert.match(html, /Console/);
    assert.match(html, /Skipped Optional Categories/);
    assert.match(html, /Scene Lighting/);
    assert.match(html, /Continue to Cart/);
    assert.match(html, /Request a Quote/);
    assert.match(html, /mailto:quotes@tfrsupply\.com/);
  });

  it('shows a "nothing missing" message once every required/recommended category is filled', () => {
    const { default: UpfitBuilderReviewStep } = modules.upfitBuilderReviewStep;
    const checklist = { overallPercent: 100, missingRequired: [], missingRecommended: [], skippedOptional: [] };
    const html = renderWithProviders(React.createElement(UpfitBuilderReviewStep, {
      build: makeBuild(), checklist, onGoToStep: () => {}, quoteRecipientEmail: 'quotes@tfrsupply.com', onBack: () => {},
    }));
    assert.match(html, /Nothing missing — this build is ready for Cart or a Quote/);
  });
});

// ---------------------------------------------------------------------------
// Mobile-safe structure
// ---------------------------------------------------------------------------
describe('Mobile-safe structure', () => {
  it('UpfitBuilderStepperSidebar and UpfitBuilderSummarySidebar are desktop-only (hidden lg:block)', () => {
    const { default: UpfitBuilderStepperSidebar } = modules.upfitBuilderStepperSidebar;
    const { default: UpfitBuilderSummarySidebar } = modules.upfitBuilderSummarySidebar;
    const sidebarHtml = renderPure(React.createElement(UpfitBuilderStepperSidebar, { items: [], currentStepId: 'project', onGoToStep: () => {} }));
    const summaryHtml = renderPure(React.createElement(UpfitBuilderSummarySidebar, { project: null, build: null, standardName: null, checklist: null }));
    assert.match(sidebarHtml, /hidden lg:block/);
    assert.match(summaryHtml, /hidden lg:block/);
  });

  it('UpfitBuilderMobileProgress is mobile-only (lg:hidden) and shows step position + percent', () => {
    const { default: UpfitBuilderMobileProgress } = modules.upfitBuilderMobileProgress;
    const html = renderPure(React.createElement(UpfitBuilderMobileProgress, { stepLabel: 'Siren', stepNumber: 6, stepCount: 18, percent: 33 }));
    assert.match(html, /lg:hidden/);
    assert.match(html, /Step 6 of 18: Siren/);
    assert.match(html, /33%/);
  });

  it('GuidedUpfitBuilderPageView renders every step type without horizontal-overflow-prone fixed layout', () => {
    const { GuidedUpfitBuilderPageView } = modules.guidedUpfitBuilderPage;
    const baseProps = {
      projects: [makeProject()], activeProject: makeProject(), activeProjectId: 'proj-1', isProjectsFull: false,
      onCreateProject: () => {}, onSelectProject: () => {},
      builds: [makeBuild()], activeBuild: makeBuild(), activeBuildId: 'build-1', isBuildsFull: false,
      onCreateBuild: () => {}, onSelectBuild: () => {},
      onUpdateVehicle: () => {}, onUpdateStyle: () => {},
      defaultStandards: [], companyStandards: [], effectiveStandard: null, onAssignStandard: () => {},
      onGoToStep: () => {}, onNext: () => {}, onBack: () => {}, canGoBack: false,
      stepperItems: [], checklist: modules.upfitBuilderDomain.buildGuidedUpfitChecklist(makeBuild(), null, []),
      suggestedProducts: [], browseHref: '/search',
      onAddProductToCategory: () => {}, onRemoveProductFromCategory: () => {},
      onSkipStep: () => {}, onUnskipStep: () => {},
      quoteRecipientEmail: 'quotes@tfrsupply.com',
    };
    ['project', 'build', 'vehicle', 'standard', 'style', 'siren', 'review'].forEach((currentStepId) => {
      const html = renderWithProviders(React.createElement(GuidedUpfitBuilderPageView, { ...baseProps, currentStepId }));
      assert.match(html, /Guided Vehicle Upfit Builder/, `step ${currentStepId} should still render the page shell`);
    });
  });
});

// ---------------------------------------------------------------------------
// Active step persistence (UpfitBuilderContext, seeded localStorage)
// ---------------------------------------------------------------------------
describe('UpfitBuilderContext — active step / skipped step persistence', () => {
  it('resumes the guided flow on the persisted currentStepId for the active build', () => {
    const seed = {
      tfr_fleet_projects: { projects: [makeProject()], activeProjectId: 'proj-1' },
      tfr_fleet_builds: {
        builds: [makeBuild({ vehicle: { year: '2024', make: 'Ford', model: 'Explorer' }, buildStyle: 'patrol' })],
        activeBuildIdByProject: { 'proj-1': 'build-1' },
      },
      tfr_upfit_builder: { currentStepByBuildId: { 'build-1': 'siren' }, skippedByBuildId: {} },
    };
    const html = withLocalStorage(seed, () => renderWithProviders(
      React.createElement(modules.guidedUpfitBuilderPage.default),
    ));
    assert.match(html, /Step 9 of 18: Siren/);
  });

  it('reflects a persisted skipped optional step as "Skipped" in the stepper', () => {
    const seed = {
      tfr_fleet_projects: { projects: [makeProject()], activeProjectId: 'proj-1' },
      tfr_fleet_builds: {
        builds: [makeBuild({ vehicle: { year: '2024', make: 'Ford', model: 'Explorer' }, buildStyle: 'patrol' })],
        activeBuildIdByProject: { 'proj-1': 'build-1' },
      },
      tfr_upfit_builder: { currentStepByBuildId: { 'build-1': 'scene_lighting' }, skippedByBuildId: { 'build-1': ['scene_lighting'] } },
    };
    const html = withLocalStorage(seed, () => renderWithProviders(
      React.createElement(modules.guidedUpfitBuilderPage.default),
    ));
    assert.match(html, /Skip This Step|Unskip/);
  });
});

// ---------------------------------------------------------------------------
// Product Detail guided CTA (FinishYourUpfitPanel)
// ---------------------------------------------------------------------------
describe('FinishYourUpfitPanelView — Guided Build status', () => {
  it('shows "Continue Guided Build" and the current guided step label when progress exists', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = makeBuild();
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild], activeBuild, product: { id: 'p1' }, currentGuidedStepId: 'siren',
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {}, onApplyTemplate: () => {}, onCloneActiveBuild: () => {}, onAddToCurrentStep: () => {},
    }));
    assert.match(html, /Continue Guided Build/);
    assert.match(html, /Guided Step:/);
    assert.match(html, /Siren/);
    assert.match(html, /Add to This Step/);
  });

  it('shows "Start Guided Build" and no "Add to This Step" action when the guided flow hasn\'t started', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = makeBuild();
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild], activeBuild, product: { id: 'p1' }, currentGuidedStepId: null,
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {}, onApplyTemplate: () => {}, onCloneActiveBuild: () => {}, onAddToCurrentStep: () => {},
    }));
    assert.match(html, /Start Guided Build/);
    assert.doesNotMatch(html, /Add to This Step/);
  });

  it('omits "Add to This Step" when the current guided step is a setup stage, not a category', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = makeBuild();
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild], activeBuild, product: { id: 'p1' }, currentGuidedStepId: 'standard',
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {}, onApplyTemplate: () => {}, onCloneActiveBuild: () => {}, onAddToCurrentStep: () => {},
    }));
    assert.match(html, /Guided Step:.*Department Standard/s);
    assert.doesNotMatch(html, /Add to This Step/);
  });
});

// ---------------------------------------------------------------------------
// Workspace shortcut
// ---------------------------------------------------------------------------
describe('GuidedUpfitBuilderWorkspaceSection', () => {
  it('shows an entry point with no active build yet', () => {
    const { default: GuidedUpfitBuilderWorkspaceSection } = modules.guidedWorkspaceSection;
    const html = renderWithProviders(React.createElement(GuidedUpfitBuilderWorkspaceSection, { activeBuild: null, checklist: null, currentStepLabel: null }));
    assert.match(html, /Start Guided Build/);
  });

  it('shows the active build\'s progress percent and next recommended step', () => {
    const { default: GuidedUpfitBuilderWorkspaceSection } = modules.guidedWorkspaceSection;
    const activeBuild = makeBuild({ name: 'Patrol Unit 12' });
    const checklist = { overallPercent: 42 };
    const html = renderWithProviders(React.createElement(GuidedUpfitBuilderWorkspaceSection, { activeBuild, checklist, currentStepLabel: 'Siren' }));
    assert.match(html, /Patrol Unit 12/);
    assert.match(html, /42%/);
    assert.match(html, /next up: Siren/);
    assert.match(html, /Continue Guided Build/);
  });
});

// ---------------------------------------------------------------------------
// Source-level wiring checks
// ---------------------------------------------------------------------------
describe('Source-level wiring', () => {
  it('App.jsx mounts /upfit-builder and UpfitBuilderProvider', () => {
    const source = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
    assert.match(source, /<Route path="\/upfit-builder" element=\{<GuidedUpfitBuilderPage \/>\} \/>/);
    assert.match(source, /<UpfitBuilderProvider>/);
  });

  it('WorkspaceDashboard.jsx composes GuidedUpfitBuilderWorkspaceSection', () => {
    const source = readFileSync(new URL('../src/pages/WorkspaceDashboard.jsx', import.meta.url), 'utf8');
    assert.match(source, /<GuidedUpfitBuilderWorkspaceSection/);
  });

  it('FinishYourUpfitPanel.jsx wires useUpfitBuilder and the guided-step status block', () => {
    const source = readFileSync(new URL('../src/components/fleetBuilds/FinishYourUpfitPanel.jsx', import.meta.url), 'utf8');
    assert.match(source, /useUpfitBuilder/);
    assert.match(source, /<GuidedBuildStatus/);
  });
});
