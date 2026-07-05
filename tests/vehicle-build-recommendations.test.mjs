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
    recommendationsDomain: await server.ssrLoadModule('/src/domain/recommendations/index.ts'),
    catalog: await server.ssrLoadModule('/src/services/catalog/catalogService.ts'),
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
    recommendationCard: await server.ssrLoadModule('/src/components/recommendations/RecommendationCard.jsx'),
    upfitBuilderCategoryStep: await server.ssrLoadModule('/src/components/upfitBuilder/UpfitBuilderCategoryStep.jsx'),
    finishYourUpfitPanel: await server.ssrLoadModule('/src/components/fleetBuilds/FinishYourUpfitPanel.jsx'),
    productIntelligencePanel: await server.ssrLoadModule('/src/components/product/ProductIntelligencePanel.jsx'),
    recommendedNextActionsSection: await server.ssrLoadModule('/src/components/workspace/RecommendedNextActionsSection.jsx'),
    productSearchPage: await server.ssrLoadModule('/src/pages/ProductSearchPage.jsx'),
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

function makeBuild(overrides = {}) {
  return {
    id: 'build-1', name: 'Build 1', vehicle: null, quantity: 1, buildStyle: null,
    selections: {}, createdAt: 1000, projectId: 'proj-1', ...overrides,
  };
}

function withSelection(build, categoryId, productId = 'p1', label = 'Selected Product', incompatible) {
  const selection = { productId, label, addedAt: 1000 };
  if (incompatible !== undefined) selection.incompatible = incompatible;
  return { ...build, selections: { ...build.selections, [categoryId]: [...(build.selections[categoryId] ?? []), selection] } };
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

const sirenProduct = makeProduct({ id: 'siren-1', title: 'Wail Siren 100W' });
const consoleProduct = makeProduct({ id: 'console-1', title: 'Patrol Console' });

// ---------------------------------------------------------------------------
// Scoring weights — centralized and documented
// ---------------------------------------------------------------------------
describe('RECOMMENDATION_SCORE_WEIGHTS', () => {
  it('matches the documented deterministic weights', () => {
    const { RECOMMENDATION_SCORE_WEIGHTS } = modules.recommendationsDomain;
    assert.equal(RECOMMENDATION_SCORE_WEIGHTS.FILLS_MISSING_REQUIRED_CATEGORY, 50);
    assert.equal(RECOMMENDATION_SCORE_WEIGHTS.MATCHES_GUIDED_STEP, 40);
    assert.equal(RECOMMENDATION_SCORE_WEIGHTS.MATCHES_DEPARTMENT_STANDARD, 30);
    assert.equal(RECOMMENDATION_SCORE_WEIGHTS.FILLS_MISSING_RECOMMENDED_CATEGORY, 25);
    assert.equal(RECOMMENDATION_SCORE_WEIGHTS.MATCHES_BUILD_STYLE, 20);
    assert.equal(RECOMMENDATION_SCORE_WEIGHTS.COMPATIBLE_WITH_VEHICLE, 20);
    assert.equal(RECOMMENDATION_SCORE_WEIGHTS.FILLS_MISSING_OPTIONAL_CATEGORY, 10);
    assert.equal(RECOMMENDATION_SCORE_WEIGHTS.RELATED_TO_SELECTED_PRODUCT, 10);
    assert.equal(RECOMMENDATION_SCORE_WEIGHTS.ALREADY_SELECTED, -100);
    assert.equal(RECOMMENDATION_SCORE_WEIGHTS.INCOMPATIBLE_WITH_VEHICLE, -100);
  });
});

// ---------------------------------------------------------------------------
// scoreProductForBuild — reason generation and independent, additive signals
// ---------------------------------------------------------------------------
describe('scoreProductForBuild — missing required/recommended/optional category', () => {
  it('scores the required fill bonus (plus the standard-match bonus, since the category is also in the standard) and types "required"', () => {
    const { scoreProductForBuild, RECOMMENDATION_SCORE_WEIGHTS } = modules.recommendationsDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const score = scoreProductForBuild(sirenProduct, { build: makeBuild(), standard });

    assert.equal(score.score, RECOMMENDATION_SCORE_WEIGHTS.FILLS_MISSING_REQUIRED_CATEGORY + RECOMMENDATION_SCORE_WEIGHTS.MATCHES_DEPARTMENT_STANDARD);
    assert.deepEqual(score.reasonCodes.slice().sort(), ['fills_required_category', 'matches_department_standard'].sort());
    assert.match(score.reasons.join(' '), /Fills missing required category: Siren/);
    assert.equal(score.recommendationType, 'required');
    assert.equal(score.matchingCategoryId, 'siren');
  });

  it('scores the recommended fill bonus (plus the standard-match bonus) for a recommended-tier missing category', () => {
    const { scoreProductForBuild, RECOMMENDATION_SCORE_WEIGHTS } = modules.recommendationsDomain;
    const standard = makeStandard({ categories: { required: [], recommended: ['siren'], optional: [] } });
    const score = scoreProductForBuild(sirenProduct, { build: makeBuild(), standard });

    assert.equal(score.score, RECOMMENDATION_SCORE_WEIGHTS.FILLS_MISSING_RECOMMENDED_CATEGORY + RECOMMENDATION_SCORE_WEIGHTS.MATCHES_DEPARTMENT_STANDARD);
    assert.equal(score.recommendationType, 'recommended');
  });

  it('scores the optional fill bonus (plus the standard-match bonus) for an optional-tier missing category', () => {
    const { scoreProductForBuild, RECOMMENDATION_SCORE_WEIGHTS } = modules.recommendationsDomain;
    const standard = makeStandard({ categories: { required: [], recommended: [], optional: ['siren'] } });
    const score = scoreProductForBuild(sirenProduct, { build: makeBuild(), standard });

    assert.equal(score.score, RECOMMENDATION_SCORE_WEIGHTS.FILLS_MISSING_OPTIONAL_CATEGORY + RECOMMENDATION_SCORE_WEIGHTS.MATCHES_DEPARTMENT_STANDARD);
    assert.equal(score.recommendationType, 'optional');
  });

  it('does not award a fill bonus once the category already has a product', () => {
    const { scoreProductForBuild } = modules.recommendationsDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = withSelection(makeBuild(), 'siren', 'other-siren', 'Other Siren');
    const score = scoreProductForBuild(sirenProduct, { build, standard });

    assert.ok(!score.reasonCodes.includes('fills_required_category'));
  });
});

describe('scoreProductForBuild — matches department standard (independent of the fill bonus)', () => {
  it('awards +30 whenever the category appears in the standard at any tier, even if already filled', () => {
    const { scoreProductForBuild, RECOMMENDATION_SCORE_WEIGHTS } = modules.recommendationsDomain;
    const standard = makeStandard({ categories: { required: [], recommended: ['siren'], optional: [] } });
    const build = withSelection(makeBuild(), 'siren', 'other-siren', 'Other Siren');
    const score = scoreProductForBuild(sirenProduct, { build, standard });

    assert.ok(score.reasonCodes.includes('matches_department_standard'));
    assert.equal(score.score, RECOMMENDATION_SCORE_WEIGHTS.MATCHES_DEPARTMENT_STANDARD);
    assert.equal(score.matchingDepartmentStandardId, standard.id);
  });

  it('stacks with the fill bonus when the category is both in the standard and currently missing', () => {
    const { scoreProductForBuild, RECOMMENDATION_SCORE_WEIGHTS } = modules.recommendationsDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const score = scoreProductForBuild(sirenProduct, { build: makeBuild(), standard });

    assert.equal(
      score.score,
      RECOMMENDATION_SCORE_WEIGHTS.FILLS_MISSING_REQUIRED_CATEGORY + RECOMMENDATION_SCORE_WEIGHTS.MATCHES_DEPARTMENT_STANDARD,
    );
  });
});

describe('scoreProductForBuild — guided step match', () => {
  it('awards +40 when the product completes the current guided step', () => {
    const { scoreProductForBuild, RECOMMENDATION_SCORE_WEIGHTS } = modules.recommendationsDomain;
    const score = scoreProductForBuild(sirenProduct, { build: makeBuild(), standard: null, currentStepCategoryId: 'siren' });

    assert.ok(score.reasonCodes.includes('matches_guided_step'));
    assert.equal(score.score, RECOMMENDATION_SCORE_WEIGHTS.MATCHES_GUIDED_STEP);
    assert.equal(score.recommendationType, 'recommended');
  });

  it('does not fire for a different category step', () => {
    const { scoreProductForBuild } = modules.recommendationsDomain;
    const score = scoreProductForBuild(sirenProduct, { build: makeBuild(), standard: null, currentStepCategoryId: 'console' });
    assert.ok(!score.reasonCodes.includes('matches_guided_step'));
  });
});

describe('scoreProductForBuild — build style', () => {
  it('awards +20 and records matchingBuildStyleId when the category is a build style priority', () => {
    const { scoreProductForBuild, RECOMMENDATION_SCORE_WEIGHTS } = modules.recommendationsDomain;
    const build = makeBuild({ buildStyle: 'patrol' }); // priority: roof_lighting, siren, speaker, console
    const score = scoreProductForBuild(sirenProduct, { build, standard: null });

    assert.ok(score.reasonCodes.includes('matches_build_style'));
    assert.equal(score.matchingBuildStyleId, 'patrol');
    // No standard assigned — the build style's priority categories count as "recommended" tier too (guidedChecklist convention).
    assert.equal(
      score.score,
      RECOMMENDATION_SCORE_WEIGHTS.FILLS_MISSING_RECOMMENDED_CATEGORY + RECOMMENDATION_SCORE_WEIGHTS.MATCHES_BUILD_STYLE,
    );
  });

  it('does not fire for a category outside the active build style', () => {
    const { scoreProductForBuild } = modules.recommendationsDomain;
    const build = makeBuild({ buildStyle: 'fire_command' }); // priority: interior_lighting, siren, scene_lighting — no console
    const score = scoreProductForBuild(consoleProduct, { build, standard: null });
    assert.ok(!score.reasonCodes.includes('matches_build_style'));
  });
});

describe('scoreProductForBuild — vehicle compatibility', () => {
  it('awards +20 and marks "compatible" when the product vertical matches the build vehicle', () => {
    const { scoreProductForBuild, RECOMMENDATION_SCORE_WEIGHTS } = modules.recommendationsDomain;
    const build = makeBuild({ vehicle: { year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' } });
    const product = makeProduct({ id: 'compat-1', verticalIds: ['police'] });
    const score = scoreProductForBuild(product, { build, standard: null });

    assert.equal(score.compatibilityStatus, 'compatible');
    assert.ok(score.reasonCodes.includes('compatible_with_vehicle'));
    assert.equal(score.score, RECOMMENDATION_SCORE_WEIGHTS.COMPATIBLE_WITH_VEHICLE);
  });

  it('applies the -100 incompatible penalty when the product vertical does not match the build vehicle', () => {
    const { scoreProductForBuild, RECOMMENDATION_SCORE_WEIGHTS } = modules.recommendationsDomain;
    const build = makeBuild({ vehicle: { year: '2024', make: 'Ford', model: 'SuperDuty F-250', vertical: 'Work Truck' } });
    const product = makeProduct({ id: 'incompat-1', verticalIds: ['police'] });
    const score = scoreProductForBuild(product, { build, standard: null });

    assert.equal(score.compatibilityStatus, 'incompatible');
    assert.ok(score.reasonCodes.includes('incompatible_with_vehicle'));
    assert.equal(score.score, RECOMMENDATION_SCORE_WEIGHTS.INCOMPATIBLE_WITH_VEHICLE);
  });

  it('reports "unknown" (no bonus, no penalty) when there is no vehicle selected yet', () => {
    const { scoreProductForBuild } = modules.recommendationsDomain;
    const score = scoreProductForBuild(sirenProduct, { build: makeBuild(), standard: null });
    assert.equal(score.compatibilityStatus, 'unknown');
    assert.ok(!score.reasonCodes.includes('compatible_with_vehicle'));
    assert.ok(!score.reasonCodes.includes('incompatible_with_vehicle'));
  });
});

describe('scoreProductForBuild — already-selected penalty', () => {
  it('applies -100 and no other bonus when the product is already selected anywhere in the build', () => {
    const { scoreProductForBuild, RECOMMENDATION_SCORE_WEIGHTS } = modules.recommendationsDomain;
    const build = withSelection(makeBuild(), 'siren', 'siren-1', 'Wail Siren 100W');
    const score = scoreProductForBuild(sirenProduct, { build, standard: null });

    assert.deepEqual(score.reasonCodes, ['already_selected']);
    assert.equal(score.score, RECOMMENDATION_SCORE_WEIGHTS.ALREADY_SELECTED);
  });
});

describe('scoreProductForBuild — related/companion scoring', () => {
  it('awards +10 for a product related to a selection already in the build', () => {
    const { scoreProductForBuild, RECOMMENDATION_SCORE_WEIGHTS } = modules.recommendationsDomain;
    const build = withSelection(makeBuild(), 'roof_lighting', 'navigator', 'Navigator Light Bar');
    const valor = makeProduct({ id: 'valor', title: 'Valor Light Bar' });
    const score = scoreProductForBuild(valor, { build, standard: null, relatedProductIds: ['valor'] });

    assert.ok(score.reasonCodes.includes('related_to_selected_product'));
    assert.equal(score.score, RECOMMENDATION_SCORE_WEIGHTS.RELATED_TO_SELECTED_PRODUCT);
  });

  it('classifies a related product in the same (already-filled) category as an "upgrade"', () => {
    const { scoreProductForBuild } = modules.recommendationsDomain;
    const build = withSelection(makeBuild(), 'roof_lighting', 'navigator', 'Navigator Light Bar');
    const valor = makeProduct({ id: 'valor', title: 'Valor Light Bar' });
    const score = scoreProductForBuild(valor, { build, standard: null, relatedProductIds: ['valor'] });
    assert.equal(score.recommendationType, 'upgrade');
  });

  it('classifies a related product in a different category as a "companion"', () => {
    const { scoreProductForBuild } = modules.recommendationsDomain;
    const build = withSelection(makeBuild(), 'roof_lighting', 'navigator', 'Navigator Light Bar');
    const score = scoreProductForBuild(sirenProduct, { build, standard: null, relatedProductIds: ['siren-1'] });
    assert.equal(score.recommendationType, 'companion');
  });

  it('uses a custom relatedProductsReasonLabel when provided (product-detail context)', () => {
    const { scoreProductForBuild } = modules.recommendationsDomain;
    const score = scoreProductForBuild(sirenProduct, {
      build: null, standard: null, relatedProductIds: ['siren-1'], relatedProductsReasonLabel: 'Appears in related products',
    });
    assert.ok(score.reasons.includes('Appears in related products'));
  });
});

describe('scoreProductForBuild — replacement', () => {
  it('classifies a compatible candidate as a "replacement" when the filled category\'s current selection is flagged incompatible', () => {
    const { scoreProductForBuild } = modules.recommendationsDomain;
    const build = withSelection(makeBuild({ vehicle: { year: '2024', make: 'Ford', model: 'Explorer PIU', vertical: 'Police' } }), 'siren', 'old-siren', 'Old Siren', true);
    const replacement = makeProduct({ id: 'new-siren', title: 'Wail Siren 100W', verticalIds: ['police'] });
    const score = scoreProductForBuild(replacement, { build, standard: null });

    assert.equal(score.recommendationType, 'replacement');
    assert.equal(score.compatibilityStatus, 'compatible');
  });
});

// ---------------------------------------------------------------------------
// generateRecommendations — ranking, exclusion, capping
// ---------------------------------------------------------------------------
describe('generateRecommendations', () => {
  it('excludes already-selected products from the ranked list even when other signals are positive', () => {
    const { generateRecommendations } = modules.recommendationsDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = withSelection(makeBuild({ buildStyle: 'patrol' }), 'siren', 'siren-1', 'Wail Siren 100W');
    const results = generateRecommendations([sirenProduct], { build, standard, currentStepCategoryId: 'siren' });
    assert.deepEqual(results, []);
  });

  it('excludes incompatible products from the ranked list even when other signals are positive', () => {
    const { generateRecommendations } = modules.recommendationsDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = makeBuild({ buildStyle: 'patrol', vehicle: { year: '2024', make: 'Ford', model: 'SuperDuty F-250', vertical: 'Work Truck' } });
    const incompatible = makeProduct({ id: 'incompat-1', title: 'Wail Siren', verticalIds: ['police'] });
    const results = generateRecommendations([incompatible], { build, standard, currentStepCategoryId: 'siren' });
    assert.deepEqual(results, []);
  });

  it('ranks by descending score and assigns rank starting at 1', () => {
    const { generateRecommendations } = modules.recommendationsDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: ['console'], optional: [] } });
    const results = generateRecommendations([consoleProduct, sirenProduct], { build: makeBuild(), standard });

    assert.deepEqual(results.map((r) => r.productId), ['siren-1', 'console-1']);
    assert.deepEqual(results.map((r) => r.rank), [1, 2]);
  });

  it('caps the ranked list at the given limit', () => {
    const { generateRecommendations } = modules.recommendationsDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: ['console'], optional: [] } });
    const results = generateRecommendations([consoleProduct, sirenProduct], { build: makeBuild(), standard }, { limit: 1 });
    assert.equal(results.length, 1);
    assert.equal(results[0].productId, 'siren-1');
  });

  it('never recommends a product with no positive signal', () => {
    const { generateRecommendations } = modules.recommendationsDomain;
    const unrelated = makeProduct({ id: 'unrelated-1', title: 'Mystery Widget', marketing: {} });
    const results = generateRecommendations([unrelated], { build: makeBuild(), standard: null });
    assert.deepEqual(results, []);
  });
});

// ---------------------------------------------------------------------------
// resolveRelatedProductIdsForBuild
// ---------------------------------------------------------------------------
describe('resolveRelatedProductIdsForBuild', () => {
  it('collects related ids from every product already selected in the build', () => {
    const { resolveRelatedProductIdsForBuild } = modules.recommendationsDomain;
    const build = withSelection(makeBuild(), 'roof_lighting', 'navigator', 'Navigator');
    const getProduct = (id) => (id === 'navigator' ? { id: 'navigator', commerce: { related_products: ['valor', 'allegiant-max'] } } : null);
    assert.deepEqual(resolveRelatedProductIdsForBuild(build, { getProduct }).sort(), ['allegiant-max', 'valor']);
  });

  it('returns an empty list for a null build', () => {
    const { resolveRelatedProductIdsForBuild } = modules.recommendationsDomain;
    assert.deepEqual(resolveRelatedProductIdsForBuild(null, { getProduct: () => null }), []);
  });
});

// ---------------------------------------------------------------------------
// groupProductRelationships — Product Detail companion/upgrade split
// ---------------------------------------------------------------------------
describe('groupProductRelationships', () => {
  it('splits a same-category related product into upgrades and a different-category one into companions', () => {
    const { groupProductRelationships } = modules.recommendationsDomain;
    const navigator = makeProduct({ id: 'navigator', title: 'Navigator Light Bar', category: 'light-bars', commerce: { related_products: ['valor', 'siren-1'] } });
    const valor = makeProduct({ id: 'valor', title: 'Valor Light Bar', category: 'light-bars' });
    const pool = { navigator, valor, 'siren-1': sirenProduct };
    const deps = { getProduct: (id) => pool[id] ?? null, searchByCategory: () => [] };

    const groups = groupProductRelationships(navigator, deps, { limit: 3 });
    assert.deepEqual(groups.upgrades.map((p) => p.id), ['valor']);
    assert.deepEqual(groups.companions.map((p) => p.id), ['siren-1']);
  });

  it('excludes explicitly given product ids (e.g. already shown elsewhere on the page)', () => {
    const { groupProductRelationships } = modules.recommendationsDomain;
    const navigator = makeProduct({ id: 'navigator', title: 'Navigator Light Bar', category: 'light-bars', commerce: { related_products: ['valor'] } });
    const valor = makeProduct({ id: 'valor', title: 'Valor Light Bar', category: 'light-bars' });
    const deps = { getProduct: (id) => ({ navigator, valor }[id] ?? null), searchByCategory: () => [] };

    const groups = groupProductRelationships(navigator, deps, { limit: 3, excludeProductIds: ['valor'] });
    assert.deepEqual(groups.upgrades, []);
    assert.deepEqual(groups.companions, []);
  });

  it('degrades to empty groups when there is no relationship data', () => {
    const { groupProductRelationships } = modules.recommendationsDomain;
    const lonely = makeProduct({ id: 'lonely', title: 'Lonely Product' });
    const groups = groupProductRelationships(lonely, { getProduct: () => null, searchByCategory: () => [] });
    assert.deepEqual(groups, { companions: [], upgrades: [] });
  });
});

// ---------------------------------------------------------------------------
// resolveRecommendationProducts
// ---------------------------------------------------------------------------
describe('resolveRecommendationProducts', () => {
  it('drops recommendations whose product id no longer resolves', () => {
    const { resolveRecommendationProducts } = modules.recommendationsDomain;
    const recommendations = [
      { productId: 'siren-1', score: 50, rank: 1, reasonCodes: [], reasons: [], matchingCategoryId: 'siren', matchingDepartmentStandardId: null, matchingBuildStyleId: null, compatibilityStatus: 'unknown', recommendationType: 'required' },
      { productId: 'missing-1', score: 40, rank: 2, reasonCodes: [], reasons: [], matchingCategoryId: null, matchingDepartmentStandardId: null, matchingBuildStyleId: null, compatibilityStatus: 'unknown', recommendationType: 'recommended' },
    ];
    const getProduct = (id) => (id === 'siren-1' ? sirenProduct : null);
    const resolved = resolveRecommendationProducts(recommendations, getProduct);
    assert.equal(resolved.length, 1);
    assert.equal(resolved[0].product.id, 'siren-1');
  });
});

// ---------------------------------------------------------------------------
// summarizeRecommendedNextActions — Workspace summary
// ---------------------------------------------------------------------------
describe('summarizeRecommendedNextActions', () => {
  it('surfaces a build with missing required categories and its top recommendations', () => {
    const { summarizeRecommendedNextActions } = modules.recommendationsDomain;
    const standard = makeStandard({ categories: { required: ['siren', 'console'], recommended: [], optional: [] } });
    const build = makeBuild({ id: 'build-a', name: 'Build A' });
    const entries = [{ build, standard }];
    const products = [sirenProduct, consoleProduct];

    const actions = summarizeRecommendedNextActions(entries, products, { getProduct: (id) => products.find((p) => p.id === id) ?? null });
    assert.equal(actions.length, 1);
    assert.equal(actions[0].buildId, 'build-a');
    assert.deepEqual(actions[0].missingRequiredCategories.slice().sort(), ['console', 'siren']);
    assert.ok(actions[0].recommendations.length > 0);
  });

  it('omits a build with no required gap and nothing to recommend', () => {
    const { summarizeRecommendedNextActions } = modules.recommendationsDomain;
    const standard = makeStandard({ categories: { required: ['siren'], recommended: [], optional: [] } });
    const build = withSelection(makeBuild({ id: 'build-b' }), 'siren', 'siren-1');
    const unrelated = makeProduct({ id: 'unrelated-1', title: 'Mystery Widget' });
    const actions = summarizeRecommendedNextActions([{ build, standard }], [unrelated], { getProduct: () => null });
    assert.deepEqual(actions, []);
  });

  it('sorts most-urgent (most missing required categories) first and caps at limitBuilds', () => {
    const { summarizeRecommendedNextActions } = modules.recommendationsDomain;
    const standardMany = makeStandard({ id: 's-many', categories: { required: ['siren', 'console', 'push_bumper'], recommended: [], optional: [] } });
    const standardFew = makeStandard({ id: 's-few', categories: { required: ['siren'], recommended: [], optional: [] } });
    const entries = [
      { build: makeBuild({ id: 'build-few' }), standard: standardFew },
      { build: makeBuild({ id: 'build-many' }), standard: standardMany },
    ];
    const actions = summarizeRecommendedNextActions(entries, [], { getProduct: () => null }, { limitBuilds: 1 });
    assert.equal(actions.length, 1);
    assert.equal(actions[0].buildId, 'build-many');
  });
});

// ---------------------------------------------------------------------------
// RecommendationCard — shared compact card, mobile-safe
// ---------------------------------------------------------------------------
describe('RecommendationCard', () => {
  const recommendation = {
    productId: 'siren-1', score: 90, rank: 1,
    reasonCodes: ['fills_required_category'], reasons: ['Fills missing required category: Siren'],
    matchingCategoryId: 'siren', matchingDepartmentStandardId: 'standard-1', matchingBuildStyleId: null,
    compatibilityStatus: 'unknown', recommendationType: 'required',
  };

  it('renders the product name, category, type badge, reasons, and a View Product link', () => {
    const { default: RecommendationCard } = modules.recommendationCard;
    const html = renderWithProviders(React.createElement(RecommendationCard, { recommendation, product: sirenProduct }));
    assert.match(html, /Wail Siren 100W/);
    assert.match(html, /Siren/);
    assert.match(html, /Required/);
    assert.match(html, /Fills missing required category: Siren/);
    assert.match(html, /View Product/);
  });

  it('renders an Add to Build button only when onAddToBuild is provided, with a tap target at least 44px tall', () => {
    const { default: RecommendationCard } = modules.recommendationCard;
    const withCallback = renderWithProviders(React.createElement(RecommendationCard, { recommendation, product: sirenProduct, onAddToBuild: () => {}, addLabel: 'Add to Build' }));
    assert.match(withCallback, /Add to Build/);
    assert.match(withCallback, /min-height:\s*44px/);

    const withoutCallback = renderWithProviders(React.createElement(RecommendationCard, { recommendation, product: sirenProduct }));
    assert.doesNotMatch(withoutCallback, /Add to Build/);
  });

  it('RecommendationCardGrid uses a mobile-safe, non-overflowing responsive grid', () => {
    const { RecommendationCardGrid } = modules.recommendationCard;
    const html = renderPure(React.createElement(RecommendationCardGrid, null, React.createElement('span', null, 'child')));
    assert.match(html, /grid-cols-1 sm:grid-cols-2 lg:grid-cols-3/);
  });
});

// ---------------------------------------------------------------------------
// Guided Upfit Builder integration — recommendation panel per step
// ---------------------------------------------------------------------------
describe('UpfitBuilderCategoryStep — recommendation panel', () => {
  const step = {
    categoryId: 'siren', label: 'Siren', tier: 'required', status: 'missing',
    selectedProducts: [], missingCopy: 'Required for department compliance.', canSkip: false,
  };

  it('renders scored recommendation cards with reasons when recommendations are available', () => {
    const { default: UpfitBuilderCategoryStep } = modules.upfitBuilderCategoryStep;
    const recommendation = {
      productId: 'siren-1', score: 50, rank: 1, reasonCodes: ['fills_required_category'],
      reasons: ['Fills missing required category: Siren'], matchingCategoryId: 'siren',
      matchingDepartmentStandardId: null, matchingBuildStyleId: null, compatibilityStatus: 'unknown', recommendationType: 'required',
    };
    const html = renderWithProviders(React.createElement(UpfitBuilderCategoryStep, {
      step, suggestedProducts: [sirenProduct], recommendations: [{ recommendation, product: sirenProduct }],
      browseHref: '/search?q=Siren', onAddProduct: () => {}, onRemoveProduct: () => {}, onSkip: () => {}, onUnskip: () => {}, onNext: () => {}, onBack: () => {},
    }));
    assert.match(html, /Recommended Products/);
    assert.match(html, /Fills missing required category: Siren/);
    assert.doesNotMatch(html, /No matching products found/);
  });

  it('falls back to Suggested Products when there are no scored recommendations', () => {
    const { default: UpfitBuilderCategoryStep } = modules.upfitBuilderCategoryStep;
    const html = renderWithProviders(React.createElement(UpfitBuilderCategoryStep, {
      step, suggestedProducts: [sirenProduct], recommendations: [],
      browseHref: '/search?q=Siren', onAddProduct: () => {}, onRemoveProduct: () => {}, onSkip: () => {}, onUnskip: () => {}, onNext: () => {}, onBack: () => {},
    }));
    assert.match(html, /Suggested Products/);
    assert.doesNotMatch(html, /Recommended Products/);
  });
});

// ---------------------------------------------------------------------------
// Finish Your Upfit panel integration — top 3 recommended products
// ---------------------------------------------------------------------------
describe('FinishYourUpfitPanelView — Recommended Products for This Build', () => {
  it('renders up to 3 scored recommendation cards for the active build', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = makeBuild();
    const recommendation = {
      productId: 'siren-1', score: 50, rank: 1, reasonCodes: ['fills_required_category'],
      reasons: ['Fills missing required category: Siren'], matchingCategoryId: 'siren',
      matchingDepartmentStandardId: null, matchingBuildStyleId: null, compatibilityStatus: 'unknown', recommendationType: 'required',
    };
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild], activeBuild, product: { id: 'p1' },
      recommendedProducts: [{ recommendation, product: sirenProduct }],
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {}, onApplyTemplate: () => {}, onCloneActiveBuild: () => {}, onAddToCurrentStep: () => {}, onAddRecommendedProduct: () => {},
    }));
    assert.match(html, /Recommended Products for This Build/);
    assert.match(html, /Wail Siren 100W/);
  });

  it('shows an empty note when there is nothing to recommend', () => {
    const { FinishYourUpfitPanelView } = modules.finishYourUpfitPanel;
    const activeBuild = makeBuild();
    const html = renderWithProviders(React.createElement(FinishYourUpfitPanelView, {
      builds: [activeBuild], activeBuild, product: { id: 'p1' }, recommendedProducts: [],
      onAddToActiveBuild: () => {}, onOpenFleetBuilds: () => {}, onApplyTemplate: () => {}, onCloneActiveBuild: () => {}, onAddToCurrentStep: () => {}, onAddRecommendedProduct: () => {},
    }));
    assert.match(html, /No additional product recommendations right now/);
  });
});

// ---------------------------------------------------------------------------
// Product Detail integration — Product Intelligence companions/upgrades
// ---------------------------------------------------------------------------
describe('ProductIntelligencePanelView — companion/upgrade sections', () => {
  it('renders Companion Products and Upgrade / Alternative Products sections', () => {
    const { ProductIntelligencePanelView } = modules.productIntelligencePanel;
    const companion = makeProduct({ id: 'companion-1', title: 'PA Speaker', category: 'sirens-speakers' });
    const upgrade = makeProduct({ id: 'upgrade-1', title: 'Valor Light Bar', category: 'light-bars' });
    const html = renderWithProviders(React.createElement(ProductIntelligencePanelView, {
      product: sirenProduct, matches: [], commonlyInstalledWith: [],
      relationshipGroups: { companions: [companion], upgrades: [upgrade] },
      verticalId: 'police', categoryId: 'sirens-speakers',
    }));
    assert.match(html, /Companion Products/);
    assert.match(html, /PA Speaker/);
    assert.match(html, /Upgrade \/ Alternative Products/);
    assert.match(html, /Valor Light Bar/);
  });

  it('still renders nothing when matches, commonlyInstalledWith, and relationshipGroups are all empty', () => {
    const { ProductIntelligencePanelView } = modules.productIntelligencePanel;
    const html = renderPure(React.createElement(ProductIntelligencePanelView, {
      product: sirenProduct, matches: [], commonlyInstalledWith: [], verticalId: 'police', categoryId: 'sirens-speakers',
    }));
    assert.equal(html, '');
  });
});

// ---------------------------------------------------------------------------
// Product Search integration — "Recommended for Your Build" (additive only)
// ---------------------------------------------------------------------------
describe('ProductSearchPage — Recommended for Your Build', () => {
  it('shows the section above regular results when a fleet build is active, without altering the results grid', () => {
    const seed = {
      tfr_fleet_projects: { projects: [{ id: 'proj-1', name: 'Project One', archived: false, createdAt: 1000, updatedAt: 1000 }], activeProjectId: 'proj-1' },
      tfr_fleet_builds: {
        builds: [makeBuild({ buildStyle: 'patrol' })],
        activeBuildIdByProject: { 'proj-1': 'build-1' },
      },
    };
    const html = withLocalStorage(seed, () => renderWithProviders(React.createElement(modules.productSearchPage.default), ['/search']));
    assert.match(html, /Recommended for Your Build/);
    // The main grid/filter layout is still present and unfiltered by the new section.
    assert.match(html, /pd-product-grid/);
    assert.match(html, /pd-filter-layout/);
  });

  it('omits the section when there is no active fleet build', () => {
    const html = renderWithProviders(React.createElement(modules.productSearchPage.default), ['/search']);
    assert.doesNotMatch(html, /Recommended for Your Build/);
  });
});

// ---------------------------------------------------------------------------
// Workspace integration — Recommended Next Actions
// ---------------------------------------------------------------------------
describe('RecommendedNextActionsSection', () => {
  it('shows a start-a-build empty state when there are no fleet builds yet', () => {
    const { default: RecommendedNextActionsSection } = modules.recommendedNextActionsSection;
    const html = renderWithProviders(React.createElement(RecommendedNextActionsSection, { actions: [], hasFleetBuilds: false, onAddToBuild: () => {}, onOpenFleetBuilds: () => {} }));
    assert.match(html, /Start a fleet build/);
  });

  it('shows a nothing-outstanding empty state when builds exist but nothing needs attention', () => {
    const { default: RecommendedNextActionsSection } = modules.recommendedNextActionsSection;
    const html = renderWithProviders(React.createElement(RecommendedNextActionsSection, { actions: [], hasFleetBuilds: true, onAddToBuild: () => {}, onOpenFleetBuilds: () => {} }));
    assert.match(html, /Nothing outstanding/);
  });

  it('renders each build\'s missing required categories and recommendation cards', () => {
    const { default: RecommendedNextActionsSection } = modules.recommendedNextActionsSection;
    const recommendation = {
      productId: 'siren-1', score: 50, rank: 1, reasonCodes: ['fills_required_category'],
      reasons: ['Fills missing required category: Siren'], matchingCategoryId: 'siren',
      matchingDepartmentStandardId: null, matchingBuildStyleId: null, compatibilityStatus: 'unknown', recommendationType: 'required',
    };
    const actions = [{
      buildId: 'build-1', buildName: 'Patrol Unit 12', projectId: 'proj-1',
      missingRequiredCategories: ['siren'],
      recommendations: [{ recommendation, product: sirenProduct }],
    }];
    const html = renderWithProviders(React.createElement(RecommendedNextActionsSection, { actions, hasFleetBuilds: true, onAddToBuild: () => {}, onOpenFleetBuilds: () => {} }));
    assert.match(html, /Patrol Unit 12/);
    assert.match(html, /Missing Siren/);
    assert.match(html, /Wail Siren 100W/);
    assert.match(html, /Continue in Guided Builder/);
  });
});

// ---------------------------------------------------------------------------
// Source-level wiring checks
// ---------------------------------------------------------------------------
describe('Source-level wiring', () => {
  it('WorkspaceDashboard.jsx composes RecommendedNextActionsSection', () => {
    const source = readFileSync(new URL('../src/pages/WorkspaceDashboard.jsx', import.meta.url), 'utf8');
    assert.match(source, /<RecommendedNextActionsSection/);
    assert.match(source, /summarizeRecommendedNextActions/);
  });

  it('FinishYourUpfitPanel.jsx wires generateRecommendations for Recommended Products', () => {
    const source = readFileSync(new URL('../src/components/fleetBuilds/FinishYourUpfitPanel.jsx', import.meta.url), 'utf8');
    assert.match(source, /generateRecommendations/);
    assert.match(source, /Recommended Products for This Build/);
  });

  it('GuidedUpfitBuilderPage.jsx wires generateRecommendations per category step', () => {
    const source = readFileSync(new URL('../src/pages/GuidedUpfitBuilderPage.jsx', import.meta.url), 'utf8');
    assert.match(source, /generateRecommendations/);
  });

  it('ProductSearchPage.jsx wires generateRecommendations without touching the results query', () => {
    const source = readFileSync(new URL('../src/pages/ProductSearchPage.jsx', import.meta.url), 'utf8');
    assert.match(source, /generateRecommendations/);
    assert.match(source, /Recommended for Your Build/);
  });

  it('ProductIntelligencePanel.jsx wires groupProductRelationships', () => {
    const source = readFileSync(new URL('../src/components/product/ProductIntelligencePanel.jsx', import.meta.url), 'utf8');
    assert.match(source, /groupProductRelationships/);
  });
});
